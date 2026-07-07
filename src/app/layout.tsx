import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SITE } from "@/lib/constants";
import { clerkAppearance } from "@/lib/clerk";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "AI tools",
    "AI academy",
    "prompt marketplace",
    "college student AI",
    "content creator AI",
    "entrepreneur AI tools",
    "ChatGPT prompts",
  ],
  openGraph: {
    title: SITE.name,
    description: SITE.tagline,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance} afterSignOutUrl="/">
      <html
        lang="en"
        suppressHydrationWarning
        className={`${inter.variable} h-full`}
      >
        <body className="min-h-full flex flex-col antialiased">
          <ThemeProvider>{children}</ThemeProvider>
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
