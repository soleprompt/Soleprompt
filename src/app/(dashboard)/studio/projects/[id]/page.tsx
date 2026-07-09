import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { StudioMvpDashboard } from "@/components/studio/StudioMvpDashboard";
import { getMvpProjectState } from "@/lib/studio/projects/mvp-workflow";
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
  const mvp = await getMvpProjectState(id, dbUser.id);

  if (!mvp) {
    notFound();
  }

  return <StudioMvpDashboard initialState={mvp} />;
}
