"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NexoraLogo } from "./NexoraLogo";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";

type IconName =
  | "home"
  | "folder"
  | "people"
  | "calendar"
  | "chart"
  | "gear";

interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  href: string;
}

const NAV: NavItem[] = [
  { id: "inicio", label: "Inicio", icon: "home", href: "/inicio" },
  { id: "proyectos", label: "Proyectos", icon: "folder", href: "/proyectos" },
  { id: "equipo", label: "Equipo", icon: "people", href: "/equipo" },
  { id: "calendario", label: "Calendario", icon: "calendar", href: "/calendario" },
  { id: "reportes", label: "Reportes", icon: "chart", href: "/reportes" },
  { id: "ajustes", label: "Ajustes", icon: "gear", href: "/ajustes" },
];

function NavIcon({ name }: { name: IconName }) {
  const props = {
    width: 18,
    height: 18,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" />
        </svg>
      );
    case "folder":
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <rect x="3" y="6" width="18" height="14" rx="2" />
          <path d="M3 8l4-3h4l2 2" />
        </svg>
      );
    case "people":
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <circle cx="9" cy="9" r="3.2" />
          <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
          <circle cx="17" cy="8" r="2.5" />
          <path d="M15.5 14c2.7.2 5 2 5 5" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
        </svg>
      );
    case "gear":
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.6.2 1.2.6 1.5 1.1l.1.1A2 2 0 1 1 21 13.1c-.5.3-.9.9-1.1 1.5z" />
        </svg>
      );
  }
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/proyectos")
      return pathname === "/proyectos" || pathname.startsWith("/proyectos/");
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "w-[240px] sm:w-[200px] shrink-0 px-[18px] border-r border-hairline-2",
          "flex flex-col gap-8 self-stretch min-h-screen",
          "fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          background: "var(--bg)",
          paddingTop: "calc(env(safe-area-inset-top) + 28px)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
        }}
        aria-label="Navegación principal"
        aria-hidden={!open}
      >
        <div className="animate-rise flex items-center justify-between">
          <NexoraLogo />
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="w-8 h-8 rounded-full grid place-items-center text-ink-2 hover:bg-paper-2"
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
        </div>

        <nav className="flex flex-col gap-1 mt-4">
          {NAV.map((n, i) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.id}
                href={n.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3.5 p-3 rounded-xl transition-all duration-200 text-left",
                  active ? "text-white" : "text-ink-2 hover:bg-paper-2",
                )}
                style={{
                  background: active ? "var(--cobalt)" : "transparent",
                  animation: `rise 600ms cubic-bezier(.2,.8,.2,1) ${60 + i * 40}ms both`,
                }}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className="w-8 h-8 rounded-lg grid place-items-center"
                  style={{
                    background: active
                      ? "rgba(255,255,255,0.18)"
                      : "transparent",
                  }}
                >
                  <NavIcon name={n.icon} />
                </span>
                <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase">
                  {n.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <button
          onClick={toggleTheme}
          aria-label={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-full font-mono text-[10.5px] tracking-[0.18em] uppercase text-ink-2 hover:bg-paper-2 transition-colors w-fit"
          style={{ animation: "rise 600ms cubic-bezier(.2,.8,.2,1) 300ms both" }}
        >
          <span className="w-7 h-7 rounded-full border border-hairline grid place-items-center">
            {theme === "dark" ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            )}
          </span>
          Modo {theme === "dark" ? "Oscuro" : "Claro"}
        </button>
      </aside>
    </>
  );
}
