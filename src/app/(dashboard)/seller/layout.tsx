import { createDashboardLayout } from "@/lib/dashboard";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return createDashboardLayout("seller", ["seller", "admin"], children);
}
