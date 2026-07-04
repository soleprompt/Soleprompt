import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { getCategoriesWithCounts } from "@/lib/marketplace";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <>
      <PageHeader
        title="Categories"
        description="Manage marketplace categories and organization."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{category.name}</h3>
                <span className="text-sm text-muted-foreground">
                  {category.count} prompts
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {category.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
