import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { computeConvexHull } from '../../utils/farmArea';

const MAP_STYLE = { width: '100%', borderRadius: '8px' };

function isValidCoord(p) {
  return p && typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng) && isFinite(p.lat) && isFinite(p.lng) && p.lat >= -90 && p.lat <= 90 && p.lng >= -180 && p.lng <= 180;
}

function MapFitter({ points }) {
  const map = useMap();
  useEffect(() => {
    const safe = (points || []).filter(isValidCoord);
    if (safe.length === 0) {
      map.setView([20, 0], 2);
    } else if (safe.length === 1) {
      map.setView([safe[0].lat, safe[0].lng], 14);
    } else {
      const b = L.latLngBounds(safe.map(p => [p.lat, p.lng]));
      map.fitBounds(b, { padding: [20, 20] });
    }
  }, [map, points]);
  return null;
}

export default function FarmMiniMap({ coordinates, height = 200 }) {
  const hull = useMemo(() => {
    if (!coordinates || coordinates.length < 3) return [];
    return computeConvexHull(coordinates.filter(isValidCoord));
  }, [coordinates]);

  const displayPoints = useMemo(() => {
    return (coordinates || []).filter(isValidCoord);
  }, [coordinates]);

  if (!displayPoints.length) {
    return (
      <div style={{ border: '1px solid rgba(46,125,50,0.2)', borderRadius: '8px', height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.02)' }}>
        <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>No boundary data</span>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid rgba(46,125,50,0.2)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer center={[20, 0]} zoom={2} style={{ ...MAP_STYLE, height: `${height}px` }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <MapFitter points={displayPoints} />
        {hull.length >= 3 && (
          <Polygon positions={hull.map(p => [p.lat, p.lng])} pathOptions={{ fillColor: '#2e7d2e', fillOpacity: 0.12, color: '#2e7d2e', weight: 2 }} />
        )}
      </MapContainer>
      <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(255,255,255,0.9)', borderRadius: '6px', padding: '3px 8px', fontSize: '10px', fontWeight: 600, color: '#374151', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', pointerEvents: 'none', zIndex: 1000 }}>
        {'\u23F7 Farm Boundary'}
      </div>
    </div>
  );
}
