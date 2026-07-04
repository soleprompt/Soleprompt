import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-purple">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold">{SITE.name}</span>
        </Link>
        <p className="mt-3 text-sm text-muted-foreground">
          Create your account and start exploring premium prompts.
        </p>
      </div>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
