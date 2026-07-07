import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { getAffiliateDashboard } from "@/lib/affiliate-program";
import { syncClerkUser } from "@/lib/user";

const SNIPPETS = [
  "10 AI tools every college student should know — explore SolePrompt",
  "I built an AI tool stack that saves 5 hours every week. Start here:",
  "Free AI Academy + premium tools for students and creators:",
  "The exact prompts that helped me land internships and grow faster:",
];

export default async function AffiliateAssetsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const dbUser = await syncClerkUser(clerkUser);
  if (!dbUser) redirect("/buyer");

  const dashboard = await getAffiliateDashboard(dbUser.id);
  if (!dashboard) redirect("/affiliate");

  return (
    <>
      <PageHeader
        title="Marketing Assets"
        description="Copy-ready posts and your referral link."
      />

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Your link</h2>
        </CardHeader>
        <CardContent className="pt-0">
          <code className="block overflow-x-auto rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
            {dashboard.referralLink}
          </code>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Social post ideas</h2>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {SNIPPETS.map((snippet) => (
            <div
              key={snippet}
              className="rounded-xl border border-border bg-card/40 p-4 text-sm leading-relaxed"
            >
              {snippet}
              <br />
              <span className="text-electric">{dashboard.referralLink}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
