import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-full border border-border bg-background/80 px-4 text-sm text-foreground backdrop-blur-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-electric/50 focus:outline-none focus:ring-2 focus:ring-electric/20",
            icon && "pl-11",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
