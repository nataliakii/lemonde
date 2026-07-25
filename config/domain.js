/**
 * Domain / canonical URL for Le Monde Suites.
 *
 * Production canonical: https://lemonde.kalikratia.com
 * Override anytime with NEXT_PUBLIC_SITE_URL.
 * Local fallback when unset in development: http://localhost:3026
 */

const PRODUCTION_CANONICAL_URL = "https://lemonde.kalikratia.com";
const LOCAL_DEV_FALLBACK = "http://localhost:3026";

/** Le Monde Suites: single-property apartment mode */
export const SINGLE_PROPERTY_MODE = true;

function normalizeHost(host) {
  return String(host || "")
    .trim()
    .toLowerCase()
    .replace(/\.$/, "");
}

/**
 * Canonical origin: NEXT_PUBLIC_SITE_URL → production host → local fallback.
 */
export function getBaseUrl() {
  const fromEnv = String(process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (fromEnv) {
    try {
      const u = new URL(fromEnv.includes("://") ? fromEnv : `https://${fromEnv}`);
      return u.origin.replace(/\/+$/, "");
    } catch {
      /* fall through */
    }
  }
  if (process.env.NODE_ENV === "development") {
    return LOCAL_DEV_FALLBACK;
  }
  return PRODUCTION_CANONICAL_URL;
}

/** @deprecated Prefer getBaseUrl() */
export const DEFAULT_CANONICAL_URL = PRODUCTION_CANONICAL_URL;

function wwwToApexMap() {
  return {
    "www.lemonde.kalikratia.com": "lemonde.kalikratia.com",
  };
}

export const DOMAIN_CONFIG = {
  get canonical() {
    return getBaseUrl();
  },
  get servingHosts() {
    const hosts = new Set([
      "localhost",
      "lemonde.kalikratia.com",
      "www.lemonde.kalikratia.com",
    ]);
    try {
      const host = normalizeHost(new URL(getBaseUrl()).host);
      if (host) hosts.add(host);
    } catch {
      /* ignore */
    }
    Object.keys(wwwToApexMap()).forEach((h) => hosts.add(h));
    Object.values(wwwToApexMap()).forEach((h) => hosts.add(h));
    return [...hosts];
  },
  get allowedDomains() {
    return this.servingHosts;
  },
  get wwwToApex() {
    return wwwToApexMap();
  },
};

export function absoluteUrl(path = "/") {
  const baseUrl = getBaseUrl();
  const safePath = String(path || "/");
  const normalizedPath = safePath.startsWith("/") ? safePath : `/${safePath}`;
  return `${baseUrl}${normalizedPath}`;
}

export function getCanonicalHost() {
  try {
    return new URL(getBaseUrl()).host.toLowerCase();
  } catch {
    return "lemonde.kalikratia.com";
  }
}

export function getAllowedDomainHosts() {
  return DOMAIN_CONFIG.servingHosts.map((host) => normalizeHost(host));
}

export function getServingApexHosts() {
  return ["lemonde.kalikratia.com", "localhost"].map(normalizeHost);
}

export function getApexHostFor(hostname) {
  const host = normalizeHost(hostname);
  return wwwToApexMap()[host] || null;
}

export function isServingHost(hostname) {
  const host = normalizeHost(hostname);
  return getAllowedDomainHosts().includes(host);
}

export function isPeerMirrorHost() {
  return false;
}

export const SERVING_APEX_HOSTS = getServingApexHosts();
