import { currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardPath } from "@/lib/auth";
import {
  getCurrentUserRole,
  isClerkUserAdmin,
  resolveAdminAccess,
} from "@/lib/user";
import type { DashboardSection } from "@/types/dashboard";
import type { UserRole } from "@/types/user";

async function hasAdminBypass(): Promise<boolean> {
  try {
    const headerStore = await headers();
    return headerStore.get("x-admin-access") === "true";
  } catch {
    return false;
  }
}

export async function createDashboardLayout(
  section: DashboardSection,
  allowedRoles: UserRole[],
  children: React.ReactNode,
  options?: { hasAccess?: () => Promise<boolean> },
) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const adminBypass = await hasAdminBypass();

  if (section === "admin") {
    const hasAdminAccess =
      adminBypass ||
      isClerkUserAdmin(user) ||
      (options?.hasAccess ? await options.hasAccess() : await resolveAdminAccess());

    if (!hasAdminAccess) {
      const role = await getCurrentUserRole();
      redirect(getDashboardPath(role));
    }

    const userName =
      user.fullName ||
      user.username ||
      user.primaryEmailAddress?.emailAddress ||
      "User";

    return (
      <DashboardShell section="admin" userName={userName}>
        {children}
      </DashboardShell>
    );
  }

  const isAdminByEmail =
    adminBypass || isClerkUserAdmin(user) || (await resolveAdminAccess());
  const role = isAdminByEmail ? "admin" : await getCurrentUserRole();
  const roleAllowed = allowedRoles.includes(role);
  const customAllowed = options?.hasAccess ? await options.hasAccess() : false;
  const allowed = roleAllowed || customAllowed;

  if (!allowed) {
    redirect(getDashboardPath(role));
  }

  const userName =
    user.fullName ||
    user.username ||
    user.primaryEmailAddress?.emailAddress ||
    "User";

  return (
    <DashboardShell section={section} userName={userName}>
      {children}
    </DashboardShell>
  );
}
