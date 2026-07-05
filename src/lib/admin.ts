import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDashboardPath } from "@/lib/auth";
import {
  getAdminEmail,
  getCurrentUserRole,
  isAdminEmail,
  isClerkUserAdmin,
} from "@/lib/user";

export { getAdminEmail, isAdminEmail };

export async function isAdminUser(): Promise<boolean> {
  const user = await currentUser();
  if (user && isClerkUserAdmin(user)) {
    return true;
  }

  return (await getCurrentUserRole()) === "admin";
}

export async function requireAdmin(): Promise<void> {
  if (await isAdminUser()) {
    return;
  }

  const role = await getCurrentUserRole();
  redirect(getDashboardPath(role));
}
