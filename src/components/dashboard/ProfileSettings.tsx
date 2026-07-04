import { currentUser } from "@clerk/nextjs/server";
import { UserProfile } from "@clerk/nextjs";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/app/actions/profile";
import type { UserProfile as ProfileData } from "@/types/user";

export async function ProfileSettings() {
  const user = await currentUser();

  if (!user) return null;

  const profile = (user.publicMetadata?.profile as ProfileData | undefined) ?? {};
  const joinDate = new Date(user.createdAt!).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="text-sm text-muted-foreground">
            Manage your sign-in methods, password, and email verification.
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

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Public Profile</h2>
          <p className="text-sm text-muted-foreground">
            This information is visible on your public profile.
          </p>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Name
                </label>
                <Input
                  id="name"
                  defaultValue={user.fullName ?? ""}
                  disabled
                  className="opacity-60"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Edit name in Account settings above.
                </p>
              </div>
              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={profile.username ?? user.username ?? ""}
                  placeholder="@yourusername"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="mb-1.5 block text-sm font-medium">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                defaultValue={profile.bio ?? ""}
                placeholder="Tell us about yourself..."
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-electric/50"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="country"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Country
                </label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={profile.country ?? ""}
                  placeholder="United States"
                />
              </div>
              <div>
                <label
                  htmlFor="website"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Website
                </label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={profile.website ?? ""}
                  placeholder="https://yoursite.com"
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">Social Links</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="twitter"
                  defaultValue={profile.socialLinks?.twitter ?? ""}
                  placeholder="Twitter / X URL"
                />
                <Input
                  name="github"
                  defaultValue={profile.socialLinks?.github ?? ""}
                  placeholder="GitHub URL"
                />
                <Input
                  name="linkedin"
                  defaultValue={profile.socialLinks?.linkedin ?? ""}
                  placeholder="LinkedIn URL"
                />
                <Input
                  name="instagram"
                  defaultValue={profile.socialLinks?.instagram ?? ""}
                  placeholder="Instagram URL"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Join Date
              </label>
              <Input value={joinDate} disabled className="opacity-60" />
            </div>

            <Button type="submit" variant="primary">
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
