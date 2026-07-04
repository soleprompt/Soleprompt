"use client";

import { deletePrompt } from "@/app/actions/prompts";

interface DeletePromptButtonProps {
  promptId: string;
  children: React.ReactNode;
}

export function DeletePromptButton({
  promptId,
  children,
}: DeletePromptButtonProps) {
  async function handleClick() {
    if (confirm("Are you sure you want to delete this prompt?")) {
      await deletePrompt(promptId);
    }
  }

  return (
    <button type="button" onClick={handleClick} className="inline-flex">
      {children}
    </button>
  );
}
