import { PageHeader } from "@/components/dashboard/PageHeader";
import { AdminSocialEngagePanel } from "@/components/dashboard/AdminSocialEngagePanel";
import {
  getEngagePosts,
  getEngageTargetAccounts,
} from "@/lib/social/engage-data";

interface AdminSocialEngagePageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminSocialEngagePage({
  searchParams,
}: AdminSocialEngagePageProps) {
  const { status } = await searchParams;
  const statusFilter = status && status !== "all" ? status : "all";

  const [{ data: accounts, error: accountsError }, { data: posts, error: postsError }] =
    await Promise.all([
      getEngageTargetAccounts(),
      getEngagePosts(statusFilter),
    ]);

  const loadError = accountsError ?? postsError;

  return (
    <>
      <PageHeader
        title="Engage"
        description="Monitor large X accounts for relevant posts and generate replies. Auto-approved drafts publish via cron (up to 10 tweets/day)."
      />
      <AdminSocialEngagePanel
        initialAccounts={accounts}
        initialPosts={posts}
        statusFilter={statusFilter}
        loadError={loadError}
      />
    </>
  );
}
