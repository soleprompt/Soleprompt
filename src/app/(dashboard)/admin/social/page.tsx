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
        description="Generate and auto-publish a daily X content mix: 3–5 originals, demo video, customer wins, AI tips, and YouTube examples (up to 12 tweets/day across posts and replies)."
      />
      <AdminSocialNav />
      <AdminSocialPanel initialPosts={posts} statusFilter={statusFilter} />
    </>
  );
}
