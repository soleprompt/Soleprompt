import { auth } from "@clerk/nextjs/server";
import { hasScrubberAccess } from "@/lib/scrubber/access";
import { syncCurrentUser } from "@/lib/user";

export async function requireScrubberUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return null;
  }

  const hasAccess = await hasScrubberAccess(clerkUserId);
  if (!hasAccess) {
    return null;
  }

  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    return null;
  }

  return { clerkUserId, dbUser };
}
