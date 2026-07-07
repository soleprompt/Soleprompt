"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface SearchBarProps {
  suggestions?: string[];
  defaultQuery?: string;
}

export function SearchBar({
  suggestions = [],
  defaultQuery = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);

  function handleSearch(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/explore");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mx-auto w-full max-w-2xl"
    >
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Input
          type="search"
          placeholder="Search AI tools..."
          icon={<Search className="h-4 w-4" />}
          className="h-14 flex-1 text-base shadow-lg shadow-electric/5"
          aria-label="Search prompts"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" size="lg" className="h-14 shrink-0 px-8">
          Search
        </Button>
      </form>
      {suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Popular:</span>
          {suggestions.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                router.push(`/search?q=${encodeURIComponent(term)}`);
              }}
              className="rounded-full border border-border bg-foreground/5 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-electric/30 hover:text-foreground"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
