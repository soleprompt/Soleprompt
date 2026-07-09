import { PageHeader } from "@/components/dashboard/PageHeader";
import { AdminSocialNav } from "@/components/dashboard/AdminSocialNav";
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
        title="Social — Posts"
        description="Generate promotional X posts for getsoleprompt.com. Auto-approved posts publish via cron (up to 10 tweets/day across posts and replies)."
      />
      <AdminSocialNav />
      <AdminSocialPanel initialPosts={posts} statusFilter={statusFilter} />
    </>
  );
}
