import { currentUser } from "@clerk/nextjs/server";
import { Mail, User } from "lucide-react";
import { UserProfile } from "@clerk/nextjs";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export async function BuyerAccountSettings() {
  const user = await currentUser();

  if (!user) return null;

  const userName =
    user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "User";
  const userEmail = user.primaryEmailAddress?.emailAddress ?? "";
  const joinDate = new Date(user.createdAt!).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Your SolePrompt account details from Clerk.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={userName}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full border-2 border-border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-border bg-gradient-to-br from-electric to-purple text-xl font-semibold text-white">
                {initials}
              </div>
            )}
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">{userName}</dd>
                </div>
              </div>
              {userEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="font-medium">{userEmail}</dd>
                  </div>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Member since</dt>
                <dd className="font-medium">{joinDate}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Account Settings</h2>
          <p className="text-sm text-muted-foreground">
            Update your password, email, and security preferences.
          </p>
        </CardHeader>
        <CardContent>
          <UserProfile
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent p-0",
                navbar: "hidden",
                pageScrollBox: "p-0",
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
