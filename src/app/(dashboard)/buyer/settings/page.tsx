import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProfileSettings } from "@/components/dashboard/ProfileSettings";

export const metadata: Metadata = {
  title: "Settings",
};

export default function BuyerSettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and profile preferences."
      />
      <ProfileSettings />
    </>
  );
}
