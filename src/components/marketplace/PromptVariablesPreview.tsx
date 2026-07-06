"use client";

import { useMemo, useState } from "react";
import { Braces } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  extractPromptVariables,
  fillPromptVariables,
} from "@/lib/prompt-variables";

interface PromptVariablesPreviewProps {
  content: string;
  locked?: boolean;
  variableNames?: string[];
}

function humanizeVariable(name: string) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function PromptVariablesPreview({
  content,
  locked = false,
  variableNames,
}: PromptVariablesPreviewProps) {
  const variables = useMemo(
    () => variableNames ?? extractPromptVariables(content),
    [content, variableNames],
  );
  const [values, setValues] = useState<Record<string, string>>({});

  if (variables.length === 0) return null;

  const preview = locked
    ? null
    : fillPromptVariables(content, values);

  return (
    <Card>
      <CardHeader>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Braces className="h-5 w-5 text-electric" />
          Variables Preview
        </h2>
        <p className="text-sm text-muted-foreground">
          {locked
            ? "Fill in sample values to preview how this prompt adapts before you buy."
            : "Customize variables to see how your prompt adapts."}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {!locked && (
          <div className="grid gap-3 sm:grid-cols-2">
            {variables.map((name) => (
              <div key={name}>
                <label
                  htmlFor={`var-${name}`}
                  className="mb-1.5 block text-sm font-medium"
                >
                  {humanizeVariable(name)}
                </label>
                <Input
                  id={`var-${name}`}
                  value={values[name] ?? ""}
                  placeholder={`Enter ${humanizeVariable(name).toLowerCase()}`}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [name]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Live preview
          </p>
          {locked ? (
            <p className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
              This prompt uses {variables.length} variable
              {variables.length === 1 ? "" : "s"}:{" "}
              {variables.map((name) => `{{${name}}}`).join(", ")}. Purchase to
              unlock the full template and live preview.
            </p>
          ) : (
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm leading-relaxed text-foreground/90">
              {preview}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
