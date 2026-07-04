import { PageHeader } from "@/components/dashboard/PageHeader";
import { PromptUploadForm } from "@/components/dashboard/PromptUploadForm";
import { getCategoriesFromDb } from "@/lib/marketplace";

export default async function SellerUploadPage() {
  const categories = await getCategoriesFromDb();

  return (
    <>
      <PageHeader
        title="Upload Prompt"
        description="Create a new listing for the marketplace."
      />
      <PromptUploadForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  );
}
