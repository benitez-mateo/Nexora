"use client";

import { useEffect, useRef } from "react";
import { safeFromTo } from "@/lib/gsap";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 520,
}: ModalProps) {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    if (backdropRef.current) {
      safeFromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power2.out" },
      );
    }
    if (cardRef.current) {
      safeFromTo(
        cardRef.current,
        { y: 16, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.32, ease: "power3.out" },
      );
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[200] grid place-items-center p-4 opacity-0"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={cardRef}
        className="grain w-full rounded-design-lg border border-hairline overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          background: "var(--paper)",
          boxShadow: "var(--shadow-lg)",
          maxWidth,
        }}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-hairline-2">
          <h2
            id="modal-title"
            className="font-serif text-xl font-medium tracking-[-0.01em]"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full grid place-items-center text-ink-2 hover:bg-paper-2 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5 scroll">
          {children}
        </div>
        {footer && (
          <footer className="px-6 py-4 border-t border-hairline-2 flex items-center justify-between gap-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
