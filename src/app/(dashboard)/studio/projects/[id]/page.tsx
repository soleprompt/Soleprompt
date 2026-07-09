import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { StudioProjectDashboard } from "@/components/studio/StudioProjectDashboard";
import { getStudioProjectForUser } from "@/lib/studio/projects/data";
import { syncCurrentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function StudioProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const project = await getStudioProjectForUser(id, dbUser.id);

  if (!project) {
    notFound();
  }

  return <StudioProjectDashboard initialProject={project} />;
}
