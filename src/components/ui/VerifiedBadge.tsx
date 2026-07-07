import { Badge } from "@/components/ui/Badge";
import { CheckCircle2 } from "lucide-react";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="electric" className={className}>
      <CheckCircle2 className="mr-1 h-3 w-3" />
      Verified Creator
    </Badge>
  );
}
