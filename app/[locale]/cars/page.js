import { redirect } from "next/navigation";
import { normalizeLocale } from "@domain/locationSeo/locationSeoService";

/** @deprecated Prefer /[locale]/apartments */
export default function CarsIndexRedirect({ params }) {
  const locale = normalizeLocale(params.locale);
  redirect(`/${locale}/apartments`);
}
