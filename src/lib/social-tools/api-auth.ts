import { auth } from "@clerk/nextjs/server";
import { hasSocialSuiteAccess } from "@/lib/social-tools/access";
import { syncCurrentUser } from "@/lib/user";

export async function requireSocialSuiteUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return null;
  }

  const hasAccess = await hasSocialSuiteAccess(clerkUserId);
  if (!hasAccess) {
    return null;
  }

  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    return null;
  }

  return { clerkUserId, dbUser };
}
