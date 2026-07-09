import { createDashboardLayout } from "@/lib/dashboard";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return createDashboardLayout("buyer", ["buyer", "seller", "admin"], children);
}
