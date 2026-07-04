import { Card, CardContent } from "@/components/ui/Card";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-electric/10">
          <Icon className="h-7 w-7 text-electric" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        {action}
      </CardContent>
    </Card>
  );
}
