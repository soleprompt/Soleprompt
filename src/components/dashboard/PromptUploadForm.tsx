"use client";

import { useActionState } from "react";
import { ImagePlus, Upload } from "lucide-react";
import {
  createPrompt,
  type PromptFormState,
} from "@/app/actions/prompts";
import {
  CREATOR_PRICE_PRESETS,
  SUPPORTED_AI_MODELS,
} from "@/lib/creator/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface CategoryOption {
  id: string;
  name: string;
}

interface PromptUploadFormProps {
  categories: CategoryOption[];
}

const initialState: PromptFormState = {};

export function PromptUploadForm({ categories }: PromptUploadFormProps) {
  const [state, formAction, pending] = useActionState(createPrompt, initialState);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Prompt Details</h2>
            <p className="text-sm text-muted-foreground">
              Fill in the information buyers will see on your listing.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <form action={formAction} className="space-y-5">
              {state.error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                  {state.error}
                </p>
              )}

              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
                  Prompt Title
                </label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="e.g. SEO Content Engine"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe what your prompt does and who it's for..."
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-electric/50"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="categoryId"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Category
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-electric/50"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="price" className="mb-1.5 block text-sm font-medium">
                    Price (USD)
                  </label>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {CREATOR_PRICE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="rounded-full border border-border px-3 py-1 text-xs transition-colors hover:border-electric hover:text-electric"
                        onClick={() => {
                          const input = document.getElementById(
                            "price",
                          ) as HTMLInputElement | null;
                          if (input) input.value = String(preset.value);
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    required
                    placeholder="9.99"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Compatible AI models</p>
                <div className="flex flex-wrap gap-3">
                  {SUPPORTED_AI_MODELS.map((model) => (
                    <label
                      key={model}
                      className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs"
                    >
                      <input
                        type="checkbox"
                        name="compatibleModels"
                        value={model}
                        defaultChecked={["ChatGPT", "Claude", "Gemini", "Cursor"].includes(model)}
                        className="accent-electric"
                      />
                      {model}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="tags" className="mb-1.5 block text-sm font-medium">
                  Tags
                </label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="seo, content, marketing (comma separated)"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Add up to 5 tags to help buyers discover your prompt.
                </p>
              </div>

              <div>
                <label htmlFor="content" className="mb-1.5 block text-sm font-medium">
                  Prompt Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  required
                  rows={10}
                  placeholder="Paste your prompt template here..."
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-electric/50"
                />
              </div>

              <div>
                <label htmlFor="coverImageUrl" className="mb-1.5 block text-sm font-medium">
                  Preview image URL
                </label>
                <Input
                  id="coverImageUrl"
                  name="coverImageUrl"
                  type="url"
                  placeholder="https://example.com/your-tool-preview.png"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Paste a direct image URL for your listing thumbnail (square works best).
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  type="submit"
                  name="status"
                  value="review"
                  variant="primary"
                  className="gap-2"
                  disabled={pending}
                >
                  <Upload className="h-4 w-4" />
                  {pending ? "Submitting..." : "Submit for Review"}
                </Button>
                <Button
                  type="submit"
                  name="status"
                  value="draft"
                  variant="outline"
                  disabled={pending}
                >
                  Save as Draft
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Listing Preview</h2>
            <p className="text-sm text-muted-foreground">
              How your prompt will appear in the marketplace.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-electric/20 to-purple/20">
                <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div className="p-4">
                <Badge variant="electric" className="mb-2">
                  Category
                </Badge>
                <h3 className="font-semibold">Your Prompt Title</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  Your description will appear here once you fill in the form.
                </p>
                <p className="mt-3 text-lg font-bold text-electric">$0.00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
