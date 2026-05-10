"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/workspace-context";

interface Notif {
  id: string;
  who: string;
  what: string;
  when: string;
  warn: boolean;
  href: string;
  /** Cuanto más alto, más reciente. */
  order: number;
}

const READ_KEY = "nexora_notifs_read";

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(READ_KEY, JSON.stringify(Array.from(ids)));
}

export function BellMenu() {
  const { projects, showToast } = useWorkspace();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setReadIds(loadReadIds());
  }, []);

  // Calcular posición del dropdown cuando se abre.
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const updatePos = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    };
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open]);

  // Cerrar al click fuera.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger =
        triggerRef.current && triggerRef.current.contains(target);
      const inMenu = menuRef.current && menuRef.current.contains(target);
      if (!inTrigger && !inMenu) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Notificaciones derivadas de los proyectos reales.
  const notifs = useMemo<Notif[]>(() => {
    const result: Notif[] = [];
    const myName = user?.name ?? "";

    projects.forEach((project, pIdx) => {
      project.steps.forEach((step) => {
        if (step.status === "delayed") {
          result.push({
            id: `delay-${project.id}-${step.id}`,
            who: project.title,
            what: `la fase “${step.title}${step.subtitle ? " " + step.subtitle : ""}” está retrasada`,
            when: step.date,
            warn: true,
            href: `/proyectos/${project.id}`,
            order: 1_000_000 + pIdx,
          });
        }
      });

      project.messages.forEach((m, mIdx) => {
        if (m.who && m.who !== myName && m.who !== "You") {
          result.push({
            id: `msg-${project.id}-${m.id}`,
            who: m.who,
            what: m.alert
              ? `difundió una alerta en ${project.title}`
              : `escribió en ${project.title}`,
            when: m.time,
            warn: Boolean(m.alert),
            href: `/proyectos/${project.id}`,
            order: mIdx + pIdx * 1000,
          });
        }
      });
    });

    return result.sort((a, b) => b.order - a.order).slice(0, 12);
  }, [projects, user]);

  // Solo mostramos las que aún no leyó el usuario.
  const visibleNotifs = useMemo(
    () => notifs.filter((n) => !readIds.has(n.id)),
    [notifs, readIds],
  );
  const unreadCount = visibleNotifs.length;

  const markAllRead = () => {
    if (visibleNotifs.length === 0) return;
    const next = new Set(readIds);
    visibleNotifs.forEach((n) => next.add(n.id));
    setReadIds(next);
    saveReadIds(next);
    showToast("Notificaciones marcadas");
  };

  const markOneRead = (id: string) => {
    if (readIds.has(id)) return;
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    saveReadIds(next);
  };

  const dropdown =
    open && pos ? (
      <div
        ref={menuRef}
        role="menu"
        className="grain rounded-design border border-hairline"
        style={{
          position: "fixed",
          top: pos.top,
          right: Math.max(pos.right, 12),
          zIndex: 9999,
          width: "min(320px, calc(100vw - 24px))",
          padding: 6,
          background: "var(--paper)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="flex items-center justify-between px-3 pt-2.5 pb-2">
          <div className="micro">Notificaciones</div>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="font-mono text-[10px] tracking-[0.14em] uppercase text-cobalt disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Marcar leídas
          </button>
        </div>

        {visibleNotifs.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="font-serif text-sm mb-1">Todo en orden.</p>
            <p className="text-muted text-[11px]">
              Cuando haya retrasos o mensajes nuevos aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto scroll">
            {visibleNotifs.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => {
                  markOneRead(n.id);
                  setOpen(false);
                }}
                className="flex gap-2.5 p-3 border-t border-hairline-2 hover:bg-paper-2 transition-colors"
                style={{ background: "var(--cobalt-soft)" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                  style={{
                    background: n.warn ? "var(--pink)" : "var(--cobalt)",
                  }}
                />
                <div className="text-[13px] leading-snug min-w-0 flex-1">
                  <span className="font-semibold">{n.who}</span>{" "}
                  <span className="text-muted">{n.what}</span>
                  <div className="font-mono text-[10px] text-muted mt-1 tracking-[0.1em]">
                    {n.when}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        aria-label={
          unreadCount > 0
            ? `Notificaciones — ${unreadCount} sin leer`
            : "Notificaciones"
        }
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative w-10 h-10 rounded-full grid place-items-center border border-hairline transition-transform hover:-translate-y-0.5"
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
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full grid place-items-center font-mono text-[10px] font-semibold text-white border-2"
            style={{
              background: "var(--pink)",
              borderColor: "var(--bg)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {mounted && dropdown ? createPortal(dropdown, document.body) : null}
    </>
  );
}
