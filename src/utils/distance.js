const toRad = (value) => (value * Math.PI) / 180;

export function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km) {
  if (!Number.isFinite(km)) return null;
  if (km < 1) return `${Math.max(1, Math.round(km * 1000))}m`;
  return `${km.toFixed(km < 10 ? 1 : 0)}km`;
}
