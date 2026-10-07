// Robot Data - a stand-in for the robot's radio.
//
// The advisory engine is only as good as what reaches it, and right now
// nothing does: the machine does not exist yet. This page posts a reading to
// POST /sensor-data/ - the exact endpoint the robot's firmware will call - so
// the whole chain (reading -> analysis -> advice -> task) can be walked end to
// end today. When the hardware ships, this page is deleted and nothing else
// changes.
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Radio, ChevronDown, Send, AlertTriangle, CheckCircle2, ArrowRight, Info,
  Trash2, Droplets, Sprout, Search, Wrench, Wheat,
} from 'lucide-react';
import { useRobots } from '../../context/RobotContext';
import { useFarms } from '../../context/FarmContext';
import { sensorDataApi } from '../../api/sensorData';
import { advisoryApi } from '../../api/advisory';
import { useT } from '../../i18n';

// Deliberately the same situations the seeder uses, so a reading typed here
// and a seeded week of data tell the same story.
const PRESETS = {
  healthy: { labelKey: 'presetHealthy', colour: '#16a34a', values: { soil_moisture: 46, soil_temperature: 24, temperature: 28, humidity: 62, nitrogen: 95, phosphorus: 38, potassium: 190, light_intensity: 42000, wind_speed: 8, rainfall: 0, battery: 88 } },
  dry: { labelKey: 'presetDry', colour: '#d97706', values: { soil_moisture: 18, soil_temperature: 31, temperature: 37, humidity: 32, nitrogen: 58, phosphorus: 30, potassium: 150, light_intensity: 58000, wind_speed: 11, rainfall: 0, battery: 64 } },
  wet: { labelKey: 'presetWet', colour: '#3b82f6', values: { soil_moisture: 82, soil_temperature: 20, temperature: 23, humidity: 92, nitrogen: 45, phosphorus: 22, potassium: 110, light_intensity: 12000, wind_speed: 14, rainfall: 18, battery: 41 } },
  hungry: { labelKey: 'presetHungry', colour: '#a16207', values: { soil_moisture: 42, soil_temperature: 25, temperature: 29, humidity: 60, nitrogen: 26, phosphorus: 14, potassium: 78, light_intensity: 40000, wind_speed: 7, rainfall: 0, battery: 73 } },
  muggy: { labelKey: 'presetMuggy', colour: '#8b5cf6', values: { soil_moisture: 48, soil_temperature: 25, temperature: 27, humidity: 88, nitrogen: 72, phosphorus: 33, potassium: 165, light_intensity: 22000, wind_speed: 5, rainfall: 3, battery: 17 } },
};

// name -> unit + sane step, in the order a farmer would read them off.
// `battery` is the robot's own state rather than a soil measurement, so the
// backend stores it on the robot and it is what the Robots page cards show.
const FIELDS = [
  { name: 'battery', unit: '%', step: 1 },
  { name: 'soil_moisture', unit: '%', step: 0.1 },
  { name: 'soil_temperature', unit: '°C', step: 0.1 },
  { name: 'temperature', unit: '°C', step: 0.1 },
  { name: 'humidity', unit: '%', step: 0.1 },
  { name: 'nitrogen', unit: 'mg/kg', step: 1 },
  { name: 'phosphorus', unit: 'mg/kg', step: 1 },
  { name: 'potassium', unit: 'mg/kg', step: 1 },
  { name: 'light_intensity', unit: 'lux', step: 100 },
  { name: 'wind_speed', unit: 'kph', step: 0.1 },
  { name: 'rainfall', unit: 'mm', step: 0.1 },
];

// The locale keys are camelCase; the API fields are snake_case.
const labelKey = (name) => name.replace(/_(\w)/g, (_, c) => c.toUpperCase());

// Same icons and colours the advisory page uses, so a suggestion previewed
// here is recognisably the same one when you open it there.
const adviceIcon = {
  Irrigation: Droplets,
  Fertilizer: Sprout,
  Inspection: Search,
  Maintenance: Wrench,
  Harvest: Wheat,
};
const priorityColour = { High: '#dc2626', Medium: '#b45309', Low: '#2e7d32' };

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

function RobotSelect({ robots, value, onChange, placeholder, farmLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const selected = robots.find((r) => r.id === value);

  return (
    <div className="relative" ref={ref} style={{ width: 280 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-sm px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 w-full flex items-center justify-between cursor-pointer hover:border-gray-400"
        style={{ outline: 'none', boxShadow: open ? '0 0 0 2px rgba(52,199,89,0.3)' : 'none', transition: 'all 0.2s' }}
      >
        <span style={{ color: selected ? '#1a1a1a' : '#9ca3af' }}>
          {selected ? `${selected.id}${selected.farm ? ` · ${selected.farm}` : ''}` : placeholder}
        </span>
        <ChevronDown size={15} style={{ color: '#9ca3af', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 overflow-hidden" style={{ ...card, maxHeight: 300, overflowY: 'auto' }}>
          {robots.map((robot) => (
            <div
              key={robot.id}
              onClick={() => { onChange(robot.id); setOpen(false); }}
              className="px-3.5 py-2.5 text-sm cursor-pointer"
              style={{ background: robot.id === value ? 'rgba(76,175,80,0.1)' : 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(76,175,80,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = robot.id === value ? 'rgba(76,175,80,0.1)' : 'transparent'; }}
            >
              <div style={{ fontWeight: 500, color: '#1a1a1a' }}>{robot.id} · {robot.name}</div>
              <div style={{ fontSize: 12, color: robot.farm ? '#6b7280' : '#dc2626' }}>
                {robot.farm ? fill(farmLabel, { farm: robot.farm }) : '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RobotData() {
  const t = useT('robotData');
  const navigate = useNavigate();
  const { robots, refreshRobots } = useRobots();
  const { farms } = useFarms();

  const [pickedRobotId, setPickedRobotId] = useState(null);
  // Readings are only useful once a robot is attached to a farm, so those
  // sort to the front rather than being hidden - a robot with no farm is
  // exactly the case the warning below explains.
  const sorted = [...(robots || [])].sort((a, b) => Number(Boolean(b.farm)) - Number(Boolean(a.farm)));
  // A "robot has not reported" notification names the farm, so open on that
  // farm's robot rather than making the admin find it.
  const { state: navState } = useLocation();
  const focusedRobot = navState?.focus
    ? sorted.find((r) => r.farm === navState.focus)
    : null;
  const robotId = pickedRobotId ?? focusedRobot?.id ?? sorted[0]?.id ?? null;
  const robot = sorted.find((r) => r.id === robotId) || null;
  const farm = robot?.farm ? (farms || []).find((f) => f.name === robot.farm) : null;

  const [values, setValues] = useState(PRESETS.healthy.values);
  const [activePreset, setActivePreset] = useState('healthy');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sentAt, setSentAt] = useState(null);
  // On by default: the point of this page is "send this, see that", and the
  // engine's 24-hour average quietly breaks that as soon as a second reading
  // lands. Turn it off to build up a history on purpose.
  const [replaceHistory, setReplaceHistory] = useState(true);
  // The advice that came back for what was just sent - the whole reason for
  // typing numbers here, so it is shown in place rather than a page away.
  const [advice, setAdvice] = useState(null);

  const [recent, setRecent] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!robotId) return undefined;
    let active = true;
    sensorDataApi
      .listForRobot(robotId, 8)
      .then((rows) => { if (active) setRecent({ robotId, rows }); })
      .catch((err) => { if (active) console.error('Failed to load readings:', err); });
    return () => { active = false; };
  }, [robotId, reloadKey]);

  const rows = recent?.robotId === robotId ? recent.rows : null;

  const applyPreset = (key) => {
    setValues(PRESETS[key].values);
    setActivePreset(key);
    setError(null);
  };

  const setField = (name, raw) => {
    setValues((prev) => ({ ...prev, [name]: raw }));
    // Once a number is touched the reading is no longer that preset.
    setActivePreset(null);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!robotId) { setError(t('errRobot')); return; }

    const numbers = {};
    for (const { name } of FIELDS) {
      const parsed = Number(values[name]);
      if (values[name] === '' || Number.isNaN(parsed)) { setError(t('errRequired')); return; }
      numbers[name] = parsed;
    }

    setSending(true);
    setError(null);
    setAdvice(null);
    try {
      if (replaceHistory) await sensorDataApi.clearForRobot(robotId);
      await sensorDataApi.create({ robot: robotId, ...numbers, sensor_status: 'Active' });
      // The reading carried a battery level, so the robot rows are now stale.
      await refreshRobots();
      setSentAt(Date.now());
      setReloadKey((k) => k + 1);
      // Read-only preview - this does not raise tasks or ring the bell.
      if (farm) setAdvice(await advisoryApi.preview(farm.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleClear = async () => {
    if (!robotId) return;
    try {
      await sensorDataApi.clearForRobot(robotId);
      setAdvice(null);
      setSentAt(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!sentAt) return undefined;
    const timer = setTimeout(() => setSentAt(null), 6000);
    return () => clearTimeout(timer);
  }, [sentAt]);

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{t('title')}</h1>
          <p style={{ fontSize: 13.5, color: '#6b7280', margin: '4px 0 0' }}>{t('subtitle')}</p>
        </div>
        <RobotSelect
          robots={sorted}
          value={robotId}
          onChange={(id) => { setPickedRobotId(id); setError(null); }}
          placeholder={t('selectRobot')}
          farmLabel={t('onFarm')}
        />
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', marginBottom: 20,
        background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 12,
      }}>
        <Info size={16} style={{ color: '#b45309', flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, color: '#92400e' }}>{t('previewNote')}</span>
      </div>

      {sorted.length === 0 && (
        <div style={{ ...card, padding: 40, textAlign: 'center', color: '#6b7280' }}>{t('noRobots')}</div>
      )}

      {robot && !robot.farm && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', marginBottom: 20,
          background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 12,
        }}>
          <AlertTriangle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: '#dc2626' }}>{t('noFarmWarning')}</span>
        </div>
      )}

      {robot && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 20 }}
          className="robot-data-grid">
          <form onSubmit={handleSend} style={{ ...card, padding: '24px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Radio size={17} style={{ color: '#2e7d2e' }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{t('presets')}</span>
            </div>
            <p style={{ fontSize: 12.5, color: '#9ca3af', margin: '0 0 12px' }}>{t('presetHint')}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {Object.entries(PRESETS).map(([key, preset]) => {
                const on = activePreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPreset(key)}
                    style={{
                      padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: on ? preset.colour : `${preset.colour}12`,
                      color: on ? '#ffffff' : preset.colour,
                      border: `1px solid ${on ? preset.colour : `${preset.colour}33`}`,
                    }}
                  >
                    {t(preset.labelKey)}
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 14 }}>
              {t('readingTitle')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
              {FIELDS.map(({ name, unit, step }) => (
                <div key={name}>
                  <label
                    htmlFor={`sensor-${name}`}
                    style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 }}
                  >
                    {t(labelKey(name))}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id={`sensor-${name}`}
                      type="number"
                      step={step}
                      value={values[name]}
                      onChange={(e) => setField(name, e.target.value)}
                      style={{
                        width: '100%', boxSizing: 'border-box', height: 40,
                        padding: '0 48px 0 12px', fontSize: 14, color: '#111827',
                        background: '#ffffff', border: '1px solid #D1D5DB', borderRadius: 8, outline: 'none',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#4caf50'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(76,175,80,0.15)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11.5, color: '#9ca3af', pointerEvents: 'none' }}>
                      {unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, fontSize: 12.5, color: '#dc2626' }}>
                {error}
              </div>
            )}

            {/* Without this the engine's 24-hour average blends every reading
                you have ever sent, and the advice stops tracking the numbers
                on screen - which is the whole point of the page. */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 20, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={replaceHistory}
                onChange={(e) => setReplaceHistory(e.target.checked)}
                style={{ marginTop: 2, width: 15, height: 15, accentColor: '#2e7d2e', cursor: 'pointer' }}
              />
              <span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{t('replaceHistory')}</span>
                <span style={{ display: 'block', fontSize: 11.5, color: '#9ca3af', marginTop: 1 }}>{t('replaceHistoryHint')}</span>
              </span>
            </label>

            {sentAt && (
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: '#15803d', flex: 1 }}>{t('sent')}</span>
                {farm && (
                  <button
                    type="button"
                    onClick={() => navigate('/admin/advisory', { state: { farmId: farm.id } })}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: '#15803d', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    {t('viewAdvisory')} <ArrowRight size={13} />
                  </button>
                )}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={sending}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '11px 22px', borderRadius: 12, border: 'none', background: '#2e7d2e',
                  fontSize: 13.5, fontWeight: 600, color: '#ffffff',
                  cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.6 : 1,
                }}
              >
                <Send size={15} />
                {sending ? t('sending') : t('send')}
              </button>

              {rows?.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '11px 16px', borderRadius: 12, background: 'transparent',
                    border: '1px solid rgba(220,38,38,0.25)', color: '#dc2626',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} />
                  {fill(t('clearHistory'), { n: rows.length })}
                </button>
              )}
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignSelf: 'start' }}>
          {advice && (
            <div style={{ ...card, padding: '24px 26px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
                {t('resultTitle')}
              </div>
              <div style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 14 }}>{advice.summary}</div>

              {advice.recommendations.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#16a34a' }}>
                  <CheckCircle2 size={16} />{t('resultNone')}
                </div>
              ) : (
                advice.recommendations.map((item) => {
                  const Icon = adviceIcon[item.type] || Info;
                  const colour = priorityColour[item.priority] || '#6b7280';
                  return (
                    <div key={item.key} style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      <Icon size={15} style={{ color: colour, flexShrink: 0, marginTop: 2 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                          <span style={{ color: colour, fontWeight: 600 }}>{item.priority}</span>
                          {' · '}{t('score')} {item.priorityBasis.score}/{item.priorityBasis.maxScore}
                          {' · '}{t('sev')} {item.priorityBasis.severity}
                          {' '}{t('urg')} {item.priorityBasis.urgency}
                          {' '}{t('imp')} {item.priorityBasis.impact}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* The engine reads the last 24 hours, so a stacked history is
                  the usual reason a bench reading seems to be ignored. */}
              {!replaceHistory && rows?.length > 1 && (
                <div style={{ marginTop: 12, padding: '9px 12px', background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 9, fontSize: 11.5, color: '#92400e' }}>
                  {fill(t('averagedWarning'), { n: rows.length })}
                </div>
              )}
            </div>
          )}

          <div style={{ ...card, padding: '24px 26px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 14 }}>
              {t('recent')}
            </div>

            {!rows || rows.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                {t('noReadings')}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#9ca3af', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                      <th style={{ padding: '0 8px 8px 0', fontWeight: 600 }}>{t('colTime')}</th>
                      <th style={{ padding: '0 8px 8px 0', fontWeight: 600 }}>{t('colMoisture')}</th>
                      <th style={{ padding: '0 8px 8px 0', fontWeight: 600, whiteSpace: 'nowrap' }}>{t('colTemp')}</th>
                      <th style={{ padding: '0 0 8px 0', fontWeight: 600, whiteSpace: 'nowrap' }}>{t('colNpk')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        <td style={{ padding: '9px 8px 9px 0', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {new Date(row.recorded_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '9px 8px 9px 0', fontWeight: 600, color: '#1a1a1a' }}>{row.soil_moisture}%</td>
                        <td style={{ padding: '9px 8px 9px 0', color: '#4b5563', whiteSpace: 'nowrap' }}>{row.temperature}° / {row.soil_temperature}°</td>
                        <td style={{ padding: '9px 0', color: '#4b5563', whiteSpace: 'nowrap' }}>{row.nitrogen} / {row.phosphorus} / {row.potassium}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1000px) {
          .robot-data-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
