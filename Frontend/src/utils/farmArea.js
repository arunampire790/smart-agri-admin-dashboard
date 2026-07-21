export function computeTriangleAreaAcres(p1, p2, p3) {
  const R = 6371000;
  const toRad = deg => deg * Math.PI / 180;
  const x1 = R * toRad(p1.lng) * Math.cos(toRad(p1.lat));
  const y1 = R * toRad(p1.lat);
  const x2 = R * toRad(p2.lng) * Math.cos(toRad(p2.lat));
  const y2 = R * toRad(p2.lat);
  const x3 = R * toRad(p3.lng) * Math.cos(toRad(p3.lat));
  const y3 = R * toRad(p3.lat);
  const areaSqMeters = 0.5 * Math.abs(
    x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)
  );
  return parseFloat((areaSqMeters * 0.000247105).toFixed(2));
}

export function computePolygonAreaAcres(points) {
  if (!points || points.length < 3) return null;
  const R = 6371000;
  const toRad = deg => deg * Math.PI / 180;
  const n = points.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = R * toRad(points[i].lng) * Math.cos(toRad(points[i].lat));
    const yi = R * toRad(points[i].lat);
    const xj = R * toRad(points[j].lng) * Math.cos(toRad(points[j].lat));
    const yj = R * toRad(points[j].lat);
    area += xi * yj - xj * yi;
  }
  return parseFloat((Math.abs(area) / 2 * 0.000247105).toFixed(2));
}
