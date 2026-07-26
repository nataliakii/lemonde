/**
 * Company Configuration
 *
 * COMPANY_ID is the deploy switch for which property document to load.
 * All other company data (name, phones, branding, assets, cloudinary folders)
 * comes from MongoDB — see models/company.js and resolveBrandConfig.
 *
 * Copy to another hotel:
 *   1. Set COMPANY_ID (and MONGODB_URI) in env
 *   2. Seed / upsert that company document with new branding + gallery URLs
 *   3. Set Cloudinary/SMTP secrets for the new account (env)
 */

export const COMPANY_ID =
  String(process.env.COMPANY_ID || process.env.NEXT_PUBLIC_COMPANY_ID || "").trim() ||
  "679903bd10e6c8a8c0f027bc";
