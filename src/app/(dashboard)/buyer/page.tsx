import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StartSellingButton } from "@/components/dashboard/StartSellingButton";
import { PromptCard } from "@/components/marketplace/PromptCard";
import { getBuyerPurchases } from "@/lib/marketplace";
import { getCurrentUserRole } from "@/lib/user";

export default async function BuyerPurchasedPage() {
  const [role, user] = await Promise.all([getCurrentUserRole(), currentUser()]);
  const purchases = user ? await getBuyerPurchases(user.id) : [];

  return (
    <>
      <PageHeader
        title="My Purchases"
        description="Access all the premium prompts you've purchased."
      />
      {role === "buyer" && (
        <div className="mb-6 flex justify-end">
          <StartSellingButton size="md" variant="outline" />
        </div>
      )}
      {purchases.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No purchases yet"
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
            <PromptCard key={purchase.id} prompt={purchase.prompt} />
          ))}
        </div>
      )}
    </>
  );
}
