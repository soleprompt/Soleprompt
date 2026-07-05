"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/Input";

type StatusOption = {
  value: string;
  label: string;
};

interface AdminTableFiltersProps {
  search?: string;
  searchPlaceholder?: string;
  status?: string;
  statusOptions?: StatusOption[];
  role?: string;
  roleOptions?: StatusOption[];
}

export function AdminTableFilters({
  search = "",
  searchPlaceholder = "Search…",
  status = "all",
  statusOptions,
  role = "all",
  roleOptions,
}: AdminTableFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function updateParams(updates: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }

    startTransition(() => {
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <form
      className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        updateParams({ search: String(formData.get("search") ?? "") });
      }}
    >
      <Input
        name="search"
        defaultValue={search}
        placeholder={searchPlaceholder}
        className="sm:max-w-xs"
        disabled={pending}
      />
      {statusOptions && (
        <select
          name="status"
          defaultValue={status}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          disabled={pending}
          onChange={(event) => updateParams({ status: event.target.value })}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      {roleOptions && (
        <select
          name="role"
          defaultValue={role}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          disabled={pending}
          onChange={(event) => updateParams({ role: event.target.value })}
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      <button
        type="submit"
        className="h-10 rounded-lg bg-electric px-4 text-sm font-medium text-white disabled:opacity-50"
        disabled={pending}
      >
        Search
      </button>
    </form>
  );
}
