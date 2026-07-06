"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StartSellingButton } from "@/components/dashboard/StartSellingButton";
import { SearchBar } from "@/components/landing/SearchBar";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { HeroMockup } from "@/components/landing/HeroMockup";

interface HeroProps {
  suggestions?: string[];
  toolCountLabel?: string;
}

export function Hero({ suggestions = [], toolCountLabel = "500+" }: HeroProps) {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden pt-16">
      <AnimatedBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="electric" className="mb-6 px-4 py-1.5 text-xs">
                AI tools for real work
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Stop browsing prompts.{" "}
              <span className="bg-gradient-to-r from-electric via-purple to-electric bg-clip-text text-transparent">
                Start using AI tools that get work done.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0"
            >
              Download ready-to-use AI tools for sales, marketing, business,
              social media, and productivity — starting at free.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
            >
              <Link href="/explore">
                <Button size="lg" className="group w-full sm:w-auto">
                  Browse AI Tools
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/tools/x-checker">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Try Free X Checker
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 hidden sm:block lg:hidden"
            >
              <StartSellingButton size="md" variant="ghost" />
            </motion.div>

            <div className="mt-10 lg:max-w-md">
              <SearchBar suggestions={suggestions} />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground lg:justify-start"
            >
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-electric text-electric"
                  />
                ))}
              </div>
              <span>{toolCountLabel} tools · Free downloads available</span>
            </motion.div>
          </div>

          <div className="hidden sm:block">
            <HeroMockup toolCountLabel={toolCountLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
