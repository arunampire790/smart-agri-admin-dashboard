"""The advisory engine: sensor readings + forecast -> what the farmer should do.

A robot reporting "soil moisture 22%" is not advice. Whether that means
"irrigate today" or "do nothing" depends on the soil (sand drains, clay
holds), the crop's stage (flowering plants drink far more than seedlings)
and above all on the sky - 30mm of rain tomorrow makes today's irrigation a
waste of water and diesel. This module holds that reasoning.

Every rule is a plain threshold check, deliberately: the farmer can be told
exactly why they were asked to do something ("nitrogen 34 mg/kg, below the
50 minimum"), the same inputs always give the same answer, and it runs
offline in milliseconds. The thresholds below are the tunable part - they are
general-purpose agronomy defaults and should be reviewed against local
extension-service figures before anyone farms on them.

Units: soil moisture %VWC, NPK mg/kg (ppm), temperature °C, wind kph,
rainfall mm.
"""

from dataclasses import dataclass, field
from datetime import timedelta

from django.db.models import Avg, Q
from django.utils import timezone

from ..models import Recommendation, Robot, SensorData, Task
from .weather import weather_for_advisory

GENERATED_BY = "Rule Engine v1"

# --- Soil moisture bands (%VWC) ------------------------------------------
# `dry`  - crop is stressed, water now
# `low`  - refill point, water within a couple of days
# `high` - above field capacity, roots start suffocating
MOISTURE_BANDS = {
    "sandy": {"dry": 20, "low": 30, "high": 60},
    "sand": {"dry": 20, "low": 30, "high": 60},
    "loamy": {"dry": 25, "low": 35, "high": 70},
    "loam": {"dry": 25, "low": 35, "high": 70},
    "silt": {"dry": 25, "low": 35, "high": 70},
    "silty": {"dry": 25, "low": 35, "high": 70},
    "clay": {"dry": 28, "low": 38, "high": 75},
    "black": {"dry": 28, "low": 38, "high": 75},
}
DEFAULT_MOISTURE_BAND = {"dry": 25, "low": 35, "high": 70}

# Stages where the crop is filling grain/fruit and a dry spell costs yield
# directly. Keep the refill point higher through these.
THIRSTY_STAGES = {
    "flowering",
    "fruiting",
    "grain filling",
    "grain-filling",
    "pod filling",
    "tuber formation",
    "heading",
    "milking",
}
THIRSTY_STAGE_BONUS = 5

# --- Nutrients (mg/kg) ---------------------------------------------------
NUTRIENT_BANDS = {
    "nitrogen": {
        "label": "Nitrogen (N)",
        "low": 50,
        "high": 140,
        "fix": "urea or ammonium sulphate",
    },
    "phosphorus": {
        "label": "Phosphorus (P)",
        "low": 25,
        "high": 50,
        "fix": "DAP or single super phosphate",
    },
    "potassium": {
        "label": "Potassium (K)",
        "low": 120,
        "high": 280,
        "fix": "muriate of potash",
    },
}
# Below this fraction of the minimum the shortage is severe, not marginal.
SEVERE_DEFICIT_RATIO = 0.6

# --- Soil pH -------------------------------------------------------------
PH_IDEAL = (6.0, 7.5)
PH_ACIDIC = 5.5
PH_ALKALINE = 8.0

# --- Weather thresholds --------------------------------------------------
RAIN_LIKELY_PCT = 60  # chance of rain that counts as "expect rain"
RAIN_MEANINGFUL_MM = 5  # enough to skip an irrigation
RAIN_HEAVY_MM = 25  # enough to wash fertiliser away / flatten a ripe crop
SPRAY_MAX_WIND_KPH = 15  # above this, spray drifts off the field
HEAT_STRESS_C = 38
FROST_C = 4
DISEASE_HUMIDITY_PCT = 80
DISEASE_TEMP_RANGE = (18, 30)

# --- Equipment -----------------------------------------------------------
STALE_READING_HOURS = 24
LOW_BATTERY_PCT = 20

# --- How priority is decided ---------------------------------------------
# No rule hands out a priority label. Each one scores what it found on three
# axes and the engine works the label out, so "High" means the same thing
# whether it came from the irrigation rule or the harvest rule - and the
# farmer can be shown exactly why something was ranked urgent instead of
# being asked to trust a badge.
#
#   severity - how far outside the safe range the reading actually sits.
#              Measured from the numbers wherever there is a band to measure
#              against, which is why it carries the most weight.
#   urgency  - how soon it has to happen. Read off the rule's own deadline
#              rather than stated twice, so the two can never disagree.
#   impact   - what it costs if nobody acts. A judgement call per rule:
#              a lost harvest is a 3, a pH reading drifting is a 1.
#
# Each axis is 0-3, so the worst possible finding scores 21.
SEVERITY_WEIGHT = 3
URGENCY_WEIGHT = 2
IMPACT_WEIGHT = 2
MAX_PRIORITY_SCORE = 3 * (SEVERITY_WEIGHT + URGENCY_WEIGHT + IMPACT_WEIGHT)

# Two-thirds of the scale is urgent, a third is worth scheduling, the rest
# is worth knowing. Tuned so that "crop is stressed right now" clears High
# and "pH is a little off" stays Low.
HIGH_SCORE = 14
MEDIUM_SCORE = 8

# Deadline in days -> urgency. Anything due tomorrow is as urgent as it gets.
URGENCY_BY_DUE_DAYS = [(1, 3), (3, 2), (7, 1)]


def deviation_severity(value, low, high, critical_low=None, critical_high=None):
    """0-3: how far outside its safe band a reading sits.

    Inside the band is 0. Past the critical point is 3. In between, the
    score climbs with the size of the miss rather than the fact of it, so a
    reading a hair under the threshold is not treated like a crisis.
    """
    if value is None:
        return 0

    if value < low:
        if critical_low is not None and value <= critical_low:
            return 3
        shortfall = (low - value) / low if low else 0
        return 2 if shortfall >= 0.2 else 1

    if value > high:
        if critical_high is not None and value >= critical_high:
            return 3
        excess = (value - high) / high if high else 0
        return 2 if excess >= 0.2 else 1

    return 0


@dataclass
class Finding:
    """One piece of advice, before it is written to the database."""

    key: str  # stable per rule, so re-runs update instead of duplicate
    type: str  # maps to Task.TYPES
    title: str
    message: str
    severity: int  # 0-3, measured against the safe band where there is one
    impact: int  # 0-3, what ignoring it costs
    reasons: list = field(default_factory=list)
    # False for "here is what's happening" notes that need no field work.
    actionable: bool = True
    due_in_days: int = 1

    @property
    def urgency(self):
        for limit, score in URGENCY_BY_DUE_DAYS:
            if self.due_in_days <= limit:
                return score
        return 0

    @property
    def score(self):
        return (
            self.severity * SEVERITY_WEIGHT
            + self.urgency * URGENCY_WEIGHT
            + self.impact * IMPACT_WEIGHT
        )

    @property
    def priority(self):
        if self.score >= HIGH_SCORE:
            return "High"
        if self.score >= MEDIUM_SCORE:
            return "Medium"
        return "Low"

    def as_dict(self):
        return {
            "key": self.key,
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "priority": self.priority,
            # Shipped with the advice so the UI can show the working, and so
            # a threshold change is visible rather than silent.
            "priorityBasis": {
                "severity": self.severity,
                "urgency": self.urgency,
                "impact": self.impact,
                "score": self.score,
                "maxScore": MAX_PRIORITY_SCORE,
                "weights": {
                    "severity": SEVERITY_WEIGHT,
                    "urgency": URGENCY_WEIGHT,
                    "impact": IMPACT_WEIGHT,
                },
                "thresholds": {"high": HIGH_SCORE, "medium": MEDIUM_SCORE},
            },
            "reasons": self.reasons,
            "actionable": self.actionable,
            "dueInDays": self.due_in_days,
        }


# =========================================================================
# Gathering the inputs
# =========================================================================


def farm_robots(farm):
    """Robots working this farm.

    Assignment is recorded in two places - the robot's own `farm` string and
    the farm's `assigned_robots` list - and they can drift, so read both.
    """
    return Robot.objects.filter(
        Q(farm=farm.name) | Q(id__in=list(farm.assigned_robots or []))
    ).distinct()


def latest_reading(robots):
    """Newest sensor sample from any of the farm's robots."""
    return (
        SensorData.objects.filter(robot__in=robots).order_by("-recorded_at").first()
    )


def average_reading(robots, hours=24):
    """Mean of the last `hours` of samples, so one odd spike is not advice.

    Returns None when nothing was recorded in the window.
    """
    since = timezone.now() - timedelta(hours=hours)
    rows = SensorData.objects.filter(robot__in=robots, recorded_at__gte=since)

    result = rows.aggregate(
        temperature=Avg("temperature"),
        humidity=Avg("humidity"),
        soil_moisture=Avg("soil_moisture"),
        soil_temperature=Avg("soil_temperature"),
        nitrogen=Avg("nitrogen"),
        phosphorus=Avg("phosphorus"),
        potassium=Avg("potassium"),
    )
    if result["soil_moisture"] is None:
        return None
    return {k: round(v, 1) for k, v in result.items() if v is not None}


def collect_state(farm, refresh_weather=True):
    """Everything the rules read, fetched once."""
    robots = list(farm_robots(farm))
    reading = latest_reading(robots)

    return {
        "farm": farm,
        "robots": robots,
        "reading": reading,
        "average": average_reading(robots),
        "reading_age_hours": (
            round((timezone.now() - reading.recorded_at).total_seconds() / 3600, 1)
            if reading
            else None
        ),
        "soil": getattr(farm, "soil_profile", None),
        "crops": list(farm.crops.filter(status="Active")),
        "weather": weather_for_advisory(farm, refresh=refresh_weather),
    }


# =========================================================================
# Small helpers the rules share
# =========================================================================


def moisture_band(state):
    """Refill thresholds for this farm's soil, nudged for the crop stage."""
    soil_name = (state["soil"].soil_type if state["soil"] else state["farm"].soil) or ""
    band = dict(MOISTURE_BANDS.get(soil_name.strip().lower(), DEFAULT_MOISTURE_BAND))

    if any(
        (crop.growth_stage or "").strip().lower() in THIRSTY_STAGES
        for crop in state["crops"]
    ):
        band["dry"] += THIRSTY_STAGE_BONUS
        band["low"] += THIRSTY_STAGE_BONUS
        band["stage_adjusted"] = True

    return band


def rain_outlook(weather, days=2):
    """Rain expected over the next `days` forecast days.

    Returns max chance %, total mm, and the first day rain actually lands -
    "60% tomorrow" and "60% on Thursday" call for different advice.
    """
    empty = {"chance": 0, "total_mm": 0.0, "first_wet_day": None, "days": 0}
    if weather is None or not weather.forecast:
        return empty

    window = weather.forecast[:days]
    if not window:
        return empty

    chance = max((d.get("chance_of_rain") or 0) for d in window)
    total = sum((d.get("total_precip_mm") or 0) for d in window)
    first_wet = next(
        (
            d.get("date")
            for d in window
            if (d.get("chance_of_rain") or 0) >= RAIN_LIKELY_PCT
            or (d.get("total_precip_mm") or 0) >= RAIN_MEANINGFUL_MM
        ),
        None,
    )
    return {
        "chance": chance,
        "total_mm": round(total, 1),
        "first_wet_day": first_wet,
        "days": len(window),
    }


def rain_will_water_the_crop(outlook):
    """True when the sky is about to do the irrigating for us."""
    return (
        outlook["chance"] >= RAIN_LIKELY_PCT
        and outlook["total_mm"] >= RAIN_MEANINGFUL_MM
    )


def band_status(value, low, high):
    if value is None:
        return "Unknown"
    if value < low:
        return "Low"
    if value > high:
        return "High"
    return "Optimal"


# =========================================================================
# Rules
# =========================================================================


def rule_equipment(state):
    """Advice is only as good as the data behind it - flag when it is missing."""
    findings = []
    farm = state["farm"]

    if not state["robots"]:
        findings.append(
            Finding(
                key="no-robot",
                type="Maintenance",
                title="No robot assigned to this farm",
                message=(
                    f"{farm.name} has no robot linked to it, so there are no soil "
                    "readings to advise on. Assign a robot, or connect one with "
                    "its QR sticker."
                ),
                # Nothing is wrong in the field - we just cannot see it.
                severity=2,
                impact=1,
                reasons=["No robot matches this farm"],
                due_in_days=7,
            )
        )
        return findings

    if state["reading"] is None:
        findings.append(
            Finding(
                key="no-sensor-data",
                type="Maintenance",
                title="Robot has never reported sensor data",
                message=(
                    "The robot is assigned but has not sent a single reading. "
                    "Check that it is powered on and within network range."
                ),
                # Every other rule is blind until this is fixed.
                severity=3,
                impact=1,
                reasons=["Zero sensor records for this farm"],
            )
        )
    elif state["reading_age_hours"] > STALE_READING_HOURS:
        hours = int(state["reading_age_hours"])
        findings.append(
            Finding(
                key="stale-sensor-data",
                type="Maintenance",
                title=f"No sensor data for {hours} hours",
                message=(
                    f"The last reading arrived {hours} hours ago. Advice below is "
                    "based on that stale sample - check the robot's power and "
                    "connection before acting on it."
                ),
                severity=1,
                impact=1,
                reasons=[f"Last reading {hours}h old"],
            )
        )

    flat = [r for r in state["robots"] if 0 < r.battery < LOW_BATTERY_PCT]
    if flat:
        names = ", ".join(f"{r.id} ({r.battery}%)" for r in flat)
        findings.append(
            Finding(
                key="low-battery",
                type="Maintenance",
                title="Robot battery low",
                message=f"Charge before the next scheduled run: {names}.",
                severity=1,
                impact=1,
                reasons=[f"Battery below {LOW_BATTERY_PCT}%: {names}"],
                due_in_days=1,
            )
        )

    return findings


def rule_irrigation(state):
    """The main event: water, hold, or drain."""
    reading = state["reading"]
    if reading is None:
        return []

    # Prefer the 24h average - a single sample can land right after a shower.
    moisture = (state["average"] or {}).get("soil_moisture", reading.soil_moisture)
    band = moisture_band(state)
    outlook = rain_outlook(state["weather"])
    crop = state["farm"].crop or "the crop"

    rain_note = ""
    if outlook["days"]:
        rain_note = (
            f" Forecast: {outlook['chance']}% chance of rain and "
            f"{outlook['total_mm']}mm over the next {outlook['days']} days."
        )

    reasons = [f"Soil moisture {moisture}% (refill point {band['low']}%)"]
    if band.get("stage_adjusted"):
        reasons.append("Refill point raised - crop is at a moisture-critical stage")
    if outlook["days"]:
        reasons.append(
            f"{outlook['chance']}% rain / {outlook['total_mm']}mm forecast"
        )

    # Measured off the band rather than assumed: 25% in clay and 25% in sand
    # are not the same problem, and the score follows the gap.
    severity = deviation_severity(
        moisture,
        band["low"],
        band["high"],
        critical_low=band["dry"],
        critical_high=band["high"] * 1.1,
    )
    reasons.append(f"Severity {severity}/3 from the {band['low']}-{band['high']}% band")

    if moisture > band["high"]:
        message = (
            f"Soil moisture is {moisture}%, above the {band['high']}% saturation "
            f"point for this soil. Stop irrigating and check that the field is "
            f"draining - waterlogged roots suffocate and invite root rot."
        )
        if outlook["total_mm"] >= RAIN_MEANINGFUL_MM:
            message += (
                f" {outlook['total_mm']}mm more rain is forecast, so clear the "
                "drainage channels today."
            )
        return [
            Finding(
                key="waterlogging",
                type="Inspection",
                title="Stop irrigation - field is waterlogged",
                message=message,
                severity=severity,
                # Drowned roots do not recover; this is as costly as a drought.
                impact=3,
                reasons=reasons,
            )
        ]

    if moisture < band["dry"]:
        if rain_will_water_the_crop(outlook) and outlook["first_wet_day"]:
            return [
                Finding(
                    key="irrigation-light",
                    type="Irrigation",
                    title="Light irrigation now, heavy rain is coming",
                    message=(
                        f"Soil moisture is {moisture}% - {crop} is already stressed "
                        f"at this level. Give a short holding irrigation today, but "
                        f"do not fill the profile: {outlook['total_mm']}mm of rain is "
                        f"forecast from {outlook['first_wet_day']}."
                    ),
                    severity=severity,
                    impact=3,
                    reasons=reasons,
                )
            ]
        return [
            Finding(
                key="irrigation-urgent",
                type="Irrigation",
                title="Irrigate today - crop is water-stressed",
                message=(
                    f"Soil moisture is {moisture}%, below the {band['dry']}% stress "
                    f"threshold for this soil. {crop.capitalize()} will start losing "
                    f"yield if this holds.{rain_note} Irrigate today, ideally early "
                    f"morning or after sunset to cut evaporation."
                ),
                severity=severity,
                # Water stress at any stage comes straight off the yield.
                impact=3,
                reasons=reasons,
            )
        ]

    if moisture < band["low"]:
        if rain_will_water_the_crop(outlook):
            return [
                Finding(
                    key="irrigation-hold",
                    type="Irrigation",
                    title="Hold irrigation - rain expected",
                    message=(
                        f"Soil moisture is {moisture}%, just under the {band['low']}% "
                        f"refill point, but {outlook['total_mm']}mm of rain is "
                        f"forecast (from {outlook['first_wet_day'] or 'soon'}). Skip "
                        f"this round and re-check after the rain."
                    ),
                    # The sky is handling it, so nothing is really wrong.
                    severity=0,
                    impact=0,
                    reasons=reasons,
                    actionable=False,
                    due_in_days=3,
                )
            ]
        return [
            Finding(
                key="irrigation-due",
                type="Irrigation",
                title="Irrigate within 48 hours",
                message=(
                    f"Soil moisture is {moisture}%, at the {band['low']}% refill "
                    f"point for this soil.{rain_note} Schedule irrigation in the "
                    f"next two days."
                ),
                severity=severity,
                impact=2,
                reasons=reasons,
                due_in_days=2,
            )
        ]

    return []


def rule_nutrients(state):
    """NPK shortfalls, held back when rain would wash the fertiliser away."""
    reading = state["reading"]
    if reading is None:
        return []

    source = state["average"] or {}
    outlook = rain_outlook(state["weather"], days=3)
    heavy_rain = outlook["total_mm"] >= RAIN_HEAVY_MM

    short = []
    excess = []
    for name, band in NUTRIENT_BANDS.items():
        value = source.get(name, getattr(reading, name))
        if value is None:
            continue
        if value < band["low"]:
            short.append((name, band, value))
        elif value > band["high"]:
            excess.append((name, band, value))

    findings = []

    if short:
        # The worst of the three sets the score - topping up two nutrients
        # while the third stays empty does not feed the crop.
        severity = max(
            deviation_severity(
                v, b["low"], b["high"], critical_low=b["low"] * SEVERE_DEFICIT_RATIO
            )
            for _, b, v in short
        )
        severe = severity >= 3
        lines = [
            f"{b['label']} at {v} mg/kg (needs {b['low']}+) - apply {b['fix']}"
            for _, b, v in short
        ]
        reasons = [f"{b['label']} {v} mg/kg, below {b['low']}" for _, b, v in short]
        reasons.append(f"Severity {severity}/3 from the worst of the three")

        if heavy_rain:
            message = (
                "Soil is short of "
                + ", ".join(b["label"] for _, b, _ in short)
                + f". Hold off applying it - {outlook['total_mm']}mm of rain is "
                "forecast over the next three days and it would wash straight off "
                "the field. Apply once the ground has drained.\n\n"
                + "\n".join(lines)
            )
            reasons.append(f"Application deferred: {outlook['total_mm']}mm rain forecast")
            due = 4
        else:
            message = (
                "Soil test is below the target range for "
                + ", ".join(b["label"] for _, b, _ in short)
                + ":\n\n"
                + "\n".join(lines)
                + "\n\nWater the field lightly after spreading so the nutrients "
                "reach the root zone."
            )
            due = 2 if severe else 5

        findings.append(
            Finding(
                key="nutrient-deficit",
                type="Fertilizer",
                title="Apply fertiliser - "
                + ", ".join(b["label"].split(" ")[0] for _, b, _ in short)
                + " below target",
                message=message,
                severity=severity,
                # Starved plants underperform all season, but not overnight.
                impact=2,
                reasons=reasons,
                due_in_days=due,
            )
        )

    if excess:
        lines = [f"{b['label']} at {v} mg/kg (target under {b['high']})" for _, b, v in excess]
        findings.append(
            Finding(
                key="nutrient-excess",
                type="Inspection",
                title="Stop applying "
                + ", ".join(b["label"].split(" ")[0] for _, b, _ in excess),
                message=(
                    "These nutrients are already above the useful range:\n\n"
                    + "\n".join(lines)
                    + "\n\nMore will not help the crop, costs money, and runs off "
                    "into the water table. Skip them in the next application."
                ),
                # Wastes money rather than harming the crop.
                severity=1,
                impact=1,
                reasons=lines,
                actionable=False,
                due_in_days=7,
            )
        )

    return findings


def rule_soil_ph(state):
    """pH locks nutrients away even when the soil test says they are there."""
    soil = state["soil"]
    if soil is None or soil.ph_value is None:
        return []

    ph = round(soil.ph_value, 1)
    low, high = PH_IDEAL

    if ph < PH_ACIDIC:
        return [
            Finding(
                key="ph-acidic",
                type="Fertilizer",
                title=f"Soil is strongly acidic (pH {ph})",
                message=(
                    f"At pH {ph} the crop cannot take up phosphorus or most trace "
                    f"elements no matter how much fertiliser goes on. Apply "
                    f"agricultural lime and re-test in 6-8 weeks; target pH "
                    f"{low}-{high}."
                ),
                # Past the acidic line the whole fertiliser budget is wasted.
                severity=3,
                impact=3,
                reasons=[f"Soil pH {ph}, below {PH_ACIDIC}"],
                due_in_days=14,
            )
        ]

    if ph > PH_ALKALINE:
        return [
            Finding(
                key="ph-alkaline",
                type="Fertilizer",
                title=f"Soil is strongly alkaline (pH {ph})",
                message=(
                    f"At pH {ph} iron and zinc lock up and leaves yellow between "
                    f"the veins. Work in gypsum and organic matter, and re-test in "
                    f"6-8 weeks; target pH {low}-{high}."
                ),
                severity=3,
                impact=3,
                reasons=[f"Soil pH {ph}, above {PH_ALKALINE}"],
                due_in_days=14,
            )
        ]

    if not (low <= ph <= high):
        direction = "acidic" if ph < low else "alkaline"
        return [
            Finding(
                key="ph-drift",
                type="Inspection",
                title=f"Soil pH drifting {direction} ({ph})",
                message=(
                    f"pH {ph} is outside the {low}-{high} sweet spot but not yet "
                    f"doing damage. Keep an eye on it at the next soil test."
                ),
                severity=deviation_severity(ph, low, high),
                impact=1,
                reasons=[f"Soil pH {ph}, ideal {low}-{high}"],
                actionable=False,
                due_in_days=30,
            )
        ]

    return []


def rule_weather_extremes(state):
    """Heat, frost and downpours in the forecast window."""
    weather = state["weather"]
    if weather is None or not weather.forecast:
        return []

    findings = []

    hot = next(
        (d for d in weather.forecast if (d.get("max_temp") or 0) >= HEAT_STRESS_C),
        None,
    )
    if hot:
        findings.append(
            Finding(
                key="heat-stress",
                type="Irrigation",
                title=f"Heat stress expected on {hot['date']} ({hot['max_temp']}°C)",
                message=(
                    f"{hot['max_temp']}°C is forecast for {hot['date']}. Irrigate "
                    f"before sunrise so the soil holds moisture through the day, and "
                    f"do not spray or transplant in the afternoon heat."
                ),
                severity=3,
                # Scorched flowers do not set fruit; the day cannot be redone.
                impact=2,
                reasons=[f"Forecast max {hot['max_temp']}°C on {hot['date']}"],
            )
        )

    cold = next(
        (
            d
            for d in weather.forecast
            if d.get("min_temp") is not None and d["min_temp"] <= FROST_C
        ),
        None,
    )
    if cold:
        findings.append(
            Finding(
                key="frost-risk",
                type="Inspection",
                title=f"Frost risk on {cold['date']} ({cold['min_temp']}°C)",
                message=(
                    f"Overnight low of {cold['min_temp']}°C is forecast for "
                    f"{cold['date']}. Irrigate the evening before - wet soil holds "
                    f"heat - and cover or smoke young plants if you can."
                ),
                severity=3,
                # A frost can take the whole field in one night.
                impact=3,
                reasons=[f"Forecast min {cold['min_temp']}°C on {cold['date']}"],
            )
        )

    wet = next(
        (
            d
            for d in weather.forecast
            if (d.get("total_precip_mm") or 0) >= RAIN_HEAVY_MM
        ),
        None,
    )
    if wet:
        findings.append(
            Finding(
                key="heavy-rain",
                type="Inspection",
                title=f"Heavy rain on {wet['date']} ({wet['total_precip_mm']}mm)",
                message=(
                    f"{wet['total_precip_mm']}mm is forecast for {wet['date']}. Clear "
                    f"the drainage channels, and postpone any fertiliser or spray "
                    f"until after it passes - it would run straight off."
                ),
                # Clearing a drain is cheap; this is a heads-up, not a crisis.
                severity=1,
                impact=1,
                reasons=[f"{wet['total_precip_mm']}mm forecast on {wet['date']}"],
            )
        )

    return findings


def air_conditions(state):
    """Humidity and temperature to reason over, as (humidity, temp).

    Live weather wins - it covers the whole field, not one point of it. Falling
    back to the robot, prefer the 24-hour average for the same reason every
    other rule does: one sample taken at dawn or at noon says more about the
    hour than about the week.
    """
    weather = state["weather"]
    if weather is not None:
        return weather.humidity, weather.temperature

    source = state["average"] or {}
    reading = state["reading"]
    if not source and reading is None:
        return None, None
    return (
        source.get("humidity", reading.humidity if reading else None),
        source.get("temperature", reading.temperature if reading else None),
    )


def rule_disease_risk(state):
    """Warm and muggy is exactly what fungal spores want."""
    humidity, temp = air_conditions(state)
    if humidity is None or temp is None:
        return []

    lo, hi = DISEASE_TEMP_RANGE
    if humidity < DISEASE_HUMIDITY_PCT or not (lo <= temp <= hi):
        return []

    return [
        Finding(
            key="disease-risk",
            type="Inspection",
            title="High fungal disease risk",
            message=(
                f"Humidity is {round(humidity)}% at {round(temp)}°C - the window "
                f"where blight, mildew and rust take hold. Walk the field and check "
                f"the underside of leaves; a preventive spray now is cheaper than "
                f"treating an outbreak."
            ),
            # Conditions favour disease; nothing has actually been seen yet.
            severity=1,
            impact=2,
            reasons=[
                f"Humidity {round(humidity)}% (>= {DISEASE_HUMIDITY_PCT}%)",
                f"Temperature {round(temp)}°C (in {lo}-{hi}°C range)",
            ],
            due_in_days=2,
        )
    ]


def rule_spray_window(state):
    """Whether today is fit for spraying at all."""
    weather = state["weather"]
    if weather is None:
        return []

    today = weather.forecast[0] if weather.forecast else {}
    wind = max(weather.wind_speed or 0, today.get("max_wind_kph") or 0)
    rain = today.get("total_precip_mm") or 0
    chance = today.get("chance_of_rain") or 0

    blockers = []
    if wind > SPRAY_MAX_WIND_KPH:
        blockers.append(f"wind {round(wind)} kph (drifts above {SPRAY_MAX_WIND_KPH})")
    if chance >= RAIN_LIKELY_PCT or rain >= RAIN_MEANINGFUL_MM:
        blockers.append(f"{chance}% chance of rain, {rain}mm expected")

    if not blockers:
        return []

    return [
        Finding(
            key="poor-spray-window",
            type="Inspection",
            title="Poor spraying conditions today",
            message=(
                "Hold any pesticide or foliar spray: "
                + "; ".join(blockers)
                + ". It would drift off target or wash off before the plant takes "
                "it up. Wait for a calm, dry morning."
            ),
            # Costs a wasted tank of spray at worst.
            severity=1,
            impact=0,
            reasons=blockers,
            actionable=False,
            due_in_days=2,
        )
    ]


def rule_harvest(state):
    """Ripe crop plus a downpour is the most expensive thing on this list."""
    today = timezone.localdate()
    outlook = rain_outlook(state["weather"], days=3)
    findings = []

    for crop in state["crops"]:
        if not crop.expected_harvest_date:
            continue
        days_out = (crop.expected_harvest_date - today).days

        if days_out < 0:
            findings.append(
                Finding(
                    key=f"harvest-overdue-{crop.id}",
                    type="Harvest",
                    title=f"{crop.crop_name} harvest is {abs(days_out)} days overdue",
                    message=(
                        f"{crop.crop_name} ({crop.crop_variety}) was due on "
                        f"{crop.expected_harvest_date}. Every extra day in the field "
                        f"costs grain quality and invites pests. Harvest as soon as "
                        f"conditions allow."
                    ),
                    # The season's whole return is standing in the field.
                    severity=3,
                    impact=3,
                    reasons=[f"Expected harvest {crop.expected_harvest_date}"],
                )
            )
        elif days_out <= 7:
            if outlook["total_mm"] >= RAIN_HEAVY_MM:
                findings.append(
                    Finding(
                        key=f"harvest-before-rain-{crop.id}",
                        type="Harvest",
                        title=f"Harvest {crop.crop_name} before the rain",
                        message=(
                            f"{crop.crop_name} is due in {days_out} days and "
                            f"{outlook['total_mm']}mm of rain is forecast "
                            f"(from {outlook['first_wet_day']}). Bring the harvest "
                            f"forward if the crop is close enough - a flattened or "
                            f"sprouted field cannot be recovered."
                        ),
                        severity=3,
                        impact=3,
                        reasons=[
                            f"Harvest due in {days_out} days",
                            f"{outlook['total_mm']}mm rain forecast",
                        ],
                    )
                )
            else:
                findings.append(
                    Finding(
                        key=f"harvest-soon-{crop.id}",
                        type="Harvest",
                        title=f"{crop.crop_name} harvest in {days_out} days",
                        message=(
                            f"{crop.crop_name} ({crop.crop_variety}) is due on "
                            f"{crop.expected_harvest_date}. Book labour and transport, "
                            f"and service the harvester this week."
                        ),
                        # Nothing is wrong yet - this is booking labour.
                        severity=1,
                        impact=2,
                        reasons=[f"Expected harvest {crop.expected_harvest_date}"],
                        due_in_days=max(days_out - 2, 1),
                    )
                )

    return findings


RULES = [
    rule_equipment,
    rule_irrigation,
    rule_nutrients,
    rule_soil_ph,
    rule_weather_extremes,
    rule_disease_risk,
    rule_spray_window,
    rule_harvest,
]


# =========================================================================
# Running the engine
# =========================================================================


def build_analysis(state):
    """The "what do these numbers mean" layer, shown above the advice."""
    reading = state["reading"]
    source = state["average"] or {}
    band = moisture_band(state)
    weather = state["weather"]

    outlook = rain_outlook(weather)
    analysis = {
        "moisture": {"value": None, "status": "Unknown", "thresholds": band},
        "nutrients": {},
        "ph": {"value": None, "status": "Unknown", "ideal": list(PH_IDEAL)},
        "rainNext48h": {
            "chance": outlook["chance"],
            "totalMm": outlook["total_mm"],
            "firstWetDay": outlook["first_wet_day"],
            "days": outlook["days"],
        },
        "diseaseRisk": "Unknown",
    }

    if reading is not None:
        moisture = source.get("soil_moisture", reading.soil_moisture)
        analysis["moisture"] = {
            "value": moisture,
            "status": (
                "Critical"
                if moisture < band["dry"]
                else band_status(moisture, band["low"], band["high"])
            ),
            "thresholds": band,
        }
        for name, limits in NUTRIENT_BANDS.items():
            value = source.get(name, getattr(reading, name))
            analysis["nutrients"][name] = {
                "label": limits["label"],
                "value": value,
                "status": band_status(value, limits["low"], limits["high"]),
                "target": [limits["low"], limits["high"]],
            }

    if state["soil"] is not None and state["soil"].ph_value is not None:
        ph = round(state["soil"].ph_value, 1)
        analysis["ph"] = {
            "value": ph,
            "status": band_status(ph, *PH_IDEAL),
            "ideal": list(PH_IDEAL),
        }

    humidity, temp = air_conditions(state)
    if humidity is not None and temp is not None:
        lo, hi = DISEASE_TEMP_RANGE
        if humidity >= DISEASE_HUMIDITY_PCT and lo <= temp <= hi:
            analysis["diseaseRisk"] = "High"
        elif humidity >= DISEASE_HUMIDITY_PCT - 10:
            analysis["diseaseRisk"] = "Moderate"
        else:
            analysis["diseaseRisk"] = "Low"

    return analysis


def _serialise_reading(reading, age_hours):
    if reading is None:
        return None
    return {
        "robot": reading.robot_id,
        "recordedAt": reading.recorded_at.isoformat(),
        "ageHours": age_hours,
        "temperature": reading.temperature,
        "humidity": reading.humidity,
        "soilMoisture": reading.soil_moisture,
        "soilTemperature": reading.soil_temperature,
        "nitrogen": reading.nitrogen,
        "phosphorus": reading.phosphorus,
        "potassium": reading.potassium,
        "lightIntensity": reading.light_intensity,
        "windSpeed": reading.wind_speed,
        "rainfall": reading.rainfall,
    }


def _serialise_average(average):
    """Rename the aggregate's ORM field names to the camelCase the UI uses.

    The rules read `average` with the model's own field names; only the API
    boundary switches convention, matching the rest of the serializers.
    """
    if average is None:
        return None
    renamed = {
        "soil_moisture": "soilMoisture",
        "soil_temperature": "soilTemperature",
    }
    return {renamed.get(key, key): value for key, value in average.items()}


def _serialise_weather(weather):
    if weather is None:
        return None
    return {
        "temperature": weather.temperature,
        "humidity": weather.humidity,
        "windSpeed": weather.wind_speed,
        "rainProbability": weather.rain_probability,
        "pressure": weather.pressure,
        "condition": weather.weather_condition,
        "uvIndex": weather.uv_index,
        "recordedAt": weather.recorded_at.isoformat(),
        "forecast": weather.forecast,
    }


def run_advisory(farm, refresh_weather=True):
    """Analyse one farm and return the advice, without saving anything."""
    state = collect_state(farm, refresh_weather=refresh_weather)

    findings = []
    for rule in RULES:
        findings.extend(rule(state))
    # Rank on the score, not the label, so two "High" items still come out in
    # the order the engine actually judged them.
    findings.sort(key=lambda f: (-f.score, f.type))

    urgent = sum(1 for f in findings if f.priority == "High")
    actions = sum(1 for f in findings if f.actionable)
    if not findings:
        summary = "Everything is in range - no action needed today."
    else:
        summary = f"{actions} action{'s' if actions != 1 else ''} suggested"
        summary += f", {urgent} urgent." if urgent else "."

    return {
        "farm": {
            "id": farm.id,
            "name": farm.name,
            "owner": farm.owner,
            "crop": farm.crop,
            "soil": (state["soil"].soil_type if state["soil"] else farm.soil),
        },
        "generatedAt": timezone.now().isoformat(),
        "generatedBy": GENERATED_BY,
        "summary": summary,
        "dataQuality": {
            "hasSensorData": state["reading"] is not None,
            "readingAgeHours": state["reading_age_hours"],
            "isStale": (
                state["reading_age_hours"] is not None
                and state["reading_age_hours"] > STALE_READING_HOURS
            ),
            "hasWeather": state["weather"] is not None,
            "robotCount": len(state["robots"]),
            "activeCrops": len(state["crops"]),
        },
        "reading": _serialise_reading(state["reading"], state["reading_age_hours"]),
        "average24h": _serialise_average(state["average"]),
        "weather": _serialise_weather(state["weather"]),
        "analysis": build_analysis(state),
        "recommendations": [f.as_dict() for f in findings],
    }


def save_advisory(farm, result, create_tasks=True):
    """Write the advice to the database.

    Upserts on (farm, rule_key) so running the engine hourly refreshes each
    piece of advice rather than burying the farmer in duplicates, and retires
    anything the farm has since grown out of.
    """
    today = timezone.localdate()
    robot = next(iter(farm_robots(farm)), None)
    live_keys = []
    created_recs = 0
    updated_recs = 0
    created_tasks = 0

    for item in result["recommendations"]:
        live_keys.append(item["key"])
        recommendation, created = Recommendation.objects.update_or_create(
            farm=farm,
            rule_key=item["key"],
            defaults={
                "recommendation_type": item["type"],
                "title": item["title"],
                "message": item["message"],
                "priority": item["priority"],
                "priority_score": item["priorityBasis"]["score"],
                "generated_by": GENERATED_BY,
                "details": {
                    "reasons": item["reasons"],
                    "priorityBasis": item["priorityBasis"],
                    "analysis": result["analysis"],
                    "reading": result["reading"],
                },
            },
        )
        # A recommendation the farmer already dismissed stays dismissed unless
        # the situation got worse.
        if not created and recommendation.status == "Dismissed":
            if item["priority"] != "High":
                continue
            recommendation.status = "New"
            recommendation.save(update_fields=["status"])

        created_recs += int(created)
        updated_recs += int(not created)

        if not (create_tasks and item["actionable"]):
            continue

        _, task_created = Task.objects.update_or_create(
            farm=farm,
            recommendation=recommendation,
            defaults={
                "robot": robot,
                "title": item["title"],
                "description": item["message"],
                "task_type": item["type"],
                # Lands on the farm's owner - it is their field. The admin can
                # hand it to somebody else from the board.
                "assigned_to": farm.owner,
                "priority": item["priority"],
                # Carried through so two "High" tasks still rank against each
                # other on the board the way the engine judged them.
                "priority_score": item["priorityBasis"]["score"],
                "due_date": today + timedelta(days=item["dueInDays"]),
                "source": "Advisory",
            },
        )
        created_tasks += int(task_created)

    # Conditions changed - clear out advice that no longer applies, along with
    # the tasks it raised (unless someone already started on them).
    stale = Recommendation.objects.filter(farm=farm, generated_by=GENERATED_BY).exclude(
        rule_key__in=live_keys
    )
    Task.objects.filter(
        recommendation__in=stale, source="Advisory", status="Pending"
    ).delete()
    retired = stale.count()
    stale.delete()

    return {
        "recommendationsCreated": created_recs,
        "recommendationsUpdated": updated_recs,
        "recommendationsRetired": retired,
        "tasksCreated": created_tasks,
    }