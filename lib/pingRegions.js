const BASE_REGIONS = [
  { key: "NA-West", lon: -120, lat: 40 },
  { key: "NA-East", lon: -75, lat: 40 },
  { key: "SA", lon: -60, lat: -15 },
  { key: "EU-West", lon: -5, lat: 50 },
  { key: "EU-East", lon: 25, lat: 50 },
  { key: "Asia-NE", lon: 135, lat: 35 },
  { key: "Asia-SE", lon: 105, lat: 1 },
  { key: "Oceania", lon: 150, lat: -25 },
];

const REGION_LOOKUP = new Map(BASE_REGIONS.map((region) => [region.key, region]));

const COUNTRY_REGION_DEFAULT = {
  US: "NA-East",
  CA: "NA-East",
  MX: "NA-East",
  BR: "SA",
  AR: "SA",
  CL: "SA",
  GB: "EU-West",
  IE: "EU-West",
  FR: "EU-West",
  ES: "EU-West",
  PT: "EU-West",
  NL: "EU-West",
  BE: "EU-West",
  DE: "EU-East",
  PL: "EU-East",
  CZ: "EU-East",
  HU: "EU-East",
  FI: "EU-East",
  SE: "EU-East",
  NO: "EU-East",
  TR: "EU-East",
  RU: "EU-East",
  UA: "EU-East",
  JP: "Asia-NE",
  KR: "Asia-NE",
  CN: "Asia-NE",
  TW: "Asia-NE",
  HK: "Asia-NE",
  SG: "Asia-SE",
  MY: "Asia-SE",
  TH: "Asia-SE",
  VN: "Asia-SE",
  ID: "Asia-SE",
  PH: "Asia-SE",
  IN: "Asia-SE",
  AU: "Oceania",
  NZ: "Oceania",
};

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const PING_REGIONS = BASE_REGIONS;

export const PING_REGION_KEYS = BASE_REGIONS.map((region) => region.key);

export function isValidPingRegion(region) {
  return typeof region === "string" && REGION_LOOKUP.has(region);
}

export function inferRegionFromGeo({ latitude, longitude }) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  let closest = null;
  let bestDistance = Infinity;
  for (const region of BASE_REGIONS) {
    const distance = haversineDistance(latitude, longitude, region.lat, region.lon);
    if (distance < bestDistance) {
      bestDistance = distance;
      closest = region.key;
    }
  }
  return closest;
}

export function inferRegionFromCountry(countryCode) {
  if (!countryCode) return null;
  const upper = countryCode.toUpperCase();
  return COUNTRY_REGION_DEFAULT[upper] ?? null;
}

export function normalizeRegion(region) {
  if (isValidPingRegion(region)) return region;
  return null;
}
