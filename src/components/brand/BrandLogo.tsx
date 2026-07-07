import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** Full wordmark image for hero/footer; compact uses icon + text */
  variant?: "compact" | "wordmark";
  showTagline?: boolean;
}

export function BrandLogo({
  className,
  variant = "compact",
  showTagline = false,
}: BrandLogoProps) {
  if (variant === "wordmark") {
    return (
      <Link href="/" className={cn("inline-flex flex-col items-center", className)}>
        <Image
          src="/brand/logo-wordmark.png"
          alt="SolePrompt — Better Prompts. Better Results."
          width={280}
          height={280}
          className="h-auto w-full max-w-[220px] object-contain sm:max-w-[260px]"
          priority
        />
        {showTagline && (
          <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            AI prompts for business, marketing &amp; productivity
          </p>
        )}
      </Link>
    );
  }

  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo-icon.svg"
        alt=""
        width={36}
        height={36}
        className="h-8 w-8 shrink-0 transition-transform duration-300 group-hover:scale-105 sm:h-9 sm:w-9"
        priority
      />
      <span className="text-lg font-semibold tracking-tight">
        <span className="text-foreground">Sole</span>
        <span className="bg-gradient-to-r from-cyan-400 via-electric to-purple bg-clip-text text-transparent">
          Prompt
        </span>
      </span>
    </Link>
  );
}
