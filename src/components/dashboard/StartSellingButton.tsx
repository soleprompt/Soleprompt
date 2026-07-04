"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { becomeSeller } from "@/app/actions/seller";
import { Button, type ButtonProps } from "@/components/ui/Button";

type StartSellingButtonProps = Pick<ButtonProps, "size" | "variant" | "className">;

export function StartSellingButton({
  size = "lg",
  variant = "primary",
  className,
}: StartSellingButtonProps) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <Button size={size} variant={variant} className={className} disabled>
        Start Selling
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <Link href="/sign-up">
        <Button size={size} variant={variant} className={className}>
          Start Selling
        </Button>
      </Link>
    );
  }

  return (
    <form action={becomeSeller}>
      <Button type="submit" size={size} variant={variant} className={className}>
        Start Selling
      </Button>
    </form>
  );
}
