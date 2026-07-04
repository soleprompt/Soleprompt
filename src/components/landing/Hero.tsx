"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StartSellingButton } from "@/components/dashboard/StartSellingButton";
import { SearchBar } from "@/components/landing/SearchBar";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { SITE } from "@/lib/constants";

interface HeroProps {
  suggestions?: string[];
}

export function Hero({ suggestions = [] }: HeroProps) {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden pt-16">
      <AnimatedBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="electric" className="mb-6 px-4 py-1.5 text-xs">
              Now in Public Beta
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            The Marketplace for{" "}
            <span className="bg-gradient-to-r from-electric via-purple to-electric bg-clip-text text-transparent">
              Premium AI Prompts
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            {SITE.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/explore">
              <Button size="lg" className="group w-full sm:w-auto">
                Explore Prompts
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <StartSellingButton size="lg" variant="outline" className="w-full sm:w-auto" />
          </motion.div>

          <div className="mt-12">
            <SearchBar suggestions={suggestions} />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-electric text-electric"
                />
              ))}
            </div>
            <span>Trusted by 50,000+ creators worldwide</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
