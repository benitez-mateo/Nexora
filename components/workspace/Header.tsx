"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Avatar } from "@/components/primitives/Avatar";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/workspace-context";
import { BellMenu } from "./BellMenu";

interface HeaderProps {
  onOpenDrawer: () => void;
}

export function Header({ onOpenDrawer }: HeaderProps) {
  const { chatOpen, toggleChat, showToast } = useWorkspace();
  const pathname = usePathname();
  const onProjectWorkspace = /^\/proyectos\/[^/]+$/.test(pathname);

  return (
    <header className="flex items-center justify-between mb-9 animate-rise gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenDrawer}
          aria-label="Abrir menú"
          className="w-10 h-10 rounded-full grid place-items-center border border-hairline transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--paper-2)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        {onProjectWorkspace && (
          <Link href="/proyectos" className="btn-ghost">
            <span className="hidden sm:inline">← Volver a Proyectos</span>
            <span className="sm:hidden">←</span>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-end">
        <BellMenu
          count={3}
          onMarkRead={() => showToast("Notificaciones marcadas")}
        />

        <button
          onClick={toggleChat}
          className="btn-ghost"
          aria-pressed={chatOpen}
        >
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
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
          </svg>
          <span className="hidden sm:inline">
            {chatOpen ? "Ocultar chat" : "Mostrar chat"}
          </span>
        </button>

        <UserMenu />
      </div>
    </header>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger =
        triggerRef.current && triggerRef.current.contains(target);
      const inMenu = menuRef.current && menuRef.current.contains(target);
      if (!inTrigger && !inMenu) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/");
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
          right: pos.right,
          zIndex: 9999,
          minWidth: 220,
          padding: 6,
          background: "var(--paper)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
          <div className="px-3 py-2 border-b border-hairline-2 mb-1">
            <div className="font-serif text-sm font-medium">{user.name}</div>
            <div className="font-mono text-[10px] text-muted tracking-[0.14em] uppercase mt-0.5">
              {user.role || "Miembro"}
            </div>
          </div>
          <Link
            href="/ajustes"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-paper-2 transition-colors text-sm"
            role="menuitem"
          >
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.6.2 1.2.6 1.5 1.1l.1.1A2 2 0 1 1 21 13.1c-.5.3-.9.9-1.1 1.5z" />
            </svg>
            Ajustes
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-paper-2 transition-colors text-sm text-left"
            style={{ color: "var(--pink)" }}
            role="menuitem"
          >
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Cerrar sesión
          </button>
        </div>
    ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={user.name} avatar={user.avatar} size="lg" />
        <div className="leading-tight hidden md:block text-left">
          <div className="font-serif text-base font-medium">{user.name}</div>
          <div className="font-mono text-[10.5px] text-muted tracking-[0.14em] uppercase">
            {user.role || "Miembro"}
          </div>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="hidden md:block"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {mounted && dropdown ? createPortal(dropdown, document.body) : null}
    </>
  );
}
