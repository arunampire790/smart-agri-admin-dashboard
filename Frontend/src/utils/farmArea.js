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

export function computeConvexHull(points) {
  if (points.length < 3) return points;
  const sorted = [...points].sort((a, b) =>
    a.lng !== b.lng ? a.lng - b.lng : a.lat - b.lat
  );
  const cross = (O, A, B) =>
    (A.lng - O.lng) * (B.lat - O.lat) - (A.lat - O.lat) * (B.lng - O.lng);
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

export function haversineDistance(p1, p2) {
  const R = 6371000;
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function circleToPolygon(center, radius, numPoints = 32) {
  const points = [];
  const latRad = center.lat * Math.PI / 180;
  const lngScale = radius / (111320 * Math.cos(latRad));
  const latScale = radius / 111320;
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    points.push({ lat: center.lat + latScale * Math.cos(angle), lng: center.lng + lngScale * Math.sin(angle) });
  }
  return points;
}
