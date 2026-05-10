"use client";

import { useEffect, useRef, useState } from "react";

const ITEMS = [
  {
    who: "Carlos Ruiz",
    what: "envió un avance del análisis de competencia",
    when: "10:24",
    warn: false,
  },
  {
    who: "Sistema",
    what: "marcó “Front-end” como en riesgo de retraso",
    when: "09:50",
    warn: true,
  },
  {
    who: "Ana Torres",
    what: "compartió Wireframe_Home.v2.fig",
    when: "Ayer",
    warn: false,
  },
];

interface BellMenuProps {
  count?: number;
  onMarkRead: () => void;
}

export function BellMenu({ count = 3, onMarkRead }: BellMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notificaciones"
        className="w-10 h-10 rounded-full grid place-items-center border border-hairline transition-transform hover:-translate-y-0.5"
        style={{ background: "var(--paper-2)" }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
        {count > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full grid place-items-center font-mono text-[10px] font-semibold text-white border-2"
            style={{
              background: "var(--pink)",
              borderColor: "var(--bg)",
            }}
          >
            {count}
          </span>
        )}
      </button>
      {open && (
        <div
          className="grain absolute right-0 top-12 w-80 p-1.5 rounded-design border border-hairline z-[200]"
          style={{
            background: "var(--paper)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="flex items-center justify-between px-3 pt-2.5 pb-2">
            <div className="micro">Notificaciones</div>
            <button
              onClick={onMarkRead}
              className="font-mono text-[10px] tracking-[0.14em] uppercase text-cobalt"
            >
              Marcar leídas
            </button>
          </div>
          {ITEMS.map((it, i) => (
            <div
              key={i}
              className="flex gap-2.5 p-3 border-t border-hairline-2"
            >
              <span
                className="w-1.5 h-1.5 rounded-full mt-2"
                style={{ background: it.warn ? "var(--pink)" : "var(--cobalt)" }}
              />
              <div className="text-[13px] leading-snug">
                <span className="font-semibold">{it.who}</span>{" "}
                <span className="text-muted">{it.what}</span>
                <div className="font-mono text-[10px] text-muted mt-1 tracking-[0.1em]">
                  {it.when}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
