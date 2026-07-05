import { PageHeader } from "@/components/dashboard/PageHeader";

interface LegalPageLayoutProps {
  title: string;
  description: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  description,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader title={title} description={description} />
      <p className="mb-10 text-sm text-muted-foreground">
        Last updated: {lastUpdated}
      </p>
      <div className="space-y-10 text-sm leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-electric [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:mt-2 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-3 [&_section+section]:border-t [&_section+section]:border-border [&_section+section]:pt-10 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
      <p className="mt-12 border-t border-border pt-8 text-xs text-muted-foreground">
        This document is provided for informational purposes only and does not
        constitute legal advice. Consult a qualified attorney for guidance
        specific to your situation.
      </p>
    </div>
  );
}
