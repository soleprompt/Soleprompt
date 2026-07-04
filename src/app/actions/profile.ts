"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { UserProfile } from "@/types/user";

export async function updateProfile(formData: FormData): Promise<void> {
  const { userId } = await auth();

  if (!userId) {
    return;
  }

  const user = await currentUser();
  const existingProfile =
    (user?.publicMetadata?.profile as UserProfile | undefined) ?? {};

  const profile: UserProfile = {
    ...existingProfile,
    username: (formData.get("username") as string) || undefined,
    bio: (formData.get("bio") as string) || undefined,
    country: (formData.get("country") as string) || undefined,
    website: (formData.get("website") as string) || undefined,
    socialLinks: {
      twitter: (formData.get("twitter") as string) || undefined,
      github: (formData.get("github") as string) || undefined,
      linkedin: (formData.get("linkedin") as string) || undefined,
      instagram: (formData.get("instagram") as string) || undefined,
    },
  };

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user?.publicMetadata,
      profile,
    },
  });

  revalidatePath("/buyer/settings");
  revalidatePath("/seller/settings");
}
