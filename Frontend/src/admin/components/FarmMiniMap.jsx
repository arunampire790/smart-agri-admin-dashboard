import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { computeConvexHull } from '../../utils/farmArea';

const MAP_STYLE = { width: '100%', borderRadius: '8px' };

function isValidCoord(p) {
  return p && typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng) && isFinite(p.lat) && isFinite(p.lng) && p.lat >= -90 && p.lat <= 90 && p.lng >= -180 && p.lng <= 180;
}

function MapFitter({ points, circleData }) {
  const map = useMap();
  useEffect(() => {
    if (circleData?.center && isValidCoord(circleData.center)) {
      const zoom = circleData.radius > 0 ? 14 : 12;
      map.setView([circleData.center.lat, circleData.center.lng], zoom);
      return;
    }
    const safe = (points || []).filter(isValidCoord);
    if (safe.length === 0) {
      map.setView([20, 0], 2);
    } else if (safe.length === 1) {
      map.setView([safe[0].lat, safe[0].lng], 14);
    } else {
      const b = L.latLngBounds(safe.map(p => [p.lat, p.lng]));
      map.fitBounds(b, { padding: [20, 20] });
    }
  }, [map, points, circleData]);
  return null;
}

export default function FarmMiniMap({ coordinates, circleData, boundaryType, height = 200 }) {
  const hull = useMemo(() => {
    if (boundaryType === 'circle' || !coordinates || coordinates.length < 3) return [];
    return computeConvexHull(coordinates.filter(isValidCoord));
  }, [coordinates, boundaryType]);

  const displayPoints = useMemo(() => {
    if (boundaryType === 'circle') return circleData?.center ? [circleData.center] : [];
    return (coordinates || []).filter(isValidCoord);
  }, [coordinates, boundaryType, circleData]);

  if (!displayPoints.length && !circleData?.center) {
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
        <MapFitter points={displayPoints} circleData={boundaryType === 'circle' ? circleData : null} />
        {boundaryType === 'circle' && circleData?.center && circleData?.radius > 0 && (
          <Circle center={[circleData.center.lat, circleData.center.lng]} radius={circleData.radius} pathOptions={{ fillColor: '#2e7d2e', fillOpacity: 0.15, color: '#2e7d2e', weight: 2 }} />
        )}
        {boundaryType !== 'circle' && hull.length >= 3 && (
          <Polygon positions={hull.map(p => [p.lat, p.lng])} pathOptions={{ fillColor: '#2e7d2e', fillOpacity: 0.12, color: '#2e7d2e', weight: 2 }} />
        )}
      </MapContainer>
      <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(255,255,255,0.9)', borderRadius: '6px', padding: '3px 8px', fontSize: '10px', fontWeight: 600, color: '#374151', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', pointerEvents: 'none', zIndex: 1000 }}>
        {boundaryType === 'circle' ? '\u25CB Farm Boundary' : '\u23F7 Farm Boundary'}
      </div>
    </div>
  );
}
