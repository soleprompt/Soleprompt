import { redirect } from "next/navigation";

export default function BuyerWishlistRedirectPage() {
  redirect("/buyer/favorites");
}
