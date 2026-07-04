import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  change,
  trend = "neutral",
  icon,
}: StatCardProps) {
  return (
    <Card hover>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-electric/10">
              {icon}
            </div>
          )}
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        {change && (
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-xs font-medium",
              trend === "up" && "text-emerald-500",
              trend === "down" && "text-red-400",
              trend === "neutral" && "text-muted-foreground",
            )}
          >
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            {change}
            {trend !== "neutral" && (
              <span className="font-normal text-muted-foreground">
                vs last month
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
