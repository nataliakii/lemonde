import Preloader from "./components/Loader/Preloader";
import { COMPANY_ID } from "@config/company";
import { getCompany } from "@/domain/services";

export default async function Loading() {
  let company = null;
  try {
    company = await getCompany(COMPANY_ID);
  } catch {
    company = null;
  }
  return <Preloader loading={true} company={company} />;
}
