"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { studioGlass } from "@/components/studio/studio-ui";
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
    <section
      className={cn(
        studioGlass,
        "overflow-hidden animate-studio-fade-in-up",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3.5 sm:px-6">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="border-white/[0.1] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.05]"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-electric" />
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
          "whitespace-pre-wrap px-4 py-5 text-sm leading-relaxed text-muted-foreground sm:px-6",
          mono && "font-mono text-xs",
        )}
      >
        {content}
      </div>
    </section>
  );
}
