"use client";

import { useEffect, useRef, useState } from "react";
import { safeFromTo } from "@/lib/gsap";
import { useWorkspace } from "@/lib/workspace-context";

export function DelayAlert() {
  const {
    steps,
    delayedCount,
    activeStepId,
    markStepDelayed,
    broadcastDelayAlert,
  } = useWorkspace();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open || !popRef.current) return;
    safeFromTo(
      popRef.current,
      { y: -8, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.32, ease: "power3.out" },
    );
  }, [open]);

  const candidates = steps.filter((s) => s.status !== "completed");
  const allCompleted = candidates.length === 0;
  const hasDelays = delayedCount > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !allCompleted && setOpen((o) => !o)}
        disabled={allCompleted}
        className="grain rounded-[20px] text-left flex flex-col gap-1.5 p-4 px-5 w-[220px] transition-transform hover:-translate-y-0.5 disabled:cursor-default disabled:hover:translate-y-0"
        style={
          hasDelays
            ? {
                background:
                  "linear-gradient(135deg, #FFC8DC 0%, #FF7BAE 100%)",
                color: "rgb(70, 10, 35)",
                border: "1px solid rgb(255, 61, 138)",
                boxShadow: "0 8px 28px rgba(255,61,138,0.22)",
              }
            : {
                background:
                  "linear-gradient(135deg, #C8D7F7 0%, #7BA0F0 100%)",
                color: "rgb(15, 30, 90)",
                border: "1px solid rgb(19, 127, 233)",
                boxShadow: "0 8px 28px rgba(27,61,255,0.18)",
              }
        }
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span
          className="micro flex items-center gap-2"
          style={{ color: hasDelays ? "rgb(70, 10, 35)" : "rgb(10,9,9)" }}
        >
          {hasDelays ? (
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L1 21h22L12 2z" />
              <path d="M12 9v5M12 17h.01" />
            </svg>
          ) : (
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.5l4.5 4.5L19 7" />
            </svg>
          )}
          {hasDelays
            ? "Alerta de Retraso"
            : allCompleted
              ? "Proyecto Finalizado"
              : "Sin Retrasos"}
        </span>
        <div
          className="font-serif text-sm leading-tight"
          style={{ color: hasDelays ? "rgb(70, 10, 35)" : "rgb(15,15,15)" }}
        >
          {hasDelays ? (
            <>
              <span className="font-mono text-[22px] font-medium mr-1.5">
                {delayedCount}
              </span>
              {delayedCount === 1 ? "tarea" : "tareas"}
              <br />
              {delayedCount === 1 ? "requiere" : "requieren"} atención
            </>
          ) : allCompleted ? (
            <>
              Todas las fases<br />han sido completadas
            </>
          ) : (
            <>
              Todo va<br />según lo previsto
            </>
          )}
        </div>
      </button>

      {open && (
        <div
          ref={popRef}
          role="menu"
          className="grain absolute top-[calc(100%+8px)] right-0 min-w-[280px] p-2 z-30 rounded-design border border-hairline"
          style={{
            background: "var(--paper)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="micro px-2.5 py-2">Marcar como retrasada</div>
          {candidates.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                markStepDelayed(s.id);
                setOpen(false);
              }}
              className="flex justify-between items-center w-full px-2.5 py-2.5 rounded-lg transition-colors hover:bg-paper-2"
              role="menuitem"
            >
              <span className="flex flex-col items-start">
                <span className="font-mono text-[10px] text-muted tracking-[0.14em]">
                  {s.num}
                </span>
                <span className="font-serif text-sm">
                  {s.title} {s.subtitle}
                </span>
              </span>
              <span
                style={{
                  color:
                    s.status === "delayed"
                      ? "var(--pink)"
                      : "var(--muted-2)",
                }}
              >
                {s.status === "delayed" ? "● Retrasada" : "→"}
              </span>
            </button>
          ))}

          <div className="border-t border-hairline-2 mt-2 pt-2">
            <button
              onClick={() => {
                broadcastDelayAlert();
                setOpen(false);
              }}
              className="w-full px-3 py-2.5 rounded-lg text-white font-mono text-[10.5px] tracking-[0.14em] uppercase"
              style={{
                background: "var(--cobalt)",
                boxShadow: "0 4px 12px rgba(27,61,255,0.28)",
              }}
            >
              Difundir aviso al chat
              {activeStepId && (
                <span className="text-white/70 ml-2 normal-case tracking-normal text-[11px]">
                  ({steps.find((s) => s.id === activeStepId)?.title})
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
