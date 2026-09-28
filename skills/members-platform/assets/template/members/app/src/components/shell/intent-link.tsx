"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

/**
 * A Link that prefetches when the person shows intent (pointer over it, keyboard focus, or a finger down)
 * instead of as soon as it is on screen. Admin screens show many links, and prefetching all of them again
 * after every save queued dozens of server renders ahead of the admin's own requests.
 */
export function IntentLink({ prefetch, onPointerEnter, onFocus, onTouchStart, ...props }: ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false);
  return (
    <Link
      {...props}
      prefetch={intent ? (prefetch ?? null) : false}
      onPointerEnter={(e) => {
        setIntent(true);
        onPointerEnter?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
    />
  );
}
