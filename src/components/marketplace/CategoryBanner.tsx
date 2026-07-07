import Image from "next/image";
import { getCategoryVisual } from "@/lib/category-visuals";
import { getCategoryHeaderImage, isSvgImageSrc } from "@/lib/tool-images";
import { cn } from "@/lib/utils";

interface CategoryBannerProps {
  slug: string;
  name: string;
  count?: number;
  className?: string;
}

export function CategoryBanner({
  slug,
  name,
  count,
  className,
}: CategoryBannerProps) {
  const visual = getCategoryVisual(slug);
  const Icon = visual.icon;
  const headerImage = getCategoryHeaderImage(slug);

  if (headerImage) {
    return (
      <div
        className={cn(
          "relative mb-8 overflow-hidden rounded-2xl border border-border",
          className,
        )}
      >
        <div className="relative aspect-[15/4] w-full min-h-[140px] sm:min-h-[160px]">
          <Image
            src={headerImage}
            alt=""
            fill
            unoptimized={isSvgImageSrc(headerImage)}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center gap-5 px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-black/50 backdrop-blur-sm ring-1 ring-white/10 sm:h-20 sm:w-20">
            <Icon className={cn("h-8 w-8 sm:h-10 sm:w-10", visual.iconColor)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {name}
              </h1>
              <span className="text-2xl opacity-80" aria-hidden>
                {visual.emoji}
              </span>
            </div>
            {count !== undefined && (
              <p className="mt-1 text-sm text-white/70">
                {count.toLocaleString()} AI tool{count === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative mb-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-br",
        visual.gradient,
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 50%, rgba(255,255,255,0.06) 0%, transparent 45%), radial-gradient(circle at 90% 30%, rgba(0,102,255,0.15) 0%, transparent 40%)",
        }}
      />
      <div className="relative flex items-center gap-5 px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-black/40 backdrop-blur-sm ring-1 ring-white/10 sm:h-20 sm:w-20">
          <Icon className={cn("h-8 w-8 sm:h-10 sm:w-10", visual.iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {name}
            </h1>
            <span className="text-2xl opacity-60" aria-hidden>
              {visual.emoji}
            </span>
          </div>
          {count !== undefined && (
            <p className="mt-1 text-sm text-muted-foreground">
              {count.toLocaleString()} AI tool{count === 1 ? "" : "s"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
