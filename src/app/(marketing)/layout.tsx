import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HashScrollHandler } from "@/components/layout/HashScrollHandler";
import { ReferralTracker } from "@/components/referral/ReferralTracker";

export const dynamic = "force-dynamic";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HashScrollHandler />
      <Suspense fallback={null}>
        <ReferralTracker />
      </Suspense>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
