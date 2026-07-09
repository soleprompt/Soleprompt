import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft, Layers } from "lucide-react";
import { redirect } from "next/navigation";
import { StudioProjectForm } from "@/components/studio/StudioProjectForm";
import { StudioProjectList } from "@/components/studio/StudioProjectList";
import { StudioUpgradeBanner } from "@/components/studio/StudioUpgradeBanner";
import { StudioBrandPill, StudioPageHeader } from "@/components/studio/studio-ui";
import { Button } from "@/components/ui/Button";
import { listStudioProjectsForUser } from "@/lib/studio/projects/data";
import { recordToolVisit } from "@/lib/tool-visits";
import { syncCurrentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function StudioProjectsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  void recordToolVisit("studio", user.id);

  const dbUser = await syncCurrentUser();
  const projects = dbUser ? await listStudioProjectsForUser(dbUser.id) : [];

  return (
    <>
      <StudioPageHeader
        badge={
          <StudioBrandPill>
            <Layers className="h-3.5 w-3.5" />
            Production workspace
          </StudioBrandPill>
        }
        title="Studio Projects"
        description="Create a project and get research, script, storyboard, thumbnail concepts, and SEO — all in one dashboard."
        action={
          <Link href="/studio">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.05]"
            >
              <ArrowLeft className="h-4 w-4" />
              Quick package
            </Button>
          </Link>
        }
      />

      <div className="space-y-8">
        <StudioUpgradeBanner />
        <StudioProjectForm />
        <StudioProjectList projects={projects} />
      </div>
    </>
  );
}
