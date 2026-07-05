/**
 * Edge-safe admin email helpers (no Prisma/Node-only imports).
 * ADMIN_EMAIL must be set in Vercel project env for production admin access.
 */
export function normalizeEmail(
  email: string | null | undefined,
): string | undefined {
  if (!email) return undefined;

  const normalized = email.trim().toLowerCase();
  return normalized || undefined;
}

export function getAdminEmail(): string | undefined {
  const raw = process.env.ADMIN_EMAIL;
  if (!raw) return undefined;

  const email = raw.trim().replace(/^["']|["']$/g, "");
  return normalizeEmail(email);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmail = getAdminEmail();
  const normalized = normalizeEmail(email);
  if (!adminEmail || !normalized) return false;

  return normalized === adminEmail;
}

export function isAnyAdminEmail(
  emails: Array<string | null | undefined>,
): boolean {
  return emails.some((email) => isAdminEmail(email));
}

export function getEmailsFromClerkUser(user: {
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses: Array<{ emailAddress: string }>;
}): string[] {
  const emails = new Set<string>();

  if (user.primaryEmailAddress?.emailAddress) {
    emails.add(user.primaryEmailAddress.emailAddress);
  }

  for (const address of user.emailAddresses) {
    if (address.emailAddress) {
      emails.add(address.emailAddress);
    }
  }

  return [...emails];
}

export function isClerkUserAdminByEmail(user: {
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses: Array<{ emailAddress: string }>;
}): boolean {
  return isAnyAdminEmail(getEmailsFromClerkUser(user));
}
