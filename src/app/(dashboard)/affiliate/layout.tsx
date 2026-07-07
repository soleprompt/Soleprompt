import { createDashboardLayout } from "@/lib/dashboard";

export default async function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return createDashboardLayout("affiliate", ["buyer", "seller", "admin"], children);
}
