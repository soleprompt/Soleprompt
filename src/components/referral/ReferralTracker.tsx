"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  REFERRAL_COOKIE_NAME,
  REFERRAL_QUERY_PARAM,
} from "@/lib/affiliate-program";

const COOKIE_MAX_AGE_DAYS = 30;

export function ReferralTracker() {
  const searchParams = useSearchParams();
  const ref = searchParams.get(REFERRAL_QUERY_PARAM);

  useEffect(() => {
    if (!ref) return;

    const code = ref.trim();
    if (!code) return;

    document.cookie = `${REFERRAL_COOKIE_NAME}=${encodeURIComponent(code)}; path=/; max-age=${COOKIE_MAX_AGE_DAYS * 24 * 60 * 60}; samesite=lax`;

    void fetch("/api/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        landingPath: window.location.pathname,
      }),
    });
  }, [ref]);

  return null;
}
