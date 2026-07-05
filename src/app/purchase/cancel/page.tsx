import Link from "next/link";
import { XCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function PurchaseCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center pt-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <XCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Checkout cancelled</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Your payment was not completed. You can return to browse prompts and
            try again when you are ready.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/">
              <Button variant="primary" className="w-full sm:w-auto">
                Browse prompts
              </Button>
            </Link>
            <Link href="/buyer">
              <Button variant="outline" className="w-full gap-2 sm:w-auto">
                <ShoppingBag className="h-4 w-4" />
                My Library
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
