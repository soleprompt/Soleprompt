import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";

export default function StudioPackageNotFound() {
  return (
    <>
      <PageHeader
        title="Package not found"
        description="This YouTube package doesn't exist or you don't have access to it."
      />
      <div className="rounded-2xl border border-border bg-card/50 p-8 text-center">
        <Link href="/studio">
          <Button type="button" variant="primary">
            Back to Studio
          </Button>
        </Link>
      </div>
    </>
  );
}
