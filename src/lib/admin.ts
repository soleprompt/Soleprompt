import { redirect } from "next/navigation";
import { getDashboardPath } from "@/lib/auth";
import { getAdminEmail, isAdminEmail } from "@/lib/admin-email";
import { getCurrentUserRole, resolveAdminAccess } from "@/lib/user";

export { getAdminEmail, isAdminEmail };

export async function isAdminUser(): Promise<boolean> {
  return resolveAdminAccess();
}

export async function requireAdmin(): Promise<void> {
  if (await resolveAdminAccess()) {
    return;
  }

  const role = await getCurrentUserRole();
  redirect(getDashboardPath(role));
}
