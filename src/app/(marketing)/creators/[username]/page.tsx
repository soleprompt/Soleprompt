import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  FileText,
  User,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PromptCard } from "@/components/marketplace/PromptCard";
import { Card, CardContent } from "@/components/ui/Card";
import { getCreatorByUsername } from "@/lib/marketplace";

interface CreatorPageProps {
  params: Promise<{ username: string }>;
}

export default async function CreatorPage({ params }: CreatorPageProps) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);

  if (!creator) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/explore"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to marketplace
      </Link>

      <Card className="mb-10">
        <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-electric/20 to-purple/20">
            <User className="h-10 w-10 text-electric" />
          </div>
          <div className="flex-1">
            <PageHeader
              title={creator.displayName}
              description={creator.bio ?? `Creator on SolePrompt`}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">@{creator.username}</p>
              {creator.verified && <VerifiedBadge />}
            </div>
            <div className="mt-4 flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <FileText className="h-4 w-4 text-electric" />
                <strong className="text-foreground">{creator.promptCount}</strong>{" "}
                prompts
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <ShoppingBag className="h-4 w-4 text-electric" />
                <strong className="text-foreground">{creator.totalSales}</strong>{" "}
                sales
              </span>
              {creator.avgRating > 0 && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Star className="h-4 w-4 fill-electric text-electric" />
                  <strong className="text-foreground">{creator.avgRating}</strong>{" "}
                  avg rating
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-6 text-xl font-semibold text-foreground">
        Published Prompts
      </h2>

      {creator.prompts.length === 0 ? (
        <p className="text-muted-foreground">No published prompts yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creator.prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}
