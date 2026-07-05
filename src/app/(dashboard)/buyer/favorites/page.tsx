import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FavoritePromptCard } from "@/components/marketplace/FavoritePromptCard";
import { getBuyerWishlist } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Favorites",
};

export default async function BuyerFavoritesPage() {
  const user = await currentUser();
  const favorites = user ? await getBuyerWishlist(user.id) : [];

  return (
    <>
      <PageHeader
        title="Favorites"
        description="Prompts you've saved for later — remove any time."
      />
      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
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
          {favorites.map((item) => (
            <FavoritePromptCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
