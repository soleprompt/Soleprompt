import Link from "next/link";
import { PackageX } from "lucide-react";
import {
  StudioEmptyState,
  StudioGlassCard,
  StudioPageHeader,
} from "@/components/studio/studio-ui";
import { Button } from "@/components/ui/Button";

export default function StudioPackageNotFound() {
  return (
    <>
      <StudioPageHeader
        title="Package not found"
        description="This YouTube package doesn't exist or you don't have access to it."
      />
      <StudioGlassCard>
        <StudioEmptyState
          icon={PackageX}
          variant="electric"
          title="Package unavailable"
          description="The package may have been deleted or you may not have permission to view it."
        />
        <div className="border-t border-white/[0.06] px-6 pb-8 text-center">
          <Link href="/studio">
            <Button type="button" variant="primary">
              Back to Studio
            </Button>
          </Link>
        </div>
      </StudioGlassCard>
    </>
  );
}
