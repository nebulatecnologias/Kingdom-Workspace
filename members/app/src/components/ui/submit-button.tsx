"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { Button } from "./button";

/** Primary submit that shows a spinner and the in-progress label while its form is submitting. */
export function SubmitButton({ children, pendingLabel, variant = "primary", size = "lg" }: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "ghost";
  size?: "md" | "lg";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} block loading={pending} loadingLabel={pendingLabel} disabled={pending}>
      {children}
    </Button>
  );
}
