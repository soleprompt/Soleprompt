"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  deletePrompt,
  updatePrompt,
  type PromptFormState,
} from "@/app/actions/prompts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { PromptStatus } from "@/generated/prisma/client";

interface CategoryOption {
  id: string;
  name: string;
}

interface PromptEditFormProps {
  prompt: {
    id: string;
    title: string;
    description: string;
    content: string;
    price: number;
    status: PromptStatus;
    categoryId: string;
    tags: string[];
  };
  categories: CategoryOption[];
}

const initialState: PromptFormState = {};

export function PromptEditForm({ prompt, categories }: PromptEditFormProps) {
  const boundUpdate = updatePrompt.bind(null, prompt.id);
  const [state, formAction, pending] = useActionState(boundUpdate, initialState);

  async function handleDelete() {
    if (confirm("Are you sure you want to delete this prompt?")) {
      await deletePrompt(prompt.id);
    }
  }

  return (
    <>
      <Link
        href="/seller/prompts"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Prompts
      </Link>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Edit Prompt</h2>
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
                Title
              </label>
              <Input id="title" name="title" required defaultValue={prompt.title} />
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
                defaultValue={prompt.description}
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
                  defaultValue={prompt.categoryId}
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-electric/50"
                >
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
                <Input
                  id="price"
                  name="price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  defaultValue={prompt.price}
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={prompt.status}
                className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-electric/50"
              >
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="mb-1.5 block text-sm font-medium">
                Tags
              </label>
              <Input
                id="tags"
                name="tags"
                defaultValue={prompt.tags.join(", ")}
              />
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
                defaultValue={prompt.content}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-electric/50"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" variant="primary" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
