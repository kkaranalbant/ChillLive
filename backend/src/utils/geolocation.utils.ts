import geoip from 'geoip-lite';

export interface LocationData {
  country?: string;
  city?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Get location from IP address using geoip-lite
 * @param ip - IP address (supports IPv4 and IPv6)
 * @returns LocationData object with country, city, and coordinates
 */
export const getLocationFromIP = (ip: string): LocationData | null => {
  // Handle localhost/private IPs
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return null;
  }

  const geo = geoip.lookup(ip);

  if (!geo) {
    return null;
  }

  return {
    country: geo.country,
    city: geo.city || undefined,
    coordinates: geo.ll ? {
      latitude: geo.ll[0],
      longitude: geo.ll[1],
    } : undefined,
  };
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Convert degrees to radians
 */
const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

/**
 * Check if two users are nearby (within specified distance)
 * @param user1Location - First user's location
 * @param user2Location - Second user's location
 * @param maxDistanceKm - Maximum distance in kilometers (default: 500km)
 * @returns true if users are nearby
 */
export const areUsersNearby = (
  user1Location: LocationData | undefined,
  user2Location: LocationData | undefined,
  maxDistanceKm: number = 500
): boolean => {
  // If either user doesn't have coordinates, check by country
  if (!user1Location?.coordinates || !user2Location?.coordinates) {
    // Fallback to country-based matching
    return user1Location?.country === user2Location?.country;
  }

  const distance = calculateDistance(
    user1Location.coordinates.latitude,
    user1Location.coordinates.longitude,
    user2Location.coordinates.latitude,
    user2Location.coordinates.longitude
  );

  return distance <= maxDistanceKm;
};
