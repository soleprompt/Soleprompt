import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-electric text-white shadow-lg shadow-electric/25 hover:bg-electric/90 hover:shadow-electric/40":
              variant === "primary",
            "bg-purple text-white shadow-lg shadow-purple/25 hover:bg-purple/90 hover:shadow-purple/40":
              variant === "secondary",
            "text-foreground hover:bg-foreground/5": variant === "ghost",
            "border border-border bg-transparent text-foreground hover:border-electric/50 hover:bg-electric/5":
              variant === "outline",
          },
          {
            "h-9 px-4 text-sm": size === "sm",
            "h-11 px-6 text-sm": size === "md",
            "h-12 px-8 text-base": size === "lg",
          },
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };
