import { useState, useMemo, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { computeConvexHull, computePolygonAreaAcres, haversineDistance, circleToPolygon } from '../../utils/farmArea';

const MAX_POINTS = 20;

function numberMarker(n) {
  return L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;border-radius:50%;background:#2e7d2e;border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#ffffff">${n}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function centerMarker() {
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#1a3a2a;border:3px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#ffffff">&#9679;</div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function isValidCoord(p) {
  return p && typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng) && isFinite(p.lat) && isFinite(p.lng) && p.lat >= -90 && p.lat <= 90 && p.lng >= -180 && p.lng <= 180;
}

function MapClickHandler({ onMapClick, disabled, drawMode, circleStep, onSetCenter, onSetRadius }) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      L.DomEvent.stopPropagation(e);
      if (drawMode === 'polygon') {
        onMapClick(e.latlng);
      } else if (drawMode === 'circle') {
        if (circleStep === 'center') {
          onSetCenter(e.latlng);
        } else {
          onSetRadius(e.latlng);
        }
      }
    },
  });
  return null;
}

function MapSync({ points }) {
  const map = useMap();
  const key = useMemo(() => (points || []).map(p => isValidCoord(p) ? `${p.lat.toFixed(4)},${p.lng.toFixed(4)}` : '').join('|'), [points]);
  const safe = useMemo(() => (points || []).filter(isValidCoord), [key]);
  useEffect(() => {
    if (safe.length === 0) map.setView([20, 0], 2);
    else if (safe.length === 1) map.flyTo([safe[0].lat, safe[0].lng], 12);
    else {
      const b = L.latLngBounds(safe.map(p => [p.lat, p.lng]));
      map.fitBounds(b, { padding: [30, 30] });
    }
  }, [map, key]);
  return null;
}

function MapInvalidator({ modalOpen }) {
  const map = useMap();
  useEffect(() => { if (modalOpen) setTimeout(() => map.invalidateSize(), 100); }, [modalOpen, map]);
  return null;
}

function CircleCenterHandler({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && isValidCoord(center)) {
      map.flyTo([center.lat, center.lng], 13);
    }
  }, [center, map]);
  return null;
}

const btnBase = { background: '#ffffff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s ease' };

export default function FarmMapDrawing({ initialCoords, initialCircleData, initialBoundaryType, initialClosed, onChange, onAcreageChange, modalOpen }) {
  const [drawMode, setDrawMode] = useState(() => initialBoundaryType || 'polygon');
  const [rawPoints, setRawPoints] = useState(() => initialBoundaryType === 'circle' ? [] : (initialCoords || []));
  const [polygonPoints, setPolygonPoints] = useState(() => initialBoundaryType === 'circle' ? [] : computeConvexHull(initialCoords || []));
  const [circle, setCircle] = useState(() => initialCircleData || null);
  const [circleStep, setCircleStep] = useState(() => initialCircleData ? 'done' : 'center');
  const [polygonClosed, setPolygonClosed] = useState(() => !!initialClosed);
  const [showCoords, setShowCoords] = useState(false);

  const safeRaw = useMemo(() => rawPoints.filter(isValidCoord), [rawPoints]);
  const safeHull = useMemo(() => polygonPoints.filter(isValidCoord), [polygonPoints]);

  const acreage = useMemo(() => {
    if (!polygonClosed) return null;
    if (drawMode === 'circle' && circle?.radius) {
      return parseFloat((Math.PI * circle.radius * circle.radius * 0.000247105).toFixed(1));
    }
    if (safeHull.length >= 3) return computePolygonAreaAcres(safeHull);
    return null;
  }, [polygonClosed, drawMode, circle, safeHull]);

  useEffect(() => { if (onAcreageChange) onAcreageChange(acreage); }, [acreage, onAcreageChange]);

  const emitChange = useCallback((hull, closed, mode, circ) => {
    if (onChange) {
      if (mode === 'circle' && circ) {
        onChange(circleToPolygon(circ.center, circ.radius), { boundaryType: 'circle', circleData: circ, polygonClosed: closed });
      } else {
        onChange(hull, { boundaryType: 'polygon', circleData: null, polygonClosed: closed });
      }
    }
  }, [onChange]);

  const addPoint = useCallback((latlng) => {
    if (safeRaw.length >= MAX_POINTS) return;
    const newP = { lat: latlng.lat, lng: latlng.lng };
    const updated = [...rawPoints, newP];
    const hull = computeConvexHull(updated);
    setRawPoints(updated);
    setPolygonPoints(hull);
    setPolygonClosed(false);
    emitChange(hull, false, 'polygon', null);
  }, [rawPoints, safeRaw.length, emitChange]);

  const handleSetCenter = useCallback((latlng) => {
    const c = { center: { lat: latlng.lat, lng: latlng.lng }, radius: 0 };
    setCircle(c);
    setCircleStep('radius');
    setPolygonClosed(false);
  }, []);

  const handleSetRadius = useCallback((latlng) => {
    if (!circle?.center) return;
    const r = haversineDistance(circle.center, { lat: latlng.lat, lng: latlng.lng });
    const c = { center: circle.center, radius: r };
    setCircle(c);
    setCircleStep('done');
    setPolygonClosed(false);
    emitChange(circleToPolygon(c.center, c.radius), false, 'circle', c);
  }, [circle, emitChange]);

  const handleRadiusSlider = useCallback((e) => {
    const r = Number(e.target.value);
    const c = { center: circle.center, radius: r };
    setCircle(c);
    if (r > 0) setCircleStep('done');
    emitChange(circleToPolygon(c.center, r), polygonClosed, 'circle', c);
  }, [circle, polygonClosed, emitChange]);

  const handleDone = useCallback(() => {
    if (drawMode === 'polygon' && safeHull.length < 3) return;
    if (drawMode === 'circle' && (!circle?.center || !circle?.radius)) return;
    setPolygonClosed(true);
    if (drawMode === 'polygon') {
      emitChange(safeHull, true, 'polygon', null);
    } else {
      emitChange(circleToPolygon(circle.center, circle.radius), true, 'circle', circle);
    }
  }, [drawMode, safeHull, circle, emitChange]);

  const handleUndo = useCallback(() => {
    if (drawMode === 'polygon') {
      if (rawPoints.length === 0) return;
      const updated = rawPoints.slice(0, -1);
      const hull = updated.length >= 3 ? computeConvexHull(updated) : updated;
      setRawPoints(updated);
      setPolygonPoints(hull);
      setPolygonClosed(false);
      emitChange(hull, false, 'polygon', null);
    } else if (drawMode === 'circle') {
      if (circleStep === 'done' || circleStep === 'radius') {
        setCircle(null);
        setCircleStep('center');
        setPolygonClosed(false);
        onChange([], { boundaryType: 'circle', circleData: null, polygonClosed: false });
      }
    }
  }, [drawMode, rawPoints, circleStep, emitChange, onChange]);

  const handleClear = useCallback(() => {
    if (drawMode === 'polygon') {
      setRawPoints([]);
      setPolygonPoints([]);
      setPolygonClosed(false);
      emitChange([], false, 'polygon', null);
    } else {
      setCircle(null);
      setCircleStep('center');
      setPolygonClosed(false);
      onChange([], { boundaryType: 'circle', circleData: null, polygonClosed: false });
    }
  }, [drawMode, emitChange, onChange]);

  const switchMode = useCallback((mode) => {
    setDrawMode(mode);
    setRawPoints([]);
    setPolygonPoints([]);
    setCircle(null);
    setCircleStep('center');
    setPolygonClosed(false);
    setShowCoords(false);
    emitChange([], false, mode, null);
  }, [emitChange]);

  const doneEnabled = (drawMode === 'polygon' && safeHull.length >= 3) || (drawMode === 'circle' && circle?.center && circle?.radius);

  let instructionText = '';
  if (polygonClosed) {
    instructionText = drawMode === 'polygon'
      ? `\u2713 Boundary set \u2014 ${safeRaw.length} point${safeRaw.length !== 1 ? 's' : ''}${acreage ? `, ${acreage} Est. Acres` : ''}`
      : `\u2713 Boundary set \u2014 ${Math.round(circle?.radius || 0)}m radius${acreage ? `, ${acreage} Est. Acres` : ''}`;
  } else if (drawMode === 'polygon') {
    if (safeRaw.length === 0) instructionText = 'Click anywhere on the map to place boundary points';
    else if (safeRaw.length < 3) instructionText = `Add at least ${3 - safeRaw.length} more point${3 - safeRaw.length !== 1 ? 's' : ''} (minimum 3 required)`;
    else instructionText = 'Polygon ready \u2014 add more points to refine or click \u2713 Done';
  } else {
    if (circleStep === 'center') instructionText = 'Click on the map to set circle center';
    else if (circleStep === 'radius') instructionText = 'Now click again to set the boundary radius';
    else instructionText = '\u2713 Circle boundary set \u2014 click to adjust radius';
  }

  return (
    <div style={{ border: '1px solid rgba(46,125,50,0.3)', borderRadius: '12px', overflow: 'hidden', position: 'relative', isolation: 'isolate', zIndex: 0 }}>
      <div style={{ display: 'flex', gap: '8px', padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.5)' }}>
        <button type="button" onClick={() => switchMode('polygon')}
          style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: drawMode === 'polygon' ? 'none' : '1px solid rgba(46,125,50,0.3)',
            background: drawMode === 'polygon' ? '#1a3a2a' : '#f1f8f1', color: drawMode === 'polygon' ? '#ffffff' : '#2e7d2e', transition: 'all 0.15s ease',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}
        ><i className="ph ph-polygon" /> Polygon Mode</button>
        <button type="button" onClick={() => switchMode('circle')}
          style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: drawMode === 'circle' ? 'none' : '1px solid rgba(46,125,50,0.3)',
            background: drawMode === 'circle' ? '#1a3a2a' : '#f1f8f1', color: drawMode === 'circle' ? '#ffffff' : '#2e7d2e', transition: 'all 0.15s ease',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}
        ><i className="ph ph-circle" /> Circle Mode</button>
      </div>

      <MapContainer center={[20, 0]} zoom={2} style={{ width: '100%', height: '260px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <MapClickHandler disabled={polygonClosed} drawMode={drawMode} circleStep={circleStep} onMapClick={addPoint} onSetCenter={handleSetCenter} onSetRadius={handleSetRadius} />
        <MapInvalidator modalOpen={modalOpen} />
        <MapSync points={drawMode === 'polygon' ? safeHull : (circle?.center ? [circle.center] : [])} />
        {drawMode === 'circle' && <CircleCenterHandler center={circle?.center} />}
        {drawMode === 'polygon' && safeRaw.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]} icon={numberMarker(i + 1)} />
        ))}
        {drawMode === 'polygon' && safeHull.length >= 3 && (
          <Polygon positions={safeHull.map(p => [p.lat, p.lng])} pathOptions={{ fillColor: '#2e7d2e', fillOpacity: 0.15, color: '#2e7d2e', weight: 2 }} />
        )}
        {drawMode === 'circle' && circle?.center && (
          <Marker position={[circle.center.lat, circle.center.lng]} icon={centerMarker()} />
        )}
        {drawMode === 'circle' && circle?.center && circle?.radius > 0 && (
          <Circle center={[circle.center.lat, circle.center.lng]} radius={circle.radius} pathOptions={{ fillColor: '#2e7d2e', fillOpacity: 0.15, color: '#2e7d2e', weight: 2 }} />
        )}
      </MapContainer>

      <div style={{ position: 'absolute', top: '52px', right: '8px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        <button type="button" onClick={handleDone} disabled={!doneEnabled || polygonClosed}
          style={{
            ...btnBase, background: polygonClosed ? '#e8f5e9' : doneEnabled ? '#1a3a2a' : '#ffffff', color: polygonClosed ? '#2e7d2e' : doneEnabled ? '#ffffff' : '#9ca3af', border: polygonClosed ? '1px solid rgba(46,125,50,0.3)' : doneEnabled ? 'none' : '1px solid rgba(0,0,0,0.08)',
            opacity: !doneEnabled && !polygonClosed ? 0.4 : 1, cursor: (doneEnabled || polygonClosed) ? 'pointer' : 'not-allowed', pointerEvents: (doneEnabled || polygonClosed) ? 'auto' : 'none',
          }}
          onMouseEnter={e => { if (doneEnabled && !polygonClosed) { e.currentTarget.style.background = '#2e7d2e'; } }}
          onMouseLeave={e => { if (doneEnabled && !polygonClosed) { e.currentTarget.style.background = '#1a3a2a'; } }}
        ><i className="ph ph-check" /> {polygonClosed ? 'Done' : '\u2713 Done'}</button>
        <button type="button" onClick={handleUndo} disabled={polygonClosed || (drawMode === 'polygon' ? rawPoints.length === 0 : !circle?.center)}
          style={{
            ...btnBase, opacity: (polygonClosed || (drawMode === 'polygon' ? rawPoints.length === 0 : !circle?.center)) ? 0.4 : 1,
            cursor: (polygonClosed || (drawMode === 'polygon' ? rawPoints.length === 0 : !circle?.center)) ? 'not-allowed' : 'pointer',
            pointerEvents: (polygonClosed || (drawMode === 'polygon' ? rawPoints.length === 0 : !circle?.center)) ? 'none' : 'auto',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
          onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
        ><i className="ph ph-arrow-u-up-left" /> Undo</button>
        <button type="button" onClick={handleClear}
          style={{ ...btnBase, color: '#dc2626' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
        ><i className="ph ph-trash" /> Clear</button>
        <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', color: polygonClosed ? '#2e7d2e' : '#374151', fontWeight: polygonClosed ? 600 : 500, boxShadow: '0 1px 4px rgba(0,0,0,0.12)', maxWidth: '300px' }}>
          {instructionText}
        </div>
      </div>

      {drawMode === 'circle' && circle?.center && circle?.radius > 0 && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.6)' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>
            Radius: <strong style={{ color: '#374151' }}>{Math.round(circle.radius)}</strong> meters
            {acreage ? ` (\u2248 ${acreage} acres)` : ''}
          </div>
          <input type="range" min="50" max="5000" step="10" value={circle.radius}
            onChange={handleRadiusSlider}
            style={{ width: '100%', accentColor: '#2e7d2e', marginTop: '4px', cursor: 'pointer' }}
          />
        </div>
      )}

      <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.6)' }}>
        <div style={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>
          {drawMode === 'polygon'
            ? `${safeRaw.length} point${safeRaw.length !== 1 ? 's' : ''} placed \u2022 ${safeHull.length} hull point${safeHull.length !== 1 ? 's' : ''}`
            : circle?.center ? `Circle: ${Math.round(circle.radius || 0)}m radius` : 'No circle defined'
          }
        </div>
        {drawMode === 'polygon' && safeRaw.length > 0 && safeRaw.length < 3 && (
          <span style={{ fontSize: '11px', color: '#f59e0b', fontStyle: 'italic' }}>Need {3 - safeRaw.length} more</span>
        )}
        {drawMode === 'polygon' && safeHull.length >= 3 && (
          <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 600 }}>
            {acreage !== null ? `\u2261 ${acreage} Est. Acres` : 'Area pending...'}
          </span>
        )}
      </div>

      <div style={{ padding: '6px 14px 8px', borderTop: '1px solid rgba(0,0,0,0.04)', background: 'rgba(255,255,255,0.35)' }}>
        <button type="button" onClick={() => setShowCoords(p => !p)}
          style={{ fontSize: '11px', color: '#2e7d2e', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          {showCoords ? '\u25BC' : '\u25B6'} {drawMode === 'circle' && circle?.center
            ? `Circle: center + ${Math.round(circle.radius || 0)}m radius`
            : `Show boundary coordinates (${safeHull.length} point${safeHull.length !== 1 ? 's' : ''})`
          }
        </button>
        {showCoords && (
          <div style={{ background: '#f8fdf8', border: '1px solid rgba(46,125,50,0.1)', borderRadius: '8px', padding: '8px 12px', marginTop: '4px', maxHeight: '120px', overflowY: 'auto' }}>
            {drawMode === 'circle' && circle?.center ? (
              <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace', lineHeight: 1.8 }}>
                <div>Center: {circle.center.lat.toFixed(6)}, {circle.center.lng.toFixed(6)}</div>
                <div>Radius: {Math.round(circle.radius)} meters</div>
              </div>
            ) : (
              safeHull.map((p, i) => (
                <div key={i} style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace', lineHeight: 1.8 }}>
                  P{i + 1}: {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
