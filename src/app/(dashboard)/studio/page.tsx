import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Layers } from "lucide-react";
import { redirect } from "next/navigation";
import { StudioForm } from "@/components/studio/StudioForm";
import { StudioHistory } from "@/components/studio/StudioHistory";
import { StudioUpgradeBanner } from "@/components/studio/StudioUpgradeBanner";
import { StudioBrandPill, StudioPageHeader } from "@/components/studio/studio-ui";
import { Button } from "@/components/ui/Button";
import { listYouTubePackagesForUser } from "@/lib/studio/data";
import { getStudioAccess } from "@/lib/studio/subscription";
import { recordToolVisit } from "@/lib/tool-visits";
import { syncCurrentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  void recordToolVisit("studio", user.id);

  const dbUser = await syncCurrentUser();
  const packages = dbUser ? await listYouTubePackagesForUser(dbUser.id) : [];
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
        title="SolePrompt Studio"
        description="Generate a complete YouTube video package from one topic — titles, script, description, tags, and more."
        action={
          <Link href="/studio/projects">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shadow-[0_0_24px_rgba(139,92,246,0.2)]"
            >
              Full production
            </Button>
          </Link>
        }
      />

      <div className="space-y-8">
        {access && <StudioUpgradeBanner access={access} />}
        <StudioForm />
        <StudioHistory packages={packages} />
      </div>
    </>
  );
}
