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
  "sea view",
  "tv",
  "heating",
  "elevator",
];

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
