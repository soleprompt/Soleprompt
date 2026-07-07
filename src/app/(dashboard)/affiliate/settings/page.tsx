import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AffiliateSettingsForm } from "@/components/affiliate/AffiliateSettingsForm";
import { getAffiliateByUserId } from "@/lib/affiliate-program";
import { syncClerkUser } from "@/lib/user";

export default async function AffiliateSettingsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const dbUser = await syncClerkUser(clerkUser);
  if (!dbUser) redirect("/buyer");

  const affiliate = await getAffiliateByUserId(dbUser.id);
  if (!affiliate) redirect("/affiliate");

  return (
    <>
      <PageHeader title="Affiliate Settings" description="Payout preferences." />
      <AffiliateSettingsForm
        payoutEmail={affiliate.payoutEmail}
        payoutMethod={affiliate.payoutMethod}
      />
    </>
  );
}
