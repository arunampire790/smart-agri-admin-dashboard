"""WeatherAPI.com client.

The advisory rules need two things the robot cannot measure: what the sky is
doing right now, and what it will do over the next few days. Soil moisture at
25% means "irrigate today" if the week is dry and "do nothing" if 30mm of rain
lands tomorrow, so the forecast is not decoration - it flips the advice.

Free tier gives 3 forecast days, which is the horizon every rule uses.
Set WEATHERAPI_KEY in the environment; without it the engine falls back to
whatever Weather rows are already stored.
"""

from datetime import timedelta

import requests
from django.conf import settings
from django.utils import timezone

from ..models import Weather

# WeatherAPI is usually well under a second, but a hung request must not hold
# a dashboard page open.
REQUEST_TIMEOUT = 10


class WeatherUnavailable(Exception):
    """No forecast could be obtained - missing key, no coordinates, API down."""


def farm_centroid(farm):
    """Middle of the farm's boundary polygon, as (lat, lng).

    Farms are drawn on the map as a ring of points; the weather for any one
    corner is the weather for the whole field, so the average is plenty.
    Returns None when the farm has no boundary yet.
    """
    points = farm.coordinates or []
    pairs = []
    for point in points:
        try:
            pairs.append((float(point["lat"]), float(point["lng"])))
        except (KeyError, TypeError, ValueError):
            continue

    if not pairs:
        return None

    return (
        sum(lat for lat, _ in pairs) / len(pairs),
        sum(lng for _, lng in pairs) / len(pairs),
    )


def fetch_forecast(lat, lng, days=3):
    """Raw WeatherAPI forecast payload for a point."""
    if not settings.WEATHERAPI_KEY:
        raise WeatherUnavailable(
            "WEATHERAPI_KEY is not set - export it before starting the server."
        )

    try:
        response = requests.get(
            f"{settings.WEATHERAPI_BASE_URL}/forecast.json",
            params={
                "key": settings.WEATHERAPI_KEY,
                "q": f"{lat},{lng}",
                "days": days,
                "aqi": "no",
                "alerts": "no",
            },
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException as exc:
        raise WeatherUnavailable(f"Could not reach WeatherAPI: {exc}") from exc

    if response.status_code != 200:
        # WeatherAPI puts a human-readable reason in the body for 4xx.
        detail = ""
        try:
            detail = response.json().get("error", {}).get("message", "")
        except ValueError:
            pass
        raise WeatherUnavailable(
            f"WeatherAPI returned {response.status_code}"
            + (f": {detail}" if detail else "")
        )

    return response.json()


def _trim_forecast(payload):
    """Keep only the daily fields the rules actually read."""
    days = []
    for entry in payload.get("forecast", {}).get("forecastday", []):
        day = entry.get("day", {})
        days.append(
            {
                "date": entry.get("date", ""),
                "max_temp": day.get("maxtemp_c"),
                "min_temp": day.get("mintemp_c"),
                "avg_temp": day.get("avgtemp_c"),
                "chance_of_rain": day.get("daily_chance_of_rain", 0),
                "total_precip_mm": day.get("totalprecip_mm", 0),
                "avg_humidity": day.get("avghumidity"),
                "max_wind_kph": day.get("maxwind_kph"),
                "uv": day.get("uv"),
                "condition": day.get("condition", {}).get("text", ""),
            }
        )
    return days


def refresh_farm_weather(farm, force=False):
    """Fetch and store the current conditions + forecast for one farm.

    Re-uses the last row if it is younger than WEATHER_CACHE_MINUTES, so a
    dashboard that opens the advisory five times does not burn five calls.
    Pass force=True to skip that.
    """
    if not force:
        cutoff = timezone.now() - timedelta(minutes=settings.WEATHER_CACHE_MINUTES)
        fresh = (
            Weather.objects.filter(farm=farm, recorded_at__gte=cutoff)
            .order_by("-recorded_at")
            .first()
        )
        if fresh is not None:
            return fresh

    centre = farm_centroid(farm)
    if centre is None:
        raise WeatherUnavailable(
            f"{farm.name} has no boundary drawn, so there is no location to "
            "look the weather up for."
        )

    payload = fetch_forecast(*centre)
    current = payload.get("current", {})
    forecast = _trim_forecast(payload)

    # Today's rain chance lives in the forecast, not in `current` - WeatherAPI
    # only reports precipitation that has already fallen.
    rain_probability = forecast[0]["chance_of_rain"] if forecast else 0

    return Weather.objects.create(
        farm=farm,
        temperature=current.get("temp_c") or 0,
        humidity=current.get("humidity") or 0,
        wind_speed=current.get("wind_kph") or 0,
        rain_probability=rain_probability or 0,
        pressure=current.get("pressure_mb") or 0,
        weather_condition=current.get("condition", {}).get("text", ""),
        uv_index=current.get("uv") or 0,
        forecast=forecast,
        recorded_at=timezone.now(),
    )


def latest_weather(farm):
    """Most recent stored reading for a farm, or None."""
    return Weather.objects.filter(farm=farm).order_by("-recorded_at").first()


def weather_for_advisory(farm, refresh=True):
    """The weather the engine should reason over.

    Tries for a live forecast, falls back to the last stored row, and returns
    None only when the farm has never had weather at all. The caller reports
    the miss; it does not stop the soil rules from running.
    """
    if refresh:
        try:
            return refresh_farm_weather(farm)
        except WeatherUnavailable:
            pass
    return latest_weather(farm)
