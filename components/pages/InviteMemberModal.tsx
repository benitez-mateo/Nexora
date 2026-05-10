"use client";

import { useEffect, useState } from "react";

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ open, onClose }: InviteMemberModalProps) {
  const [appUrl, setAppUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Captura la URL base de la app cuando se abre.
  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    setAppUrl(window.location.origin);
    setCopied(false);
  }, [open]);

  // ESC para cerrar.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback: seleccionar texto.
    }
  };

  const shareWhatsapp = () => {
    const text = encodeURIComponent(
      `Te invito a Nexora — nuestro espacio de trabajo. Regístrate aquí: ${appUrl}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  };

  const shareEmail = () => {
    const subject = encodeURIComponent("Invitación a Nexora");
    const body = encodeURIComponent(
      `Hola,\n\nTe invito a sumarte a nuestro espacio de trabajo en Nexora. Crea tu cuenta en este enlace:\n\n${appUrl}\n\nNos vemos adentro.`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="grain rounded-design border border-hairline w-full max-w-md p-6 sm:p-8 flex flex-col gap-5"
        style={{
          background: "var(--paper)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <header>
          <div className="micro mb-2">Invitar miembro</div>
          <h2
            id="invite-title"
            className="font-serif text-2xl font-medium leading-tight tracking-[-0.01em]"
          >
            Suma a alguien al equipo
          </h2>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            Comparte este enlace. Quien lo abra puede crear su cuenta y entrar
            a Nexora desde cualquier dispositivo.
          </p>
        </header>

        <div className="flex flex-col gap-2">
          <span className="micro">Enlace de la app</span>
          <div
            className="flex items-stretch gap-2 rounded-xl border border-hairline overflow-hidden"
            style={{ background: "var(--paper-2)" }}
          >
            <input
              readOnly
              value={appUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 bg-transparent border-0 outline-0 px-3.5 py-2.5 font-mono text-[13px] min-w-0"
              aria-label="URL de la app"
            />
            <button
              onClick={copy}
              className="px-4 font-mono text-[10.5px] tracking-[0.14em] uppercase whitespace-nowrap transition-colors"
              style={{
                background: copied ? "var(--cobalt)" : "transparent",
                color: copied ? "white" : "var(--cobalt)",
                borderLeft: "1px solid var(--hairline)",
              }}
            >
              {copied ? "Copiado ✓" : "Copiar"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={shareWhatsapp} className="btn-ghost justify-center">
            WhatsApp
          </button>
          <button onClick={shareEmail} className="btn-ghost justify-center">
            Correo
          </button>
        </div>

        <div
          className="text-[12px] text-muted leading-relaxed border-t border-hairline-2 pt-4"
          style={{ color: "var(--muted)" }}
        >
          <strong style={{ color: "var(--ink-2)" }}>Próximamente:</strong>{" "}
          gestión de equipos en tiempo real (ver quién está conectado, asignar
          roles, controlar permisos).
        </div>

        <div className="flex justify-end pt-1">
          <button onClick={onClose} className="btn-ghost">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
