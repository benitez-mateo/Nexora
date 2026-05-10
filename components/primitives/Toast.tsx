"use client";

import { useEffect, useRef } from "react";
import { safeFromTo, safeTo } from "@/lib/gsap";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (message) {
      safeFromTo(
        ref.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.32, ease: "power3.out" },
      );
    } else {
      safeTo(ref.current, {
        y: 12,
        opacity: 0,
        duration: 0.22,
        ease: "power2.in",
      });
    }
  }, [message]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-full font-mono text-[11px] tracking-[0.14em] uppercase pointer-events-none opacity-0"
      style={{
        background: "var(--ink)",
        color: "var(--bg)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {message ?? ""}
    </div>
  );
}
