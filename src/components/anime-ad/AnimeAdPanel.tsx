"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Film,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  AD_PLATFORMS,
  AD_TONES,
  ANIME_STYLES,
  type AdPlatformId,
  type AdToneId,
  type AnimeStyleId,
} from "@/lib/anime-ad/constants";
import {
  formatAnimeAdExport,
  generateAnimeAds,
  type AnimeAdInput,
  type AnimeAdResult,
} from "@/lib/anime-ad/generator";

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </Button>
  );
}

function FieldBlock({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <CopyButton text={value} />
      </div>
      <pre
        className={`whitespace-pre-wrap rounded-xl border border-border bg-background/60 p-3 text-sm ${
          mono ? "font-mono text-xs leading-relaxed" : ""
        }`}
      >
        {value}
      </pre>
    </div>
  );
}

const selectClassName =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-electric/50";

export function AnimeAdPanel() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [platform, setPlatform] = useState<AdPlatformId>("tiktok");
  const [animeStyle, setAnimeStyle] = useState<AnimeStyleId>("shonen");
  const [tone, setTone] = useState<AdToneId>("energetic");
  const [cta, setCta] = useState("");
  const [brandColors, setBrandColors] = useState("");
  const [result, setResult] = useState<AnimeAdResult | null>(null);
  const [lastInput, setLastInput] = useState<AnimeAdInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  function handleGenerate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setGenerating(true);

    try {
      const input: AnimeAdInput = {
        productName,
        productDescription: productDescription || undefined,
        targetAudience,
        platform,
        animeStyle,
        tone,
        cta: cta || undefined,
        brandColors: brandColors || undefined,
      };
      const generated = generateAnimeAds(input);
      setResult(generated);
      setLastInput(input);
    } catch (err) {
      setResult(null);
      setLastInput(null);
      setError(err instanceof Error ? err.message : "Failed to generate ads.");
    } finally {
      setGenerating(false);
    }
  }

  const exportText =
    result && lastInput ? formatAnimeAdExport(result, lastInput) : "";

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <Card className="h-fit xl:sticky xl:top-24">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-purple">
              <Wand2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">Campaign inputs</h2>
              <p className="text-xs text-muted-foreground">
                Template-based — no API keys required.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label htmlFor="productName" className="mb-1.5 block text-sm font-medium">
                Product / brand name *
              </label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. GlowFuel Energy Drink"
                required
              />
            </div>

            <div>
              <label
                htmlFor="productDescription"
                className="mb-1.5 block text-sm font-medium"
              >
                Product description
              </label>
              <textarea
                id="productDescription"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                rows={2}
                placeholder="Zero-sugar focus blend for gamers..."
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-electric/50"
              />
            </div>

            <div>
              <label
                htmlFor="targetAudience"
                className="mb-1.5 block text-sm font-medium"
              >
                Target audience *
              </label>
              <Input
                id="targetAudience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Gen Z gamers on TikTok"
                required
              />
            </div>

            <div>
              <label htmlFor="platform" className="mb-1.5 block text-sm font-medium">
                Platform
              </label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as AdPlatformId)}
                className={selectClassName}
              >
                {AD_PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} ({p.duration})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="animeStyle" className="mb-1.5 block text-sm font-medium">
                Anime style
              </label>
              <select
                id="animeStyle"
                value={animeStyle}
                onChange={(e) => setAnimeStyle(e.target.value as AnimeStyleId)}
                className={selectClassName}
              >
                {ANIME_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tone" className="mb-1.5 block text-sm font-medium">
                Ad tone
              </label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value as AdToneId)}
                className={selectClassName}
              >
                {AD_TONES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cta" className="mb-1.5 block text-sm font-medium">
                Custom CTA
              </label>
              <Input
                id="cta"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="Leave blank for auto-generated CTA"
              />
            </div>

            <div>
              <label
                htmlFor="brandColors"
                className="mb-1.5 block text-sm font-medium"
              >
                Brand colors
              </label>
              <Input
                id="brandColors"
                value={brandColors}
                onChange={(e) => setBrandColors(e.target.value)}
                placeholder="e.g. neon pink, electric blue"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate 3 ad concepts
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {!result ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Film className="h-10 w-10 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-semibold">No concepts yet</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Fill in your product and audience, then generate three anime-style
                ad concepts with hooks, scripts, image prompts, and video direction.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-electric/20 bg-electric/5">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{result.summary}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Generated {new Date(result.generatedAt).toLocaleString()}
                  </p>
                </div>
                <CopyButton text={exportText} label="Copy all" />
              </CardContent>
            </Card>

            {result.concepts.map((concept) => (
              <Card key={concept.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Badge variant="purple" className="mb-2">
                        Concept {concept.id}
                      </Badge>
                      <h3 className="text-lg font-semibold">{concept.title}</h3>
                    </div>
                    <Badge variant="electric">{concept.musicMood}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <FieldBlock label="Hook" value={concept.hook} />
                  <FieldBlock label="Script" value={concept.script} />
                  <FieldBlock
                    label="On-screen text"
                    value={concept.onScreenText.map((line) => `• ${line}`).join("\n")}
                  />
                  <FieldBlock label="Visual direction" value={concept.visualDirection} />
                  <FieldBlock
                    label="Image prompt (Midjourney / DALL·E)"
                    value={concept.imagePrompt}
                    mono
                  />
                  <FieldBlock
                    label="Video prompt (Runway / Pika)"
                    value={concept.videoPrompt}
                    mono
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldBlock label="CTA" value={concept.cta} />
                    <FieldBlock label="Platform notes" value={concept.platformNotes} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
