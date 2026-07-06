import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { AcquisitionSourceStats } from "@/lib/analytics/acquisition-sources";

const MEDALS = ["🥇", "🥈", "🥉", "🏅"] as const;

type TopAcquisitionSourcesCardProps = {
  stats: AcquisitionSourceStats;
};

export function TopAcquisitionSourcesCard({
  stats,
}: TopAcquisitionSourcesCardProps) {
  const ranked = stats.sources.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Top Acquisition Sources</h2>
        <p className="text-sm text-muted-foreground">
          Tool visits by UTM channel · all time
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {ranked.every((row) => row.totalVisits === 0) ? (
          <p className="text-sm text-muted-foreground">
            No UTM-attributed visits yet.
          </p>
        ) : (
          <ul className="space-y-3 text-sm">
            {ranked.map((row, index) => (
              <li
                key={row.key}
                className="flex items-center justify-between gap-4"
              >
                <span className="font-medium">
                  {MEDALS[index] ?? "•"} {row.label}
                </span>
                <span className="shrink-0 text-right tabular-nums text-muted-foreground">
                  {row.totalVisits.toLocaleString()} visitor
                  {row.totalVisits === 1 ? "" : "s"}
                  {row.visitsToday > 0 && (
                    <span className="block text-xs">
                      {row.visitsToday.toLocaleString()} today
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
