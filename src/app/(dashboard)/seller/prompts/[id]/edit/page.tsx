import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PromptEditForm } from "@/components/dashboard/PromptEditForm";
import { prisma } from "@/lib/db";
import { getCategoriesFromDb } from "@/lib/marketplace";
import { safeDbRead } from "@/lib/safe-db";

interface EditPromptPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPromptPage({ params }: EditPromptPageProps) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) notFound();

  const dbUser = await safeDbRead(null, () =>
    prisma.user.findUnique({ where: { clerkUserId: user.id } }),
  );
  if (!dbUser) notFound();

  const prompt = await safeDbRead(null, () =>
    prisma.prompt.findFirst({
      where: { id, sellerId: dbUser.id },
      include: { tags: { include: { tag: true } } },
    }),
  );

  if (!prompt) notFound();

  const categories = await getCategoriesFromDb();

  return (
    <>
      <PageHeader title="Edit Prompt" description="Update your listing details." />
      <PromptEditForm
        prompt={{
          id: prompt.id,
          title: prompt.title,
          description: prompt.description,
          content: prompt.content,
          price: prompt.price,
          status: prompt.status,
          categoryId: prompt.categoryId,
          tags: prompt.tags.map((t) => t.tag.name),
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  );
}
