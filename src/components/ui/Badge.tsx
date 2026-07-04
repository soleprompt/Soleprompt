import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "electric" | "purple" | "outline";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-foreground/5 text-muted-foreground": variant === "default",
          "bg-electric/10 text-electric": variant === "electric",
          "bg-purple/10 text-purple": variant === "purple",
          "border border-border text-muted-foreground": variant === "outline",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
