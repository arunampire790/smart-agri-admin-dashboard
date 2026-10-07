// Crop Advisory - a preview of the advice the farmer will get.
//
// Everything on this page comes from GET /farms/{id}/advisory/, which runs
// the backend rule engine fresh on each call and saves nothing. That keeps
// the page safe to open and refresh while the farmer-facing app is still
// being built: reload as often as you like, nobody's task list changes.
// "Save as tasks" is the one button that writes anything.
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Droplets, Sprout, Search, Wrench, Wheat, RefreshCw, ChevronDown,
  Thermometer, Wind, Sun, CloudRain, AlertTriangle, CheckCircle2, Info, Scale,
} from 'lucide-react';
import { useFarms } from '../../context/FarmContext';
import { useNotifications } from '../../context/NotificationContext';
import { advisoryApi } from '../../api/advisory';
import { useT } from '../../i18n';

const typeIcon = {
  Irrigation: Droplets,
  Fertilizer: Sprout,
  Inspection: Search,
  Maintenance: Wrench,
  Harvest: Wheat,
};

const typeColor = {
  Irrigation: '#3b82f6',
  Fertilizer: '#a16207',
  Inspection: '#8b5cf6',
  Maintenance: '#f97316',
  Harvest: '#2e9e6b',
};

const priorityStyle = {
  High: { bg: 'rgba(220,38,38,0.1)', color: '#dc2626', border: 'rgba(220,38,38,0.25)' },
  Medium: { bg: 'rgba(217,119,6,0.1)', color: '#b45309', border: 'rgba(217,119,6,0.25)' },
  Low: { bg: 'rgba(46,125,50,0.1)', color: '#2e7d32', border: 'rgba(46,125,50,0.2)' },
};

// Reading status -> colour. "Critical" is the only one worth alarming over;
// Low/High mean "outside the band" and read better as a warning.
const statusColor = {
  Optimal: '#16a34a',
  Low: '#d97706',
  High: '#d97706',
  Critical: '#dc2626',
  Unknown: '#9ca3af',
};

const card = {
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 16,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const fill = (template, values) =>
  Object.entries(values).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, value),
    template,
  );

function FarmSelect({ farms, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const selected = farms.find((f) => f.id === value);

  return (
    <div className="relative" ref={ref} style={{ width: 260 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-sm px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 w-full flex items-center justify-between cursor-pointer hover:border-gray-400"
        style={{ outline: 'none', boxShadow: open ? '0 0 0 2px rgba(52,199,89,0.3)' : 'none', transition: 'all 0.2s' }}
      >
        <span style={{ color: selected ? '#1a1a1a' : '#9ca3af' }}>
          {selected ? selected.name : placeholder}
        </span>
        <ChevronDown size={15} style={{ color: '#9ca3af', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 overflow-hidden" style={{ ...card, maxHeight: 280, overflowY: 'auto' }}>
          {farms.map((farm) => (
            <div
              key={farm.id}
              onClick={() => { onChange(farm.id); setOpen(false); }}
              className="px-3.5 py-2.5 text-sm cursor-pointer"
              style={{ background: farm.id === value ? 'rgba(76,175,80,0.1)' : 'transparent', color: '#1a1a1a' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(76,175,80,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = farm.id === value ? 'rgba(76,175,80,0.1)' : 'transparent'; }}
            >
              <div style={{ fontWeight: 500 }}>{farm.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{farm.owner} · {farm.crop || '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// A value on a track, with the healthy band shaded. Far more readable at a
// glance than a bare number - you can see how far outside the band it is.
function MetricBar({ label, value, unit, status, min, max, band, marks, t }) {
  const colour = statusColor[status] || statusColor.Unknown;
  const clamp = (n) => Math.min(Math.max(((n - min) / (max - min)) * 100, 0), 100);
  const hasValue = value !== null && value !== undefined;

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>
            {hasValue ? value : '—'}<span style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>{unit}</span>
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: colour, background: `${colour}1a`, padding: '2px 8px', borderRadius: 999 }}>
            {t(`status${status}`, status)}
          </span>
        </span>
      </div>

      <div style={{ position: 'relative', height: 8, background: '#f1f3f5', borderRadius: 999 }}>
        {band && (
          <div style={{
            position: 'absolute', top: 0, bottom: 0, borderRadius: 999,
            left: `${clamp(band[0])}%`, width: `${clamp(band[1]) - clamp(band[0])}%`,
            background: 'rgba(22,163,74,0.22)',
          }} />
        )}
        {hasValue && (
          <div style={{
            position: 'absolute', top: -3, width: 4, height: 14, borderRadius: 2,
            left: `calc(${clamp(value)}% - 2px)`, background: colour,
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          }} />
        )}
      </div>

      {marks && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: '#9ca3af' }}>
          {marks.map((m) => <span key={m}>{m}</span>)}
        </div>
      )}
    </div>
  );
}

function WeatherPanel({ weather, analysis, t }) {
  if (!weather) {
    return (
      <div style={{ ...card, padding: '24px 26px' }}>
        <SectionTitle icon={CloudRain} text={t('weather')} />
        <EmptyNote title={t('noWeather')} hint={t('weatherHint')} />
      </div>
    );
  }

  const rain = analysis?.rainNext48h || {};
  const risk = analysis?.diseaseRisk || 'Unknown';
  const riskColour = risk === 'High' ? '#dc2626' : risk === 'Moderate' ? '#d97706' : '#16a34a';

  return (
    <div style={{ ...card, padding: '24px 26px' }}>
      <SectionTitle icon={CloudRain} text={t('weather')} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{ fontSize: 38, fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>
          {Math.round(weather.temperature)}°
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{weather.condition}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {t('rainNext48h')}: {rain.chance ?? 0}% · {rain.totalMm ?? 0}mm
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 18 }}>
        <Stat icon={Droplets} label={t('humidity')} value={`${Math.round(weather.humidity)}%`} />
        <Stat icon={Wind} label={t('wind')} value={`${Math.round(weather.windSpeed)} kph`} />
        <Stat icon={Sun} label={t('uv')} value={weather.uvIndex} />
        <Stat icon={AlertTriangle} label={t('diseaseRisk')} value={risk} colour={riskColour} />
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>{t('forecast')}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {(weather.forecast || []).map((day) => (
          <div key={day.date} style={{
            flex: 1, textAlign: 'center', padding: '10px 4px',
            background: '#F7F9F8', borderRadius: 12, minWidth: 0,
          }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
              {new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{Math.round(day.max_temp)}°</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{Math.round(day.min_temp)}°</div>
            <div style={{ fontSize: 11, color: day.chance_of_rain >= 60 ? '#3b82f6' : '#9ca3af', marginTop: 4 }}>
              {day.chance_of_rain}%
            </div>
            <div style={{ fontSize: 10, color: '#9ca3af' }}>{day.total_precip_mm}mm</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 14, textAlign: 'right' }}>{t('poweredBy')}</div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, colour }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon size={15} style={{ color: colour || '#9ca3af', flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: colour || '#374151' }}>{value}</div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, text, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={17} style={{ color: '#2e7d2e' }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{text}</span>
      </div>
      {right}
    </div>
  );
}

function EmptyNote({ title, hint }) {
  return (
    <div style={{ padding: '20px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 13, color: '#6b7280' }}>{title}</div>
      {hint && (
        <code style={{
          display: 'inline-block', marginTop: 8, fontSize: 11, color: '#6b7280',
          background: '#F4F7F5', padding: '5px 10px', borderRadius: 6,
        }}>{hint}</code>
      )}
    </div>
  );
}

// The engine scores every finding rather than labelling it, so the badge can
// show its working. Without this the priority is just a colour to be argued
// with; with it, a farmer can see that "High" came from a measurement.
function PriorityBasis({ basis, priority, t }) {
  const [open, setOpen] = useState(false);
  const axes = [
    { key: 'severity', value: basis.severity, weight: basis.weights.severity },
    { key: 'urgency', value: basis.urgency, weight: basis.weights.urgency },
    { key: 'impact', value: basis.impact, weight: basis.weights.impact },
  ];
  const colour = priorityStyle[priority]?.color || '#6b7280';

  return (
    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed rgba(0,0,0,0.08)' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: '#6b7280' }}
      >
        <Scale size={12} />
        <span>
          {fill(t('priorityScore'), { score: basis.score, max: basis.maxScore })}
          {' → '}
          <strong style={{ color: colour }}>{t(`priority${priority}`, priority)}</strong>
        </span>
        <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div style={{ marginTop: 8 }}>
          {axes.map(({ key, value, weight }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 11.5, color: '#6b7280', width: 66, flexShrink: 0 }}>{t(key)}</span>
              <span style={{ display: 'flex', gap: 3 }}>
                {[1, 2, 3].map((step) => (
                  <span key={step} style={{
                    width: 16, height: 5, borderRadius: 999,
                    background: step <= value ? colour : 'rgba(0,0,0,0.08)',
                  }} />
                ))}
              </span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>
                {value} × {weight} = {value * weight}
              </span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
            {fill(t('priorityThresholds'), {
              high: basis.thresholds.high,
              medium: basis.thresholds.medium,
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ item, t }) {
  const Icon = typeIcon[item.type] || Info;
  const colour = typeColor[item.type] || '#6b7280';
  const priority = priorityStyle[item.priority] || priorityStyle.Low;

  return (
    <div style={{
      ...card,
      padding: '20px 22px',
      borderLeft: `4px solid ${priority.color}`,
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', gap: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: `${colour}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={19} style={{ color: colour }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{item.title}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: priority.color, background: priority.bg,
              border: `1px solid ${priority.border}`, padding: '2px 9px', borderRadius: 999,
            }}>
              {t(`priority${item.priority}`, item.priority)}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: colour, background: `${colour}14`, padding: '2px 9px', borderRadius: 999 }}>
              {item.type}
            </span>
            {!item.actionable && (
              <span style={{ fontSize: 11, color: '#9ca3af', background: '#f1f3f5', padding: '2px 9px', borderRadius: 999 }}>
                {t('fyi')}
              </span>
            )}
          </div>

          <p style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>
            {item.message}
          </p>

          {(item.reasons?.length > 0 || item.priorityBasis) && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#F7F9F8', borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 }}>
                {t('why')}
              </div>
              {item.reasons.map((reason) => (
                <div key={reason} style={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.7 }}>· {reason}</div>
              ))}
              {item.priorityBasis && (
                <PriorityBasis basis={item.priorityBasis} priority={item.priority} t={t} />
              )}
            </div>
          )}

          {item.actionable && (
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>
              {fill(t('dueIn'), { days: item.dueInDays })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Advisory() {
  const t = useT('advisory');
  const { farms, loading: farmsLoading } = useFarms();
  const { refresh: refreshNotifications } = useNotifications();

  const [pickedFarmId, setPickedFarmId] = useState(null);
  // The result is stamped with the farm it belongs to, so switching farms
  // shows the loader instead of a moment of the previous farm's advice.
  const [result, setResult] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Arriving from a notification, the farm to show is the one that suggestion
  // belongs to. Otherwise fall back to the first farm, so nothing has to be
  // written into state just to have a default.
  const { state: navState } = useLocation();
  const farmId = pickedFarmId ?? navState?.farmId ?? farms[0]?.id ?? null;

  useEffect(() => {
    if (!farmId) return undefined;
    let active = true;
    advisoryApi
      .preview(farmId)
      .then((data) => { if (active) { setResult({ farmId, data }); setError(null); } })
      .catch((err) => {
        if (active) { setResult(null); setError(err.message); }
        console.error('Advisory failed:', err);
      });
    return () => { active = false; };
  }, [farmId, reloadKey]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Only trust the result if it is for the farm currently selected.
  const data = result?.farmId === farmId ? result.data : null;
  const loading = Boolean(farmId) && !data && !error;

  const handleSelectFarm = (id) => {
    setPickedFarmId(id);
    setResult(null);
    setError(null);
  };

  const handleRefresh = () => {
    setResult(null);
    setError(null);
    setReloadKey((k) => k + 1);
  };

  const handleGenerate = async () => {
    if (!farmId) return;
    setSaving(true);
    try {
      const saved = await advisoryApi.generate(farmId);
      setResult({ farmId, data: saved });
      // Saving is what makes a suggestion real, so the bell has new rows now.
      refreshNotifications().catch(() => {});
      setToast(fill(t('savedToast'), {
        recs: saved.saved.recommendationsCreated + saved.saved.recommendationsUpdated,
        tasks: saved.saved.tasksCreated,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const analysis = data?.analysis;
  const quality = data?.dataQuality;
  const reading = data?.average24h || data?.reading;

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{t('title')}</h1>
          <p style={{ fontSize: 13.5, color: '#6b7280', margin: '4px 0 0' }}>{t('subtitle')}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <FarmSelect farms={farms} value={farmId} onChange={handleSelectFarm} placeholder={t('selectFarm')} />
          <button
            type="button"
            onClick={handleRefresh}
            disabled={!farmId || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px',
              borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: '#ffffff',
              fontSize: 13, fontWeight: 600, color: '#374151',
              cursor: !farmId || loading ? 'not-allowed' : 'pointer', opacity: !farmId || loading ? 0.6 : 1,
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {t('refresh')}
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!farmId || loading || saving || !data?.recommendations?.length}
            style={{
              padding: '10px 18px', borderRadius: 12, border: 'none', background: '#2e7d2e',
              fontSize: 13, fontWeight: 600, color: '#ffffff',
              cursor: !farmId || saving || !data?.recommendations?.length ? 'not-allowed' : 'pointer',
              opacity: !farmId || saving || !data?.recommendations?.length ? 0.5 : 1,
            }}
          >
            {saving ? t('generating') : t('generate')}
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', marginBottom: 20,
        background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 12,
      }}>
        <Info size={16} style={{ color: '#b45309', flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, color: '#92400e' }}>{t('previewNote')}</span>
      </div>

      {farmsLoading && <div style={{ ...card, padding: 40, textAlign: 'center', color: '#6b7280' }}>{t('loading')}</div>}

      {!farmsLoading && farms.length === 0 && (
        <div style={{ ...card, padding: 40, textAlign: 'center', color: '#6b7280' }}>{t('noFarms')}</div>
      )}

      {error && (
        <div style={{ ...card, padding: 20, borderColor: 'rgba(220,38,38,0.25)', color: '#dc2626', fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading && !data && farms.length > 0 && (
        <div style={{ ...card, padding: 40, textAlign: 'center', color: '#6b7280' }}>{t('loading')}</div>
      )}

      {data && (
        <>
          <div style={{
            ...card, padding: '22px 26px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {data.recommendations.length === 0
                ? <CheckCircle2 size={26} style={{ color: '#16a34a', flexShrink: 0 }} />
                : <AlertTriangle size={26} style={{ color: '#d97706', flexShrink: 0 }} />}
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>{data.summary}</div>
                <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
                  {data.farm.name} · {data.farm.crop || '—'} · {data.farm.soil || '—'}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'right' }}>
              <div>{t('lastUpdated')}: {new Date(data.generatedAt).toLocaleString()}</div>
              <div>{data.generatedBy}</div>
            </div>
          </div>

          {quality?.isStale && (
            <Banner colour="#b45309" bg="rgba(217,119,6,0.07)" border="rgba(217,119,6,0.2)"
              text={fill(t('dataStale'), { hours: Math.round(quality.readingAgeHours) })} />
          )}
          {quality?.robotCount === 0 && (
            <Banner colour="#dc2626" bg="rgba(220,38,38,0.06)" border="rgba(220,38,38,0.2)" text={t('noRobot')} />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: 20, marginBottom: 24 }}
            className="advisory-grid">
            <div style={{ ...card, padding: '24px 26px' }}>
              <SectionTitle
                icon={Thermometer}
                text={t('soilReadings')}
                right={reading && (
                  <span style={{ fontSize: 11.5, color: '#9ca3af' }}>
                    {data.average24h ? t('average24h') : fill(t('readingAge'), { hours: Math.round(data.reading?.ageHours ?? 0) })}
                  </span>
                )}
              />

              {!quality?.hasSensorData && (
                <EmptyNote title={t('noSensorData')} hint={t('seedHint')} />
              )}

              {quality?.hasSensorData && (
                <>
                  <MetricBar
                    t={t}
                    label={t('soilMoisture')}
                    value={analysis.moisture.value}
                    unit="%"
                    status={analysis.moisture.status}
                    min={0}
                    max={100}
                    band={[analysis.moisture.thresholds.low, analysis.moisture.thresholds.high]}
                    marks={['0%', `${t('refillPoint')} ${analysis.moisture.thresholds.low}%`, '100%']}
                  />

                  {Object.entries(analysis.nutrients).map(([key, nutrient]) => (
                    <MetricBar
                      key={key}
                      t={t}
                      label={nutrient.label}
                      value={nutrient.value}
                      unit=" mg/kg"
                      status={nutrient.status}
                      min={0}
                      max={Math.round(nutrient.target[1] * 1.5)}
                      band={nutrient.target}
                      marks={['0', `${t('target')} ${nutrient.target[0]}–${nutrient.target[1]}`, Math.round(nutrient.target[1] * 1.5)]}
                    />
                  ))}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '16px 0' }}>
                    <Stat icon={Thermometer} label={t('airTemp')} value={`${reading.temperature}°C`} />
                    <Stat icon={Thermometer} label={t('soilTemp')} value={`${reading.soilTemperature ?? '—'}°C`} />
                  </div>
                </>
              )}

              {/* pH comes from the farm's soil profile, not the robot, so it
                  still has something to show when no readings have arrived. */}
              {analysis?.ph?.value !== null && analysis?.ph?.value !== undefined && (
                <MetricBar
                  t={t}
                  label={t('soilPh')}
                  value={analysis.ph.value}
                  unit=""
                  status={analysis.ph.status}
                  min={3}
                  max={10}
                  band={analysis.ph.ideal}
                  marks={['3', `${t('target')} ${analysis.ph.ideal[0]}–${analysis.ph.ideal[1]}`, '10']}
                />
              )}
            </div>

            <WeatherPanel weather={data.weather} analysis={analysis} t={t} />
          </div>

          <SectionTitle icon={Sprout} text={t('recommendations')} />
          {data.recommendations.length === 0 ? (
            <div style={{ ...card, padding: 40, textAlign: 'center' }}>
              <CheckCircle2 size={30} style={{ color: '#16a34a', margin: '0 auto 10px' }} />
              <div style={{ fontSize: 14, color: '#6b7280' }}>{t('noRecommendations')}</div>
            </div>
          ) : (
            data.recommendations.map((item) => <RecommendationCard key={item.key} item={item} t={t} />)
          )}
        </>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 26, right: 26, zIndex: 200,
          background: '#142E1C', color: '#ffffff', padding: '13px 20px',
          borderRadius: 12, fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>{toast}</div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1000px) {
          .advisory-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

function Banner({ text, colour, bg, border }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', marginBottom: 16,
      background: bg, border: `1px solid ${border}`, borderRadius: 12,
    }}>
      <AlertTriangle size={16} style={{ color: colour, flexShrink: 0 }} />
      <span style={{ fontSize: 12.5, color: colour }}>{text}</span>
    </div>
  );
}
