/**
 * Edge-safe admin email helpers (no Prisma/Node-only imports).
 * ADMIN_EMAIL must be set in Vercel project env for production admin access.
 */
export function getAdminEmail(): string | undefined {
  const raw = process.env.ADMIN_EMAIL;
  if (!raw) return undefined;

  const email = raw.trim().replace(/^["']|["']$/g, "");
  return email || undefined;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmail = getAdminEmail();
  if (!adminEmail || !email) return false;

  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
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
