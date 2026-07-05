import { PageHeader } from "@/components/dashboard/PageHeader";
import { AdminSocialRepliesPanel } from "@/components/dashboard/AdminSocialRepliesPanel";
import { REPLY_ASSISTANT_LABEL } from "@/lib/navigation";
import { getAdminSocialReplies } from "@/lib/social/reply-data";

interface AdminSocialRepliesPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminSocialRepliesPage({
  searchParams,
}: AdminSocialRepliesPageProps) {
  const { status } = await searchParams;
  const statusFilter = status && status !== "all" ? status : "all";

  const { data: replies, error: loadError } =
    await getAdminSocialReplies(statusFilter);

  return (
    <>
      <PageHeader
        title={REPLY_ASSISTANT_LABEL}
        description="Find relevant X posts, generate helpful reply drafts, and post only after admin approval. No auto-reply."
      />
      <AdminSocialRepliesPanel
        initialReplies={replies}
        statusFilter={statusFilter}
        loadError={loadError}
      />
    </>
  );
}
