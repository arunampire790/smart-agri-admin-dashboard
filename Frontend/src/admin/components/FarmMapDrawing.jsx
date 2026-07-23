import { useState, useMemo, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { computeConvexHull, computePolygonAreaAcres } from '../../utils/farmArea';

const MAX_POINTS = 20;

function numberMarker(n) {
  return L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;border-radius:50%;background:#2e7d2e;border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#ffffff">${n}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function isValidCoord(p) {
  return p && typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng) && isFinite(p.lat) && isFinite(p.lng) && p.lat >= -90 && p.lat <= 90 && p.lng >= -180 && p.lng <= 180;
}

function MapClickHandler({ onMapClick, disabled }) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      L.DomEvent.stopPropagation(e);
      onMapClick(e.latlng);
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
  useEffect(() => {
    if (!modalOpen) return;
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [modalOpen, map]);
  return null;
}

const btnBase = { background: '#ffffff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s ease' };

export default function FarmMapDrawing({ initialCoords, initialClosed, onChange, onAcreageChange, modalOpen }) {
  const [rawPoints, setRawPoints] = useState(() => initialCoords || []);
  const [polygonPoints, setPolygonPoints] = useState(() => computeConvexHull(initialCoords || []));
  const [polygonClosed, setPolygonClosed] = useState(() => !!initialClosed);
  const [showCoords, setShowCoords] = useState(false);

  const safeRaw = useMemo(() => rawPoints.filter(isValidCoord), [rawPoints]);
  const safeHull = useMemo(() => polygonPoints.filter(isValidCoord), [polygonPoints]);

  const acreage = useMemo(() => {
    if (!polygonClosed) return null;
    if (safeHull.length >= 3) return computePolygonAreaAcres(safeHull);
    return null;
  }, [polygonClosed, safeHull]);

  useEffect(() => { if (onAcreageChange) onAcreageChange(acreage); }, [acreage, onAcreageChange]);

  const emitChange = useCallback((hull, closed) => {
    if (onChange) {
      onChange(hull, { polygonClosed: closed });
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
    emitChange(hull, false);
  }, [rawPoints, safeRaw.length, emitChange]);

  const handleDone = useCallback(() => {
    if (safeHull.length < 3) return;
    setPolygonClosed(true);
    emitChange(safeHull, true);
  }, [safeHull, emitChange]);

  const handleUndo = useCallback(() => {
    if (rawPoints.length === 0) return;
    const updated = rawPoints.slice(0, -1);
    const hull = updated.length >= 3 ? computeConvexHull(updated) : updated;
    setRawPoints(updated);
    setPolygonPoints(hull);
    setPolygonClosed(false);
    emitChange(hull, false);
  }, [rawPoints, emitChange]);

  const handleClear = useCallback(() => {
    setRawPoints([]);
    setPolygonPoints([]);
    setPolygonClosed(false);
    emitChange([], false);
  }, [emitChange]);

  const doneEnabled = safeHull.length >= 3;

  let instructionText = '';
  if (polygonClosed) {
    instructionText = `\u2713 Boundary set \u2014 ${safeRaw.length} point${safeRaw.length !== 1 ? 's' : ''}${acreage ? `, ${acreage} Est. Acres` : ''}`;
  } else {
    if (safeRaw.length === 0) instructionText = 'Click anywhere on the map to place boundary points';
    else if (safeRaw.length < 3) instructionText = `Add at least ${3 - safeRaw.length} more point${3 - safeRaw.length !== 1 ? 's' : ''} (minimum 3 required)`;
    else instructionText = 'Polygon ready \u2014 add more points to refine or click \u2713 Done';
  }

  return (
    <div style={{ border: '1px solid rgba(46,125,50,0.3)', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer center={[20, 0]} zoom={2} doubleClickZoom={false} style={{ width: '100%', height: '260px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <MapClickHandler disabled={polygonClosed} onMapClick={addPoint} />
        <MapInvalidator modalOpen={modalOpen} />
        <MapSync points={safeHull} />
        {safeRaw.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]} icon={numberMarker(i + 1)} />
        ))}
        {safeHull.length >= 3 && (
          <Polygon positions={safeHull.map(p => [p.lat, p.lng])} pathOptions={{ fillColor: '#2e7d2e', fillOpacity: 0.15, color: '#2e7d2e', weight: 2 }} />
        )}
      </MapContainer>

      <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
          <button type="button" onClick={handleDone} disabled={!doneEnabled || polygonClosed}
            style={{
              ...btnBase, background: polygonClosed ? '#e8f5e9' : doneEnabled ? '#1a3a2a' : '#ffffff', color: polygonClosed ? '#2e7d2e' : doneEnabled ? '#ffffff' : '#9ca3af', border: polygonClosed ? '1px solid rgba(46,125,50,0.3)' : doneEnabled ? 'none' : '1px solid rgba(0,0,0,0.08)',
              opacity: !doneEnabled && !polygonClosed ? 0.4 : 1, cursor: (doneEnabled || polygonClosed) ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={e => { if (doneEnabled && !polygonClosed) { e.currentTarget.style.background = '#2e7d2e'; } }}
            onMouseLeave={e => { if (doneEnabled && !polygonClosed) { e.currentTarget.style.background = '#1a3a2a'; } }}
          ><i className="ph ph-check" /> {polygonClosed ? 'Done' : '\u2713 Done'}</button>
          <button type="button" onClick={handleUndo} disabled={polygonClosed || rawPoints.length === 0}
            style={{
              ...btnBase, opacity: (polygonClosed || rawPoints.length === 0) ? 0.4 : 1,
              cursor: (polygonClosed || rawPoints.length === 0) ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          ><i className="ph ph-arrow-u-up-left" /> Undo</button>
          <button type="button" onClick={handleClear}
            style={{ ...btnBase, color: '#dc2626' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
          ><i className="ph ph-trash" /> Clear</button>
        </div>
      </div>

      <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.6)' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>
            {safeRaw.length} point{safeRaw.length !== 1 ? 's' : ''} placed \u2022 {safeHull.length} hull point{safeHull.length !== 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic', marginTop: '2px' }}>{instructionText}</div>
        </div>
        {safeRaw.length > 0 && safeRaw.length < 3 && (
          <span style={{ fontSize: '11px', color: '#f59e0b', fontStyle: 'italic' }}>Need {3 - safeRaw.length} more</span>
        )}
        {safeHull.length >= 3 && (
          <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 600 }}>
            {acreage !== null ? `\u2261 ${acreage} Est. Acres` : 'Area pending...'}
          </span>
        )}
      </div>

      <div style={{ padding: '6px 14px 8px', borderTop: '1px solid rgba(0,0,0,0.04)', background: 'rgba(255,255,255,0.35)' }}>
        <button type="button" onClick={() => setShowCoords(p => !p)}
          style={{ fontSize: '11px', color: '#2e7d2e', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          {showCoords ? '\u25BC' : '\u25B6'} Show boundary coordinates ({safeHull.length} point{safeHull.length !== 1 ? 's' : ''})
        </button>
        {showCoords && (
          <div style={{ background: '#f8fdf8', border: '1px solid rgba(46,125,50,0.1)', borderRadius: '8px', padding: '8px 12px', marginTop: '4px', maxHeight: '120px', overflowY: 'auto' }}>
            {safeHull.map((p, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace', lineHeight: 1.8 }}>
                P{i + 1}: {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
