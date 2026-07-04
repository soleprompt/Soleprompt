import { currentUser } from "@clerk/nextjs/server";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardWelcomeHeader } from "@/components/dashboard/DashboardWelcomeHeader";
import { StartSellingButton } from "@/components/dashboard/StartSellingButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getDashboardPath } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/user";
import { getRoleLabel } from "@/lib/navigation";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const role = await getCurrentUserRole();
  const dashboardPath = getDashboardPath(role);
  const userName =
    user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "User";
  const userEmail = user.primaryEmailAddress?.emailAddress ?? "";
  const avatarUrl = user.imageUrl;
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardWelcomeHeader />

      <main className="flex flex-1 items-center justify-center p-4 lg:p-6">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center pt-8 text-center">
            <div className="relative mb-6">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={userName}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full border-2 border-border object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-border bg-gradient-to-br from-electric to-purple text-2xl font-semibold text-white">
                  {initials}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-electric shadow-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>

            <Badge variant="electric" className="mb-4">
              {getRoleLabel(role)} Account
            </Badge>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome to SolePrompt
            </h1>

            <p className="mt-2 text-lg font-medium text-foreground">{userName}</p>

            {userEmail && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {userEmail}
              </p>
            )}

            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Your account is ready. Head to your dashboard to explore prompts,
              manage purchases, or start selling.
            </p>

            <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto">
              <Link href={dashboardPath} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:min-w-[220px]">
                  Go to {getRoleLabel(role)} Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {role === "buyer" && (
                <StartSellingButton
                  size="lg"
                  variant="outline"
                  className="w-full sm:min-w-[220px]"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
