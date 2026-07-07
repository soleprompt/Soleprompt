import { PageHeader } from "@/components/dashboard/PageHeader";
import { CategoryCard } from "@/components/marketplace/CategoryCard";
import { getCategoriesWithCounts } from "@/lib/marketplace";

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="AI Tool Categories"
        description="Landing pages for sales, marketing, solar, productivity, and more — find the right AI tool for your workflow."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
