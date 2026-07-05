import {
  auth,
  clerkClient,
  currentUser,
  type User as ClerkUser,
} from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import {
  isAdminEmail,
  isClerkUserAdminByEmail,
  normalizeEmail,
} from "@/lib/admin-email";
import { safeDbRead } from "@/lib/safe-db";
import type { UserRole } from "@/types/user";

export { getAdminEmail, isAdminEmail } from "@/lib/admin-email";

export function isClerkUserAdmin(user: ClerkUser): boolean {
  return isClerkUserAdminByEmail(user);
}

async function hasAdminAccessHeader(): Promise<boolean> {
  try {
    const headerStore = await headers();
    return headerStore.get("x-admin-access") === "true";
  } catch {
    return false;
  }
}

async function isClerkUserAdminFromApi(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return isClerkUserAdminByEmail(user);
  } catch {
    return false;
  }
}

/** Admin email is checked before any DB seller/buyer role. */
export async function resolveAdminAccess(): Promise<boolean> {
  if (await hasAdminAccessHeader()) {
    return true;
  }

  const { userId } = await auth();
  if (!userId) return false;

  const user = await currentUser();
  if (user && isClerkUserAdmin(user)) {
    return true;
  }

  if (await isClerkUserAdminFromApi(userId)) {
    return true;
  }

  const dbUser = await syncCurrentUser();
  if (dbUser && isAdminEmail(dbUser.email)) {
    return true;
  }

  return dbUser?.role === "admin";
}

function clerkUserFields(user: ClerkUser) {
  return {
    clerkUserId: user.id,
    username: user.username ?? user.id.slice(0, 8),
    email: normalizeEmail(user.primaryEmailAddress?.emailAddress) ?? "",
  };
}

export function toUserRole(role: string): UserRole {
  if (role === "seller" || role === "admin") return role;
  return "buyer";
}

export async function syncClerkUser(user: ClerkUser) {
  const fields = clerkUserFields(user);
  const adminByEmail = isAdminEmail(fields.email);

  return safeDbRead(null, () =>
    prisma.user.upsert({
      where: { clerkUserId: user.id },
      create: {
        ...fields,
        role: adminByEmail ? "admin" : "buyer",
      },
      update: {
        username: fields.username,
        email: fields.email,
        ...(adminByEmail ? { role: "admin" as const } : {}),
      },
    }),
  );
}

export async function syncCurrentUser() {
  const user = await currentUser();
  if (!user) return null;
  return syncClerkUser(user);
}

export async function getCurrentUserRole(): Promise<UserRole> {
  if (await resolveAdminAccess()) {
    return "admin";
  }

  const dbUser = await syncCurrentUser();
  return dbUser ? toUserRole(dbUser.role) : "buyer";
}

export async function createUserFromWebhook(data: {
  id: string;
  username: string | null;
  email_addresses: Array<{ email_address: string }>;
}) {
  const email = data.email_addresses[0]?.email_address ?? "";

  return safeDbRead(null, () =>
    prisma.user.upsert({
      where: { clerkUserId: data.id },
      create: {
        clerkUserId: data.id,
        username: data.username ?? data.id.slice(0, 8),
        email,
        role: "buyer",
      },
      update: {},
    }),
  );
}
