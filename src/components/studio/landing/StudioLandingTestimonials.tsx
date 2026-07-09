import { StudioGlassCard } from "@/components/studio/studio-ui";

const TESTIMONIALS = [
  {
    id: "1",
    name: "Jordan Reyes",
    channel: "@ReyesReviews",
    avatar: "JR",
    quote:
      "I used to spend 4 hours per video on research and scripting. SolePrompt Studio cuts that to 20 minutes — the storyboard alone is worth $49.",
  },
  {
    id: "2",
    name: "Priya Sharma",
    channel: "@BuildWithPriya",
    avatar: "PS",
    quote:
      "The SEO package actually ranks. My last three videos from SolePrompt Studio ideas hit suggested feeds within a week. Game changer for solo creators.",
  },
  {
    id: "3",
    name: "Marcus Chen",
    channel: "@TechUnpack",
    avatar: "MC",
    quote:
      "I manage two channels. Pro tier pays for itself every month — unlimited projects means I never ration ideas anymore.",
  },
];

export function StudioLandingTestimonials() {
  return (
    <section className="border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-electric">
          Creators
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Built for YouTube creators who ship
        </h2>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((item) => (
          <StudioGlassCard key={item.id} hover className="p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              &ldquo;{item.quote}&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple/30 to-electric/20 text-sm font-semibold">
                {item.avatar}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.channel}</p>
              </div>
            </div>
          </StudioGlassCard>
        ))}
      </div>
    </section>
  );
}
