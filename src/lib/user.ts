import { currentUser, type User as ClerkUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { UserRole } from "@/types/user";

function clerkUserFields(user: ClerkUser) {
  return {
    clerkUserId: user.id,
    username: user.username ?? user.id.slice(0, 8),
    email: user.primaryEmailAddress?.emailAddress ?? "",
  };
}

export function toUserRole(role: string): UserRole {
  if (role === "seller" || role === "admin") return role;
  return "buyer";
}

export async function syncClerkUser(user: ClerkUser) {
  const fields = clerkUserFields(user);

  return prisma.user.upsert({
    where: { clerkUserId: user.id },
    create: {
      ...fields,
      role: "buyer",
    },
    update: {
      username: fields.username,
      email: fields.email,
    },
  });
}

export async function syncCurrentUser() {
  const user = await currentUser();
  if (!user) return null;
  return syncClerkUser(user);
}

export async function getCurrentUserRole(): Promise<UserRole> {
  const dbUser = await syncCurrentUser();
  return dbUser ? toUserRole(dbUser.role) : "buyer";
}

export async function createUserFromWebhook(data: {
  id: string;
  username: string | null;
  email_addresses: Array<{ email_address: string }>;
}) {
  const email = data.email_addresses[0]?.email_address ?? "";

  return prisma.user.upsert({
    where: { clerkUserId: data.id },
    create: {
      clerkUserId: data.id,
      username: data.username ?? data.id.slice(0, 8),
      email,
      role: "buyer",
    },
    update: {},
  });
}
