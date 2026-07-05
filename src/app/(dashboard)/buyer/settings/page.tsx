import { redirect } from "next/navigation";

export default function BuyerSettingsRedirectPage() {
  redirect("/buyer/account");
}
