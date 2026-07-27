/** Suite / apartment types (stored in Car.class for pragmatic remap). */
export const CAR_CLASSES = {
  STUDIO: "studio",
  ONE_BEDROOM: "one bedroom",
  TWO_BEDROOM: "two bedroom",
  SUITE: "suite",
  PENTHOUSE: "penthouse",
  // Legacy car-rental values kept so existing Mongo docs still validate
  ECONOMY: "economy",
  PREMIUM: "premium",
  MINIBUS: "minibus",
  CROSSOVER: "crossover",
  LIMOUSINE: "limousine",
  COMPACT: "compact",
  CONVERTIBLE: "convertible",
  RACE: "race car",
  COMBI: "combi",
};

/** Apartment types shown in admin/public UI (subset of CAR_CLASSES). */
export const APARTMENT_TYPES = {
  STUDIO: "studio",
  ONE_BEDROOM: "one bedroom",
  TWO_BEDROOM: "two bedroom",
  SUITE: "suite",
  PENTHOUSE: "penthouse",
};

export const TRANSMISSION_TYPES = {
  AUTOMATIC: "automatic",
  MANUAL: "manual",
};

export const FUEL_TYPES = {
  DIESEL: "diesel",
  PETROL: "petrol",
  NATURAL_GAS: "gas(lpg)",
  HYBRID_DIESEL: "hybrid diesel",
  HYBRID_PETROL: "hybrid petrol",
  GAS: "natural gas(cng)",
  ELECTRIC: "electric",
};

export const PREDEFINED_COLORS = {
  BLACK: "black",
  WHITE: "white",
  SILVER: "silver",
  GRAY: "gray",
  RED: "red",
  BLUE: "blue",
  GREEN: "green",
  BROWN: "brown",
  BEIGE: "beige",
  GOLD: "gold",
  ORANGE: "orange",
  YELLOW: "yellow",
};

export const APARTMENT_AMENITIES = [
  "wifi",
  "kitchen",
  "washer",
  "air conditioning",
  "parking",
  "balcony",
  "terrace",
  "sea view",
  "tv",
  "heating",
  "elevator",
];

/** Quick-toggle flags shown in suite admin forms (stored in amenities[]). */
export const SUITE_OUTDOOR_AMENITIES = ["balcony", "terrace", "sea view"];

export function apartmentHasAmenity(amenities, key) {
  const needle = String(key || "")
    .trim()
    .toLowerCase();
  if (!needle) return false;
  return (Array.isArray(amenities) ? amenities : []).some(
    (a) => String(a).trim().toLowerCase() === needle
  );
}

export function toggleApartmentAmenity(amenities, key, enabled) {
  const label = String(key || "").trim();
  if (!label) return Array.isArray(amenities) ? [...amenities] : [];
  const needle = label.toLowerCase();
  const next = (Array.isArray(amenities) ? amenities : []).filter(
    (a) => String(a).trim().toLowerCase() !== needle
  );
  if (enabled) next.push(label);
  return next;
}

export const defaultPrices = {
  NoSeason: {
    days: {
      4: 50,
      7: 30,
      14: 20,
    },
  },
  LowSeason: { days: { 4: 50, 7: 30, 14: 20 } },
  LowUpSeason: { days: { 4: 50, 7: 30, 14: 20 } },
  MiddleSeason: { days: { 4: 50, 7: 30, 14: 20 } },
  HighSeason: { days: { 4: 50, 7: 30, 14: 20 } },
};
