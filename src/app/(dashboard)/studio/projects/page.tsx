import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StudioProjectForm } from "@/components/studio/StudioProjectForm";
import { StudioProjectList } from "@/components/studio/StudioProjectList";
import { StudioUpgradeBanner } from "@/components/studio/StudioUpgradeBanner";
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
      <PageHeader
        title="Production Projects"
        description="Autonomous YouTube production — research, script, storyboard, assets, voice, video, SEO, and publish prep from one topic."
        action={
          <Link href="/studio">
            <Button type="button" variant="outline" size="sm">
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
