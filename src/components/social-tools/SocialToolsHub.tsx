import Link from "next/link";
import { ArrowRight, Briefcase, Camera, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  SOCIAL_TOOL_DESCRIPTIONS,
  SOCIAL_TOOL_LABELS,
  SOCIAL_TOOL_PLATFORMS,
  type SocialToolPlatform,
} from "@/lib/social-tools/constants";

const PLATFORM_ICONS: Record<
  SocialToolPlatform,
  React.ComponentType<{ className?: string }>
> = {
  facebook: Share2,
  instagram: Camera,
  linkedin: Briefcase,
};

export function SocialToolsHub() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {SOCIAL_TOOL_PLATFORMS.map((platform) => {
        const Icon = PLATFORM_ICONS[platform];
        const label = SOCIAL_TOOL_LABELS[platform];

        return (
          <Link key={platform} href={`/buyer/social/${platform}`}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold">{label}</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {SOCIAL_TOOL_DESCRIPTIONS[platform]}
                </p>
                <span className="inline-flex items-center text-sm font-medium text-primary">
                  Open tool
                  <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
