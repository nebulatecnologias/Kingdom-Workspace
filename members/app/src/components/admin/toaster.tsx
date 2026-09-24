"use client";

import { useEffect, useState } from "react";
import { Check, CircleAlert } from "lucide-react";

type Toast = { id: number; text: string; tone: "ok" | "error" };

const EVENT = "km-toast";
let next = 1;

/** Shows a short confirmation at the bottom of the screen. Callable from any client component. */
export function toast(text: string, tone: Toast["tone"] = "ok") {
  window.dispatchEvent(new CustomEvent<Toast>(EVENT, { detail: { id: next++, text, tone } }));
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    const onToast = (e: Event) => {
      const item = (e as CustomEvent<Toast>).detail;
      setItems((list) => [...list.slice(-2), item]);
      window.setTimeout(() => setItems((list) => list.filter((x) => x.id !== item.id)), item.tone === "error" ? 6000 : 3200);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);
  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="toast">
          {t.tone === "ok" ? <Check className="icon" aria-hidden="true" /> : <CircleAlert className="icon" aria-hidden="true" style={{ color: "#ff8a80" }} />}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
