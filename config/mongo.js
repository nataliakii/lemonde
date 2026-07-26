/**
 * MongoDB database name for this deploy.
 * Override with MONGODB_DB_NAME (e.g. lemonde). Legacy default was "Car".
 */
export const MONGODB_DB_NAME =
  String(process.env.MONGODB_DB_NAME || "").trim() || "lemonde";
