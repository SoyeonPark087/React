export function distanceKm(userPosition, lat, lng) {
  if (!userPosition || lat == null || lng == null) return null;

  const toRad = (degree) => degree * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat - userPosition.lat);
  const dLng = toRad(lng - userPosition.lng);
  const lat1 = toRad(userPosition.lat);
  const lat2 = toRad(lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(userPosition, restaurant) {
  const distance = distanceKm(userPosition, restaurant.lat, restaurant.lng);
  if (distance == null) return "";
  return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
}
