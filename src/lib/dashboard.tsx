import { currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardPath } from "@/lib/auth";
import { BUYER_SCRUBBER_NAV, BUYER_SOCIAL_TOOLS_NAV, BUYER_STUDIO_NAV } from "@/lib/navigation";
import { hasScrubberAccess } from "@/lib/scrubber/access";
import { hasSocialSuiteAccess } from "@/lib/social-tools/access";
import {
  getCurrentUserRole,
  isClerkUserAdmin,
  resolveAdminAccess,
} from "@/lib/user";
import type { DashboardSection } from "@/types/dashboard";
import type { UserRole, DashboardNavItem } from "@/types/user";

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
  options?: {
    hasAccess?: () => Promise<boolean>;
    extraNavItems?: DashboardNavItem[];
  },
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

  if (section === "affiliate") {
    const userName =
      user.fullName ||
      user.username ||
      user.primaryEmailAddress?.emailAddress ||
      "User";

    return (
      <DashboardShell section="affiliate" userName={userName}>
        {children}
      </DashboardShell>
    );
  }

  const extraNavItems: DashboardNavItem[] = [...(options?.extraNavItems ?? [])];

  if (section === "buyer") {
    extraNavItems.push(BUYER_STUDIO_NAV);

    const showScrubber = await hasScrubberAccess(user.id);
    if (showScrubber) {
      extraNavItems.push(BUYER_SCRUBBER_NAV);
    }

    const showSocialTools = await hasSocialSuiteAccess(user.id);
    if (showSocialTools) {
      extraNavItems.push(BUYER_SOCIAL_TOOLS_NAV);
    }
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
    <DashboardShell
      section={section}
      userName={userName}
      extraNavItems={extraNavItems}
    >
      {children}
    </DashboardShell>
  );
}
