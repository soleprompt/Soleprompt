import type { UserMetadata, UserProfile, UserRole } from "@/types/user";

export const DASHBOARD_PATHS: Record<UserRole, string> = {
  buyer: "/buyer",
  seller: "/seller",
  admin: "/admin",
};

export function getDashboardPath(role: UserRole): string {
  return DASHBOARD_PATHS[role];
}

export function parseUserMetadata(
  metadata: Record<string, unknown> | undefined,
): UserMetadata {
  if (!metadata) return {};

  const profile = metadata.profile;

  return {
    profile:
      profile && typeof profile === "object"
        ? (profile as UserProfile)
        : undefined,
  };
}

export function canAccessSellerArea(role: UserRole): boolean {
  return role === "seller" || role === "admin";
}

export function canAccessAdminArea(role: UserRole): boolean {
  return role === "admin";
}
