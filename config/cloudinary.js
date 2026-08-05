/**
 * Cloudinary layout — folder names from env and/or Company.cloudinary (DB).
 *
 * Account credentials (cloud name, API key/secret) stay in env.
 * Per-property folder prefix lives in Company so another hotel deploy
 * can point uploads at a different Media Library root without code changes.
 *
 * Root folder resolution order:
 *   1. CLOUDINARY_ROOT_FOLDER env
 *   2. company.cloudinary.rootFolder (when passed)
 *   3. default "lemondesuites"
 */

/** Prefer env / company; default keeps existing Media Library assets working. */
const DEFAULT_ROOT_FOLDER = "lemondesuites";
const DEFAULT_PLACEHOLDER = "carsnk/NO_PHOTO";

/**
 * @param {object|null} [company] - optional lean company document
 */
export function getCloudinaryRootFolder(company = null) {
  const fromEnv = String(process.env.CLOUDINARY_ROOT_FOLDER || "").trim();
  if (fromEnv) return fromEnv;
  const fromCompany = String(company?.cloudinary?.rootFolder || "").trim();
  if (fromCompany) return fromCompany;
  return DEFAULT_ROOT_FOLDER;
}

/** Apartment / suite photos: {root}/apartments */
export function getCloudinaryCarsFolder(company = null) {
  const sub =
    String(company?.cloudinary?.apartmentsFolder || "").trim() || "apartments";
  return `${getCloudinaryRootFolder(company)}/${sub}`;
}

/**
 * Optional signed upload preset (e.g. "vluxury").
 * When set, server uploads include upload_preset alongside API key/secret.
 */
export function getCloudinaryUploadPreset() {
  return String(process.env.CLOUDINARY_UPLOAD_PRESET || "").trim();
}

/**
 * Options for apartment/car image uploads to Cloudinary.
 * @param {object|null} [company]
 */
export function getCloudinaryApartmentUploadOptions(company = null) {
  const options = {
    folder: getCloudinaryCarsFolder(company),
    resource_type: "image",
  };
  const preset = getCloudinaryUploadPreset();
  if (preset) {
    options.upload_preset = preset;
  }
  return options;
}

/** Brand / hero media: {root}/brand */
export function getCloudinaryBrandFolder(company = null) {
  return `${getCloudinaryRootFolder(company)}/brand`;
}

/**
 * Options for homepage hero / brand image uploads.
 * @param {object|null} [company]
 */
export function getCloudinaryBrandUploadOptions(company = null) {
  const options = {
    folder: getCloudinaryBrandFolder(company),
    resource_type: "image",
  };
  const preset = getCloudinaryUploadPreset();
  if (preset) {
    options.upload_preset = preset;
  }
  return options;
}

/** Alias for suites wording */
export function getCloudinaryApartmentsFolder(company = null) {
  return getCloudinaryCarsFolder(company);
}

/**
 * Order uploads base: {root}/orders
 * Full path is built in domain/orders/orderDrivingLicenceFolder.js
 */
export function getCloudinaryOrdersFolder(company = null) {
  const sub =
    String(company?.cloudinary?.ordersFolder || "").trim() || "orders";
  return `${getCloudinaryRootFolder(company)}/${sub}`;
}

/** Default placeholder public_id — override via env or company.cloudinary */
export const CLOUDINARY_PLACEHOLDER_PUBLIC_ID = DEFAULT_PLACEHOLDER;

export function getCloudinaryPlaceholderPublicId(company = null) {
  const fromEnv = String(
    process.env.CLOUDINARY_PLACEHOLDER_PUBLIC_ID || ""
  ).trim();
  if (fromEnv) return fromEnv;
  const fromCompany = String(
    company?.cloudinary?.placeholderPublicId || ""
  ).trim();
  if (fromCompany) return fromCompany;
  return CLOUDINARY_PLACEHOLDER_PUBLIC_ID;
}
