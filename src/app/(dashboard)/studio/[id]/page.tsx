import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { StudioPackageView } from "@/components/studio/StudioPackageView";
import { getYouTubePackageForUser } from "@/lib/studio/data";
import { syncCurrentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function StudioPackagePage({
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
  const pkg = await getYouTubePackageForUser(id, dbUser.id);

  if (!pkg) {
    notFound();
  }

  return <StudioPackageView pkg={pkg} />;
}
