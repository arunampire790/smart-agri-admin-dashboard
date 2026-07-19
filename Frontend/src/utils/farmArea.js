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
  return (areaSqMeters * 0.000247105).toFixed(2);
}
