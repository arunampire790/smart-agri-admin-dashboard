import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

const pointColors = ['#2e7d32', '#1d6fa8', '#9333ea'];

const createColoredMarker = (color) => L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function ClickHandler({ onMapClick, nextPointIndex }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng, nextPointIndex);
    },
  });
  return null;
}

function isValidCoord(p) {
  return p && typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng) && isFinite(p.lat) && isFinite(p.lng);
}

function MapSync({ points }) {
  const map = useMap();

  const pointsKey = useMemo(() => {
    return (points || []).map(p => isValidCoord(p) ? `${p.lat},${p.lng}` : '').join('|');
  }, [points]);

  const safePoints = useMemo(() => (points || []).filter(isValidCoord), [pointsKey]);

  useEffect(() => {
    if (safePoints.length === 0) {
      map.setView([20, 0], 2);
    } else if (safePoints.length === 1) {
      if (safePoints[0].lat < -90 || safePoints[0].lat > 90 || safePoints[0].lng < -180 || safePoints[0].lng > 180) return;
      map.flyTo([safePoints[0].lat, safePoints[0].lng], 12);
    } else {
      const allValid = safePoints.every(p => p.lat >= -90 && p.lat <= 90 && p.lng >= -180 && p.lng <= 180);
      if (!allValid) return;
      const bounds = L.latLngBounds(safePoints.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [map, pointsKey]);

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

export default function FarmMapPreview({ points, onMapClick, nextPointIndex, modalOpen }) {
  const safePoints = useMemo(() => {
    if (!Array.isArray(points)) {return [];}
    const filtered = points.filter(isValidCoord);
    return filtered.length <= 3 ? filtered : filtered.slice(0, 3);
  }, [points]);

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ border: '1px solid rgba(46,125,50,0.3)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', position: 'relative', isolation: 'isolate', zIndex: 0 }}>
      <MapContainer center={[20, 0]} zoom={2} style={{ width: '100%', height: '220px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        <ClickHandler onMapClick={onMapClick} nextPointIndex={nextPointIndex} />
        <MapInvalidator modalOpen={modalOpen} />
        <MapSync points={points} />
        {safePoints.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]} icon={createColoredMarker(pointColors[i])} />
        ))}
        {safePoints.length === 3 && (
          <Polygon positions={safePoints.map(p => [p.lat, p.lng])} pathOptions={{ fillColor: '#2e7d32', fillOpacity: 0.2, color: '#2e7d32', weight: 2 }} />
        )}
      </MapContainer>
      <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(255,255,255,0.9)', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#6b7280', zIndex: 1000, pointerEvents: 'none' }}>
        Click map to place boundary points
      </div>
    </div>
  );
}
