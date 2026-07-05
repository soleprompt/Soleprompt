import { redirect } from "next/navigation";
import { getDashboardPath } from "@/lib/auth";
import { getAdminEmail, getCurrentUserRole, isAdminEmail } from "@/lib/user";

export { getAdminEmail, isAdminEmail };

export async function isAdminUser(): Promise<boolean> {
  return (await getCurrentUserRole()) === "admin";
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminUser())) {
    const role = await getCurrentUserRole();
    redirect(getDashboardPath(role));
  }
}
