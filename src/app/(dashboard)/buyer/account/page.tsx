import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { BuyerAccountSettings } from "@/components/dashboard/BuyerAccountSettings";

export const metadata: Metadata = {
  title: "Account",
};

export default function BuyerAccountPage() {
  return (
    <>
      <PageHeader
        title="Account"
        description="Your profile, email, and account settings."
      />
      <BuyerAccountSettings />
    </>
  );
}
