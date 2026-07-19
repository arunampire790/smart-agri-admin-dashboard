import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet';
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
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      onMapClick(e.latlng, nextPointIndex);
    },
  });
  return null;
}

export default function FarmMapPreview({ points, onMapClick, nextPointIndex, modalOpen }) {
  const mapRef = useRef(null);
  const validPoints = points.filter(p => p !== null && p !== undefined);

  useEffect(() => {
    if (modalOpen && mapRef.current) {
      setTimeout(() => mapRef.current.invalidateSize(), 100);
    }
  }, [modalOpen]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (validPoints.length === 0) {
      map.setView([20, 0], 2);
    } else if (validPoints.length === 1) {
      map.flyTo([validPoints[0].lat, validPoints[0].lng], 12);
    } else {
      const bounds = L.latLngBounds(validPoints.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [points]);

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ border: '1px solid rgba(46,125,50,0.3)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', position: 'relative', isolation: 'isolate', zIndex: 0 }}>
      <MapContainer center={[20, 0]} zoom={2} style={{ width: '100%', height: '220px' }} ref={mapRef}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        <ClickHandler onMapClick={onMapClick} nextPointIndex={nextPointIndex} />
        {validPoints.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]} icon={createColoredMarker(pointColors[i])} />
        ))}
        {validPoints.length === 3 && (
          <Polygon positions={validPoints.map(p => [p.lat, p.lng])} pathOptions={{ fillColor: '#2e7d32', fillOpacity: 0.2, color: '#2e7d32', weight: 2 }} />
        )}
      </MapContainer>
      <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(255,255,255,0.9)', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#6b7280', zIndex: 1000, pointerEvents: 'none' }}>
        Click map to place boundary points
      </div>
    </div>
  );
}
