import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { getAdminPurchaseById } from "@/lib/admin-data";
import { formatCurrency, formatDate } from "@/lib/format";

interface AdminPurchaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPurchaseDetailPage({
  params,
}: AdminPurchaseDetailPageProps) {
  const { id } = await params;
  const purchase = await getAdminPurchaseById(id);

  if (!purchase) {
    notFound();
  }

  const isFree = purchase.amount <= 0;
  const isRefunded = purchase.status === "refunded";

  return (
    <>
      <PageHeader
        title="Purchase details"
        description={`Order ${purchase.id.slice(0, 12)}…`}
        action={
          <Link
            href="/admin/purchases"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to purchases
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Order summary</h2>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-sm">
            <div>
              <p className="text-muted-foreground">Prompt</p>
              <Link
                href={`/prompts/${purchase.promptId}`}
                className="font-medium text-electric hover:underline"
              >
                {purchase.promptTitle}
              </Link>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium">
                {isFree ? "Free" : formatCurrency(purchase.amount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge
                variant={
                  purchase.status === "completed"
                    ? "electric"
                    : "outline"
                }
              >
                {purchase.status}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Purchase date</p>
              <p className="font-medium">{formatDate(purchase.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Refund status</p>
              <p className="font-medium">
                {isRefunded ? "Refunded" : "Not refunded"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">People</h2>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-sm">
            <div>
              <p className="text-muted-foreground">Buyer</p>
              <p className="font-medium">{purchase.buyer}</p>
              <p className="text-muted-foreground">{purchase.buyerEmail}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Seller</p>
              <p className="font-medium">{purchase.seller ?? "—"}</p>
              <p className="text-muted-foreground">
                {purchase.sellerEmail ?? "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold">Payment & receipt</h2>
          </CardHeader>
          <CardContent className="grid gap-4 pt-0 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Stripe session ID</p>
              <p className="break-all font-mono text-xs">
                {purchase.stripeSessionId ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Stripe payment ID</p>
              <p className="break-all font-mono text-xs">
                {purchase.stripePaymentId ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Currency</p>
              <p className="font-medium uppercase">{purchase.currency}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Receipt</p>
              <p className="font-medium">
                {isFree
                  ? "Free download — no payment receipt"
                  : purchase.stripePaymentId
                    ? "Receipt sent to buyer email on purchase"
                    : "Pending Stripe payment confirmation"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
