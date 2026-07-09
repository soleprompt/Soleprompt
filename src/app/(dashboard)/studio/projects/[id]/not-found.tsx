import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";

export default function StudioProjectNotFound() {
  return (
    <>
      <PageHeader
        title="Project not found"
        description="This production project doesn't exist or you don't have access to it."
      />
      <div className="rounded-2xl border border-border bg-card/50 p-8 text-center">
        <Link href="/studio/projects">
          <Button type="button" variant="primary">
            Back to projects
          </Button>
        </Link>
      </div>
    </>
  );
}
