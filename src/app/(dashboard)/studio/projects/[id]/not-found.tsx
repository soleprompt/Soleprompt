import Link from "next/link";
import { FolderX } from "lucide-react";
import {
  StudioEmptyState,
  StudioGlassCard,
  StudioPageHeader,
} from "@/components/studio/studio-ui";
import { Button } from "@/components/ui/Button";

export default function StudioProjectNotFound() {
  return (
    <>
      <StudioPageHeader
        title="Project not found"
        description="This production project doesn't exist or you don't have access to it."
      />
      <StudioGlassCard>
        <StudioEmptyState
          icon={FolderX}
          variant="purple"
          title="Project unavailable"
          description="The project may have been deleted or you may not have permission to view it."
        />
        <div className="border-t border-white/[0.06] px-6 pb-8 text-center">
          <Link href="/studio/projects">
            <Button type="button" variant="secondary">
              Back to projects
            </Button>
          </Link>
        </div>
      </StudioGlassCard>
    </>
  );
}
