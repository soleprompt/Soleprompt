import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CreatorSettingsForms } from "@/components/dashboard/CreatorSettingsForms";
import { getCreatorProfile } from "@/lib/creator-program";
import { syncClerkUser } from "@/lib/user";

export const metadata: Metadata = {
  title: "Creator Settings",
};

export default async function SellerSettingsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const dbUser = await syncClerkUser(clerkUser);
  if (!dbUser) redirect("/buyer");

  const profile = await getCreatorProfile(dbUser.id);
  if (!profile) redirect("/seller");

  return (
    <>
      <PageHeader
        title="Creator Settings"
        description="Manage your public profile and payout details."
      />
      <CreatorSettingsForms
        displayName={profile.displayName}
        bio={profile.bio}
        payoutEmail={profile.payoutEmail}
        payoutMethod={profile.payoutMethod}
      />
    </>
  );
}
