import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft, Layers } from "lucide-react";
import { redirect } from "next/navigation";
import { StudioProjectForm } from "@/components/studio/StudioProjectForm";
import { StudioProjectList } from "@/components/studio/StudioProjectList";
import { StudioProductionFlow } from "@/components/studio/StudioProductionFlow";
import { StudioUpgradeBanner } from "@/components/studio/StudioUpgradeBanner";
import { StudioBrandPill, StudioPageHeader } from "@/components/studio/studio-ui";
import { Button } from "@/components/ui/Button";
import { listStudioProjectsForUser } from "@/lib/studio/projects/data";
import { getStudioAccess } from "@/lib/studio/subscription";
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
  const access = dbUser ? await getStudioAccess(dbUser.id) : null;

  return (
    <>
      <StudioPageHeader
        badge={
          <StudioBrandPill>
            <Layers className="h-3.5 w-3.5" />
            SolePrompt Studio
          </StudioBrandPill>
        }
        title="SolePrompt Studio Projects"
        description="Type one idea — research, script, storyboard, thumbnails, and SEO generated in under a minute."
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
        {access && <StudioUpgradeBanner access={access} />}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:items-start">
          <StudioProjectForm
            canCreateProject={access?.canCreateProject ?? true}
            remainingProjects={access?.remainingProjects ?? null}
          />
          <StudioProductionFlow mode="demo" className="lg:sticky lg:top-6" />
        </div>
        <StudioProjectList projects={projects} />
      </div>
    </>
  );
}
