"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useToast } from "@/components/shell/toaster";

/**
 * Shows a one-off message carried in the address (?created=1, ?saved=1) as a toast, then removes the
 * flag so it is not shown again after a move or a reload (#13).
 */
export function Flash({ messages }: { messages: Record<string, string> }) {
  const sp = useSearchParams();
  const path = usePathname();
  const router = useRouter();
  const toast = useToast();
  const done = useRef("");
  useEffect(() => {
    const keys = Object.keys(messages).filter((k) => sp.get(k) === "1");
    if (!keys.length) return;
    const sig = path + sp.toString();
    if (done.current === sig) return;
    done.current = sig;
    keys.forEach((k) => toast(messages[k]));
    const rest = new URLSearchParams(sp.toString());
    keys.forEach((k) => rest.delete(k));
    const q = rest.toString();
    router.replace(q ? `${path}?${q}` : path, { scroll: false });
  }, [sp, path, router, toast, messages]);
  return null;
}
