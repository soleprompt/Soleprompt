import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandWatermarkProps {
  src?: string;
  className?: string;
  opacity?: number;
}

/** Faint brand image for section backgrounds */
export function BrandWatermark({
  src = "/brand/hero-marketing.png",
  className,
  opacity = 0.06,
}: BrandWatermarkProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover object-center"
        style={{ opacity }}
        sizes="100vw"
        priority={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
    </div>
  );
}
