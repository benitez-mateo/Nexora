"use client";

import { useEffect, useState } from "react";
import { useOnline } from "@/lib/use-online";

/**
 * Banner pegado arriba que avisa cuando se pierde la conexión a internet.
 * Cuando vuelve la conexión, muestra un mensaje breve "Conexión restaurada"
 * y se oculta a los 2.5s.
 */
export function OfflineBanner() {
  const online = useOnline();
  const [showRestored, setShowRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!online) {
      setWasOffline(true);
      setShowRestored(false);
      return;
    }
    if (wasOffline) {
      setShowRestored(true);
      const t = window.setTimeout(() => {
        setShowRestored(false);
        setWasOffline(false);
      }, 2500);
      return () => window.clearTimeout(t);
    }
  }, [online, wasOffline]);

  if (online && !showRestored) return null;

  const isOffline = !online;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 z-[300] max-w-[calc(100vw-24px)]"
      style={{
        top: "calc(env(safe-area-inset-top) + 12px)",
      }}
    >
      <div
        className="grain rounded-full border flex items-center gap-3 px-5 py-2.5"
        style={{
          background: isOffline ? "var(--pink-soft)" : "var(--cobalt-soft)",
          borderColor: isOffline ? "var(--pink)" : "var(--cobalt)",
          color: isOffline ? "var(--pink)" : "var(--cobalt)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: isOffline ? "var(--pink)" : "var(--cobalt)",
            animation: isOffline ? "pulse 1.4s ease-in-out infinite" : undefined,
          }}
        />
        <span className="font-mono text-[11px] tracking-[0.08em] leading-tight">
          {isOffline ? (
            <>
              <span className="font-semibold">Sin conexión.</span>{" "}
              <span className="opacity-80">
                No verás los cambios del equipo hasta que vuelva internet.
              </span>
            </>
          ) : (
            <span className="font-semibold">Conexión restaurada</span>
          )}
        </span>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.15);
          }
        }
      `}</style>
    </div>
  );
}
