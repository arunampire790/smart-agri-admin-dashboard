import { useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { computePolygonAreaAcres } from '../../utils/farmArea';

const MARKER_COLORS = ['#2e7d32', '#1d6fa8', '#9333ea', '#e67e22', '#2c3e50', '#c0392b', '#16a085', '#2980b9', '#8e44ad', '#d35400'];

const MAX_POINTS = 20;

const createMarkerIcon = (index) => L.divIcon({
  className: '',
  html: `<div style="position:relative;width:30px;height:30px;"><div style="position:absolute;top:0;left:0;width:30px;height:30px;border-radius:50%;background:${MARKER_COLORS[index % MARKER_COLORS.length]};opacity:0.15;transform:scale(1.3)"></div><div style="position:absolute;top:5px;left:5px;width:20px;height:20px;border-radius:50%;background:${MARKER_COLORS[index % MARKER_COLORS.length]};border:2px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700;">${index + 1}</div></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function isValidCoord(p) {
  return p && typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng) && isFinite(p.lat) && isFinite(p.lng) && p.lat >= -90 && p.lat <= 90 && p.lng >= -180 && p.lng <= 180;
}

function DraggableMarker({ point, index, onDrag, onRemove }) {
  const icon = useMemo(() => createMarkerIcon(index), [index]);

  const eventHandlers = useMemo(() => ({
    dragend(e) {
      const { lat, lng } = e.target.getLatLng();
      onDrag(index, { lat, lng });
    },
    contextmenu(e) {
      L.DomEvent.preventDefault(e);
      onRemove(index);
    },
  }), [index, onDrag, onRemove]);

  return (
    <Marker
      position={[point.lat, point.lng]}
      icon={icon}
      draggable={true}
      eventHandlers={eventHandlers}
    />
  );
}

function ClickHandler({ onAdd, disabled }) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onAdd(e.latlng);
    },
  });
  return null;
}

function MapSync({ points }) {
  const map = useMap();

  const pointsKey = useMemo(() => {
    return (points || []).map(p => isValidCoord(p) ? `${p.lat.toFixed(6)},${p.lng.toFixed(6)}` : '').join('|');
  }, [points]);

  const safePoints = useMemo(() => (points || []).filter(isValidCoord), [pointsKey]);

  useEffect(() => {
    if (safePoints.length === 0) {
      map.setView([20, 0], 2);
    } else if (safePoints.length === 1) {
      map.flyTo([safePoints[0].lat, safePoints[0].lng], 12);
    } else {
      const bounds = L.latLngBounds(safePoints.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [map, pointsKey]);

  return null;
}

function MapInvalidator({ modalOpen }) {
  const map = useMap();

  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => map.invalidateSize(), 100);
    }
  }, [modalOpen, map]);

  return null;
}

export default function FarmMapDrawing({ points, onChange, modalOpen }) {
  const safePoints = useMemo(() => {
    if (!Array.isArray(points)) return [];
    return points.filter(isValidCoord);
  }, [points]);

  const area = useMemo(() => computePolygonAreaAcres(safePoints), [safePoints]);

  const handleAdd = useCallback((latlng) => {
    if (safePoints.length >= MAX_POINTS) return;
    const updated = [...points, { lat: latlng.lat, lng: latlng.lng }];
    onChange(updated);
  }, [points, safePoints.length, onChange]);

  const handleDrag = useCallback((index, { lat, lng }) => {
    const updated = [...points];
    updated[index] = { lat, lng };
    onChange(updated);
  }, [points, onChange]);

  const handleRemove = useCallback((index) => {
    const updated = points.filter((_, i) => i !== index);
    onChange(updated);
  }, [points, onChange]);

  const handleUndo = useCallback(() => {
    if (points.length === 0) return;
    onChange(points.slice(0, -1));
  }, [points, onChange]);

  const handleClear = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return (
    <div style={{ border: '1px solid rgba(46,125,50,0.3)', borderRadius: '12px', overflow: 'hidden', position: 'relative', isolation: 'isolate', zIndex: 0 }}>
      <MapContainer center={[20, 0]} zoom={2} style={{ width: '100%', height: '260px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <ClickHandler onAdd={handleAdd} disabled={safePoints.length >= MAX_POINTS} />
        <MapInvalidator modalOpen={modalOpen} />
        <MapSync points={points} />
        {safePoints.map((p, i) => (
          <DraggableMarker key={`${p.lat.toFixed(6)}-${p.lng.toFixed(6)}-${i}`} point={p} index={i} onDrag={handleDrag} onRemove={handleRemove} />
        ))}
        {safePoints.length >= 3 && (
          <Polygon positions={safePoints.map(p => [p.lat, p.lng])} pathOptions={{ fillColor: '#2e7d32', fillOpacity: 0.18, color: '#2e7d32', weight: 2, dashArray: '6, 4' }} />
        )}
      </MapContainer>

      <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 1000, display: 'flex', gap: '6px' }}>
        {safePoints.length < MAX_POINTS && (
          <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', color: '#374151', fontWeight: 500, boxShadow: '0 1px 4px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4caf50', display: 'inline-block' }} /> Click map to add boundary point
          </div>
        )}
        {safePoints.length >= MAX_POINTS && (
          <div style={{ background: 'rgba(251,191,36,0.92)', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', color: '#92400e', fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
            Max {MAX_POINTS} points reached
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 1000, display: 'flex', gap: '6px' }}>
        {safePoints.length > 0 && (
          <>
            <button type="button" onClick={handleUndo}
              style={{ background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', color: '#374151', fontWeight: 500, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.92)'}
            ><i className="ph ph-arrow-u-up-left" /> Undo</button>
            <button type="button" onClick={handleClear}
              style={{ background: 'rgba(239,68,68,0.12)', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', color: '#dc2626', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
            ><i className="ph ph-trash" /> Clear All</button>
          </>
        )}
      </div>

      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>
            {safePoints.length} boundary point{safePoints.length !== 1 ? 's' : ''} set
          </div>
          {safePoints.length > 0 && safePoints.length < 3 && (
            <span style={{ fontSize: '11px', color: '#f59e0b', fontStyle: 'italic' }}>Need at least 3 points for a polygon</span>
          )}
        </div>
        <div>
          {area !== null ? (
            <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 600 }}>&#x2261; {area} Est. Acres</span>
          ) : safePoints.length > 0 ? (
            <span style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>Add more points to estimate area</span>
          ) : null}
        </div>
      </div>

      {safePoints.length > 0 && (
        <div style={{ padding: '8px 14px 10px', borderTop: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexWrap: 'wrap', gap: '4px 16px', background: 'rgba(255,255,255,0.3)' }}>
          {safePoints.map((p, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: MARKER_COLORS[i % MARKER_COLORS.length], display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontWeight: 500, color: '#374151' }}>P{i + 1}:</span>
              {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
              <span style={{ color: '#9ca3af', cursor: 'pointer', marginLeft: '2px' }} onClick={() => handleRemove(i)} title="Remove point">&times;</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'absolute', bottom: safePoints.length > 0 ? '74px' : '42px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, fontSize: '10px', color: '#9ca3af', background: 'rgba(255,255,255,0.7)', padding: '2px 8px', borderRadius: '4px', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        Right-click a marker to remove it &middot; Drag markers to adjust
      </div>
    </div>
  );
}
