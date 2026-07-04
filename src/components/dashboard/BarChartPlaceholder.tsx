import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface BarChartPlaceholderProps {
  title: string;
  description?: string;
  data: { label: string; value: number }[];
}

export function BarChartPlaceholder({
  title,
  description,
  data,
}: BarChartPlaceholderProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex h-48 items-end justify-between gap-2 sm:gap-3">
          {data.map((item) => (
            <div
              key={item.label}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-electric/80 to-purple/60 transition-all"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
