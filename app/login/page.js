import Login from "../components/Login/Login";
import styles from "../components/Login/loginForm.module.css";
import { COMPANY_ID } from "@config/company";
import { getCompany } from "@/domain/services";
import { resolveBrandConfig } from "@/domain/branding/resolveBrandConfig";

export async function generateMetadata() {
  let company = null;
  try {
    company = await getCompany(COMPANY_ID);
  } catch {
    company = null;
  }
  const brand = resolveBrandConfig(company);
  const faviconUrl = brand.assets.favicon || "/favicon.png";

  return {
    robots: { index: false, follow: true },
    title: `Staff login | ${brand.name}`,
    icons: {
      icon: [{ url: faviconUrl }],
      shortcut: faviconUrl,
    },
  };
}

export default async function LoginPage() {
  let company = null;
  try {
    company = await getCompany(COMPANY_ID);
  } catch {
    company = null;
  }

  return (
    <div className={styles.page}>
      <Login company={company} />
    </div>
  );
}
