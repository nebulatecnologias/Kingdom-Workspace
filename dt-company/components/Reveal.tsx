"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Progressive reveal on scroll. Content is visible by default (no-JS safe);
 * JS adds the pre-state only when IntersectionObserver and motion are allowed.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  as?: "div" | "section" | "li" | "article";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", `${delay}ms`);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("reveal--in");
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const T = Tag as "div";
  return (
    <T ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {children}
    </T>
  );
}
