"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DownloadPromptButtonProps {
  title: string;
  content: string;
  className?: string;
}

function sanitizeFilename(title: string): string {
  return title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "prompt";
}

export function DownloadPromptButton({
  title,
  content,
  className,
}: DownloadPromptButtonProps) {
  function handleDownload() {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${sanitizeFilename(title)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={handleDownload}
    >
      <Download className="h-4 w-4" />
      Download
    </Button>
  );
}
