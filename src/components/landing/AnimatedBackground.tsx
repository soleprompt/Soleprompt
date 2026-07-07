"use client";

import { motion } from "framer-motion";

const PARTICLES = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  top: `${(i * 23 + 11) % 100}%`,
  size: 1.5 + (i % 4),
  delay: `${(i % 8) * 0.6}s`,
  duration: `${6 + (i % 5) * 1.5}s`,
}));

const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 31 + 5) % 100}%`,
  top: `${(i * 19 + 3) % 100}%`,
  size: 1 + (i % 2),
  delay: `${(i % 6) * 0.8}s`,
  duration: `${3 + (i % 4)}s`,
}));

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-electric/10 via-background to-background" />

      <div
        className="animate-gradient-shift absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(0,102,255,0.15) 0%, rgba(124,58,237,0.1) 35%, rgba(0,102,255,0.08) 70%, rgba(139,92,246,0.12) 100%)",
        }}
        aria-hidden
      />

      <motion.div
        className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-electric/20 blur-[120px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -right-32 top-1/4 h-[600px] w-[600px] rounded-full bg-purple/20 blur-[120px]"
        animate={{
          x: [0, -40, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-electric/10 blur-[100px]"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="animate-grid-drift absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
        aria-hidden
      />

      {PARTICLES.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full bg-electric/60 shadow-[0_0_6px_rgba(0,102,255,0.5)]"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            animation: `float-particle ${particle.duration} ease-in-out ${particle.delay} infinite`,
          }}
          aria-hidden
        />
      ))}

      {STARS.map((star) => (
        <span
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white/40"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay} infinite`,
          }}
          aria-hidden
        />
      ))}

      <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-electric/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-1/4 h-px bg-gradient-to-r from-transparent via-purple/15 to-transparent" />
    </div>
  );
}
