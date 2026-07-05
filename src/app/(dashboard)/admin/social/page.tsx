import { PageHeader } from "@/components/dashboard/PageHeader";
import { AdminSocialPanel } from "@/components/dashboard/AdminSocialPanel";
import { prisma } from "@/lib/db";
import type { SocialPostStatus } from "@/generated/prisma/client";

interface AdminSocialPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminSocialPage({
  searchParams,
}: AdminSocialPageProps) {
  const { status } = await searchParams;
  const statusFilter = status && status !== "all" ? status : "all";

  const posts = await prisma.socialPost.findMany({
    where:
      statusFilter !== "all"
        ? { status: statusFilter as SocialPostStatus }
        : undefined,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Social"
        description="Generate, approve, and schedule promotional X posts for getsoleprompt.com. Approved posts only — no automation beyond scheduled publishing."
      />
      <AdminSocialPanel initialPosts={posts} statusFilter={statusFilter} />
    </>
  );
}
