import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { BookOpen } from "lucide-react";
import { OnboardingChecklistSection } from "@/components/dashboard/OnboardingChecklistSection";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StartSellingButton } from "@/components/dashboard/StartSellingButton";
import { PurchasedPromptCard } from "@/components/marketplace/PurchasedPromptCard";
import { getBuyerPurchases } from "@/lib/marketplace";
import { getCurrentUserRole } from "@/lib/user";

export default async function BuyerLibraryPage() {
  const [role, user] = await Promise.all([getCurrentUserRole(), currentUser()]);
  const purchases = user ? await getBuyerPurchases(user.id) : [];

  return (
    <>
      <OnboardingChecklistSection />
      <PageHeader
        title="My Library"
        description="All your purchased prompts — reopen or download anytime."
      />
      {role === "buyer" && (
        <div className="mb-6 flex justify-end">
          <StartSellingButton size="md" variant="outline" />
        </div>
      )}
      {purchases.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Your library is empty"
          description="When you buy prompts from the marketplace, they'll appear here for easy access."
          action={
            <Link
              href="/explore"
              className="mt-4 inline-block text-sm text-electric hover:underline"
            >
              Explore prompts
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {purchases.map((purchase) => (
            <PurchasedPromptCard key={purchase.id} purchase={purchase} />
          ))}
        </div>
      )}
    </>
  );
}
