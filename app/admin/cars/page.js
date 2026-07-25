import { redirect } from "next/navigation";

/** @deprecated Prefer /admin/apartments */
export default function AdminCarsPage() {
  redirect("/admin/apartments");
}
