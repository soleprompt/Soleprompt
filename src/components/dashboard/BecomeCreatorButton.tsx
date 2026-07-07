"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { becomeSeller } from "@/app/actions/seller";
import { Button, type ButtonProps } from "@/components/ui/Button";

type BecomeCreatorButtonProps = Pick<
  ButtonProps,
  "size" | "variant" | "className"
>;

export function BecomeCreatorButton({
  size = "sm",
  variant = "secondary",
  className,
}: BecomeCreatorButtonProps) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <Button size={size} variant={variant} className={className} disabled>
        Become a Creator
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <Link href="/sign-up">
        <Button size={size} variant={variant} className={className}>
          Become a Creator
        </Button>
      </Link>
    );
  }

  return (
    <form action={becomeSeller}>
      <Button type="submit" size={size} variant={variant} className={className}>
        Become a Creator
      </Button>
    </form>
  );
}
