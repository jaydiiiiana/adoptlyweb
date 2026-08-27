import { redirect } from "next/navigation";

/**
 * /admin  →  redirect straight to the dashboard overview.
 * This prevents a blank page when landing on the /admin route.
 */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
