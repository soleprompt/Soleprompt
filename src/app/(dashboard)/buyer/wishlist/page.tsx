import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PromptCard } from "@/components/marketplace/PromptCard";
import { getBuyerWishlist } from "@/lib/marketplace";

export default async function BuyerWishlistPage() {
  const user = await currentUser();
  const wishlist = user ? await getBuyerWishlist(user.id) : [];

  return (
    <>
      <PageHeader
        title="Wishlist"
        description="Prompts you've saved for later."
      />
      {wishlist.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save prompts you're interested in and come back to purchase them anytime."
          action={
            <Link
              href="/explore"
              className="mt-4 inline-block text-sm text-electric hover:underline"
            >
              Browse prompts
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <PromptCard key={item.id} prompt={item.prompt} />
          ))}
        </div>
      )}
    </>
  );
}
