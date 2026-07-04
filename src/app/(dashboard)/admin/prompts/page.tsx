import { FileText } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function AdminPromptsPage() {
  return (
    <>
      <PageHeader
        title="Prompts"
        description="Review, approve, and manage marketplace listings."
      />
      <EmptyState
        icon={FileText}
        title="No prompts to manage"
        description="Prompt moderation tools will appear here as listings are submitted."
      />
    </>
  );
}
