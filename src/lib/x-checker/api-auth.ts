import { auth } from "@clerk/nextjs/server";
import { syncCurrentUser } from "@/lib/user";

/** Any signed-in SolePrompt user — no purchase required for the free checker. */
export async function requireSignedInUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return null;
  }

  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    return null;
  }

  return { clerkUserId, dbUser };
}
