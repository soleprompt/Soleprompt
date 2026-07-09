"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type CopySectionProps = {
  title: string;
  content: string;
  className?: string;
  mono?: boolean;
};

export function CopySection({
  title,
  content,
  className,
  mono = false,
}: CopySectionProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className={cn("rounded-2xl border border-border bg-card/50", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div
        className={cn(
          "whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed text-muted-foreground sm:px-6",
          mono && "font-mono text-xs",
        )}
      >
        {content}
      </div>
    </section>
  );
}
