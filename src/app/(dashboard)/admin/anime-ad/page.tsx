import { PageHeader } from "@/components/dashboard/PageHeader";
import { AnimeAdPanel } from "@/components/anime-ad/AnimeAdPanel";
import { recordToolVisit } from "@/lib/tool-visits";
import { currentUser } from "@clerk/nextjs/server";

export default async function AdminAnimeAdPage() {
  const user = await currentUser();
  void recordToolVisit("anime-ad-generator", user?.id);

  return (
    <>
      <PageHeader
        title="Anime Ad Generator"
        description="Generate anime-style ad concepts with hooks, scripts, visual direction, and AI image/video prompts. Admin-only — template-based, no external API."
      />
      <AnimeAdPanel />
    </>
  );
}
