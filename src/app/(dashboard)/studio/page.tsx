import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Rocket } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StudioForm } from "@/components/studio/StudioForm";
import { StudioHistory } from "@/components/studio/StudioHistory";
import { StudioUpgradeBanner } from "@/components/studio/StudioUpgradeBanner";
import { Button } from "@/components/ui/Button";
import { listYouTubePackagesForUser } from "@/lib/studio/data";
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

  return (
    <>
      <PageHeader
        title="SolePrompt Studio"
        description="Generate a complete YouTube video package from one topic — titles, script, description, tags, and more."
        action={
          <Link href="/studio/projects">
            <Button type="button" variant="secondary" size="sm">
              <Rocket className="h-4 w-4" />
              Full production
            </Button>
          </Link>
        }
      />

      <div className="space-y-8">
        <StudioUpgradeBanner />
        <StudioForm />
        <StudioHistory packages={packages} />
      </div>
    </>
  );
}
