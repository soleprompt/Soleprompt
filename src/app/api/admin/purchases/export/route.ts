import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import {
  getAdminPurchases,
  purchasesToCsv,
  type PurchasePeriodFilter,
  type PurchaseTypeFilter,
} from "@/lib/admin-data";
import type { PurchaseStatus } from "@/generated/prisma/client";

export async function GET(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const statusParam = searchParams.get("status");
  const typeParam = searchParams.get("type");
  const periodParam = searchParams.get("period");

  const status =
    statusParam && statusParam !== "all"
      ? (statusParam as PurchaseStatus)
      : "all";
  const type =
    typeParam && typeParam !== "all"
      ? (typeParam as PurchaseTypeFilter)
      : "all";
  const period =
    periodParam && periodParam !== "all"
      ? (periodParam as PurchasePeriodFilter)
      : "all";

  const purchases = await getAdminPurchases({ search, status, type, period });
  const csv = purchasesToCsv(purchases);
  const filename = `soleprompt-purchases-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
