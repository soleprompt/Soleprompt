import { currentUser } from "@clerk/nextjs/server";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { getOnboardingProgress } from "@/lib/onboarding";

export async function OnboardingChecklistSection() {
  const user = await currentUser();
  if (!user) return null;

  const progress = await getOnboardingProgress(user.id, user);
  if (!progress || progress.dismissed || progress.allComplete) return null;

  return <OnboardingChecklist progress={progress} />;
}
