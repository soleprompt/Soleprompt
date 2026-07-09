import { createDashboardLayout } from "@/lib/dashboard";
import { StudioShell } from "@/components/studio/studio-ui";

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
