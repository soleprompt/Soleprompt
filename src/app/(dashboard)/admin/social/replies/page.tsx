import { PageHeader } from "@/components/dashboard/PageHeader";
import { AdminSocialRepliesPanel } from "@/components/dashboard/AdminSocialRepliesPanel";
import { prisma } from "@/lib/db";
import type { SocialPostStatus } from "@/generated/prisma/client";

interface AdminSocialRepliesPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminSocialRepliesPage({
  searchParams,
}: AdminSocialRepliesPageProps) {
  const { status } = await searchParams;
  const statusFilter = status && status !== "all" ? status : "all";

  const replies = await prisma.socialReply.findMany({
    where:
      statusFilter !== "all"
        ? { status: statusFilter as SocialPostStatus }
        : undefined,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Social — Replies"
        description="Find relevant X posts, generate helpful reply drafts, and post only after admin approval. No auto-reply."
      />
      <AdminSocialRepliesPanel
        initialReplies={replies}
        statusFilter={statusFilter}
      />
    </>
  );
}
