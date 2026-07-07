import { cookies } from "next/headers";
import { REFERRAL_COOKIE_NAME } from "@/lib/affiliate-program";

export async function getReferralCodeFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(REFERRAL_COOKIE_NAME)?.value?.trim();
    return value || null;
  } catch {
    return null;
  }
}
