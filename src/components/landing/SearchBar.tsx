"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return suggestions.slice(0, 6);
    return suggestions
      .filter((s) => s.toLowerCase().includes(trimmed))
      .slice(0, 6);
  }, [query, suggestions]);

  function navigateToSearch(term: string) {
    const trimmed = term.trim();
    setOpen(false);
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/explore");
    }
  }

  function handleSearch(e?: FormEvent) {
    e?.preventDefault();
    navigateToSearch(query);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative mx-auto w-full max-w-2xl"
      ref={containerRef}
    >
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search AI tools..."
            icon={<Search className="h-4 w-4" />}
            className="h-14 w-full text-base shadow-lg shadow-electric/5"
            aria-label="Search prompts"
            aria-autocomplete="list"
            aria-expanded={open && filteredSuggestions.length > 0}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setOpen(false), 150);
            }}
          />
          {open && filteredSuggestions.length > 0 && (
            <ul
              className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-border bg-background shadow-xl shadow-black/20"
              role="listbox"
            >
              {filteredSuggestions.map((term) => (
                <li key={term} role="option" aria-selected={query === term}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-foreground",
                      "hover:bg-electric/10 focus:bg-electric/10 focus:outline-none",
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setQuery(term);
                      navigateToSearch(term);
                    }}
                  >
                    <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {term}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button type="submit" size="lg" className="h-14 shrink-0 px-8">
          Search
        </Button>
      </form>
      {suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Popular:</span>
          {suggestions.slice(0, 5).map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                navigateToSearch(term);
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
