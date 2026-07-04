import { Star } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function SellerReviewsPage() {
  return (
    <>
      <PageHeader
        title="Reviews"
        description="See what buyers are saying about your prompts."
      />
      <EmptyState
        icon={Star}
        title="No reviews yet"
        description="Reviews from buyers will appear here after they purchase your prompts."
      />
    </>
  );
}
