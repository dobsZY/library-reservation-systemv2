/**
 * Haversine formulu ile iki koordinat arasindaki mesafeyi hesaplar.
 * Harici bagimlilik gerektirmez.
 *
 * @param lat1 - Birinci noktanin enlemi (derece)
 * @param lon1 - Birinci noktanin boylami (derece)
 * @param lat2 - Ikinci noktanin enlemi (derece)
 * @param lon2 - Ikinci noktanin boylami (derece)
 * @returns Metre cinsinden mesafe
 */
export function calculateDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const EARTH_RADIUS_METERS = 6_371_000; // Dunya yaricapi (metre)

  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_METERS * c * 100) / 100; // 2 ondalik hassasiyet
}

/**
 * Verilen koordinatin referans noktasina belirtilen mesafe icinde olup olmadigini kontrol eder.
 *
 * @param userLat - Kullanici enlemi
 * @param userLon - Kullanici boylami
 * @param refLat - Referans noktasi enlemi
 * @param refLon - Referans noktasi boylami
 * @param maxDistanceMeters - Izin verilen maksimum mesafe (metre)
 * @returns { isWithin, distanceMeters }
 */
export function isWithinRadius(
  userLat: number,
  userLon: number,
  refLat: number,
  refLon: number,
  maxDistanceMeters: number,
): { isWithin: boolean; distanceMeters: number } {
  const distanceMeters = calculateDistanceInMeters(userLat, userLon, refLat, refLon);
  return {
    isWithin: distanceMeters <= maxDistanceMeters,
    distanceMeters,
  };
}
