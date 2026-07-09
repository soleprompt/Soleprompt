import type { Metadata } from "next";
import { createDashboardLayout } from "@/lib/dashboard";
import { StudioShell } from "@/components/studio/studio-ui";

export const metadata: Metadata = {
  title: {
    default: "SolePrompt Studio",
    template: "%s | SolePrompt Studio",
  },
  description:
    "Generate complete YouTube video packages — research, script, storyboard, thumbnails, and SEO — with SolePrompt Studio.",
};

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return createDashboardLayout(
    "buyer",
    ["buyer", "seller", "admin"],
    <StudioShell>{children}</StudioShell>,
  );
}
