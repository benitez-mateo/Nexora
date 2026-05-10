"use client";

import { useState } from "react";
import { NexoraLogo } from "@/components/workspace/NexoraLogo";
import { useAuth } from "@/lib/auth-context";
import { LoginForm } from "./LoginForm";
import { PremiumAnimatedBackground } from "./PremiumAnimatedBackground";
import { RegisterForm } from "./RegisterForm";

type Tab = "login" | "register";

export function AuthScreen() {
  const [tab, setTab] = useState<Tab>("login");
  const { remote } = useAuth();

  return (
    <div className="dark fixed inset-0 overflow-y-auto isolate auth-scope">
      <PremiumAnimatedBackground />

      <main className="relative z-10 min-h-screen grid place-items-center px-5 py-12">
        <div className="w-full max-w-md flex flex-col gap-8">
          <header className="flex flex-col items-center gap-5 auth-fade auth-fade-1">
            <div className="auth-logo-halo">
              <NexoraLogo />
            </div>
            <div className="text-center">
              <h1 className="auth-title">
                {tab === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
                <span className="auth-dot">.</span>
              </h1>
              <p className="auth-sub">
                {tab === "login"
                  ? "Ingresa con tu correo y contraseña."
                  : remote
                    ? "Tu cuenta se guarda en la nube y puedes entrar desde cualquier dispositivo."
                    : "Modo local: tu cuenta se guarda en este navegador."}
              </p>
            </div>
          </header>

          <section className="auth-card auth-fade auth-fade-2">
            <div className="auth-tabs" role="tablist" aria-label="Tipo de acceso">
              <Tab
                active={tab === "login"}
                onClick={() => setTab("login")}
                label="Iniciar sesión"
              />
              <Tab
                active={tab === "register"}
                onClick={() => setTab("register")}
                label="Crear cuenta"
              />
            </div>

            <div key={tab} className="auth-form-anim">
              {tab === "login" ? <LoginForm /> : <RegisterForm />}
            </div>
          </section>

          <p className="auth-footer auth-fade auth-fade-3">
            {remote ? (
              <>
                Cuentas sincronizadas con Supabase.
                <br />
                Tus proyectos se guardan en este dispositivo.
              </>
            ) : (
              <>
                Modo local — las cuentas se guardan en este navegador.
                <br />
                Configura Supabase para usar la app desde varios dispositivos.
              </>
            )}
          </p>
        </div>
      </main>

      <style jsx global>{`
        .auth-scope {
          color-scheme: dark;
        }

        .auth-logo-halo {
          padding: 8px 14px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .auth-title {
          font-family: var(--font-serif);
          font-weight: 500;
          letter-spacing: -0.025em;
          line-height: 1.05;
          font-size: clamp(34px, 5.4vw, 48px);
          color: rgba(255, 255, 255, 0.96);
          margin: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(255, 255, 255, 0.78) 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .auth-dot {
          background: linear-gradient(135deg, #6f86ff, #8b5cf6);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .auth-sub {
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
          margin: 12px 0 0;
          font-family: var(--font-sans);
          letter-spacing: 0.01em;
        }

        .auth-card {
          padding: 32px;
          border-radius: 24px;
          background: rgba(14, 16, 26, 0.5);
          backdrop-filter: blur(40px) saturate(150%);
          -webkit-backdrop-filter: blur(40px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            0 0 0 1px rgba(99, 102, 241, 0.06),
            0 40px 100px rgba(0, 0, 0, 0.6),
            0 16px 40px rgba(99, 102, 241, 0.18),
            0 4px 16px rgba(139, 92, 246, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          position: relative;
          overflow: hidden;
        }

        /* Inner gradient wash */
        .auth-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.07) 0%,
            transparent 35%,
            transparent 65%,
            rgba(59, 130, 246, 0.06) 100%
          );
          pointer-events: none;
        }

        /* Lit border — gradient ring via mask-composite trick */
        .auth-card::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(
            135deg,
            rgba(167, 139, 250, 0.45) 0%,
            rgba(99, 102, 241, 0.08) 35%,
            rgba(99, 102, 241, 0.08) 65%,
            rgba(96, 165, 250, 0.4) 100%
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0.55;
        }

        .auth-card > * {
          position: relative;
          z-index: 1;
        }

        .auth-tabs {
          display: flex;
          padding: 4px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 999px;
          margin-bottom: 28px;
          gap: 4px;
        }

        .auth-tab {
          flex: 1;
          padding: 9px 14px;
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.45);
          transition:
            background 320ms cubic-bezier(0.2, 0.8, 0.2, 1),
            color 240ms ease,
            box-shadow 320ms cubic-bezier(0.2, 0.8, 0.2, 1),
            transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
          background: transparent;
          border: 0;
          cursor: pointer;
        }

        .auth-tab:hover {
          color: rgba(255, 255, 255, 0.85);
        }

        .auth-tab[aria-selected="true"] {
          background: linear-gradient(135deg, #5e7bff 0%, #8b5cf6 100%);
          color: white;
          box-shadow:
            0 6px 20px rgba(99, 102, 241, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.18);
        }

        .auth-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.96);
          font-family: var(--font-sans);
          font-size: 15px;
          outline: none;
          transition:
            border-color 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
            background 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
            box-shadow 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .auth-input::placeholder {
          color: rgba(255, 255, 255, 0.28);
        }

        .auth-input:hover {
          border-color: rgba(255, 255, 255, 0.14);
        }

        .auth-input:focus {
          border-color: rgba(111, 134, 255, 0.65);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 4px rgba(111, 134, 255, 0.14);
        }

        .auth-scope .micro {
          color: rgba(255, 255, 255, 0.42);
          font-size: 10px;
          letter-spacing: 0.16em;
        }

        .auth-scope .btn-cobalt {
          padding: 13px 20px;
          font-size: 11px;
          letter-spacing: 0.16em;
          background: linear-gradient(135deg, #5e7bff 0%, #8b5cf6 100%);
          box-shadow:
            0 8px 24px rgba(99, 102, 241, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transition:
            transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
            box-shadow 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .auth-scope .btn-cobalt:hover {
          transform: translateY(-1px);
          box-shadow:
            0 12px 32px rgba(99, 102, 241, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.24);
        }

        .auth-scope .btn-ghost {
          color: rgba(255, 255, 255, 0.72);
          border-color: rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.03);
        }

        .auth-scope .btn-ghost:hover {
          color: rgba(255, 255, 255, 0.95);
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .auth-footer {
          text-align: center;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.32);
          line-height: 1.6;
          font-family: var(--font-mono);
          letter-spacing: 0.04em;
        }

        @keyframes authFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .auth-fade {
          animation: authFadeIn 900ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .auth-fade-1 {
          animation-delay: 80ms;
        }

        .auth-fade-2 {
          animation-delay: 240ms;
        }

        .auth-fade-3 {
          animation-delay: 480ms;
        }

        @keyframes authFormSwap {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .auth-form-anim {
          animation: authFormSwap 360ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-fade,
          .auth-form-anim {
            animation: none;
          }
          .blob {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function Tab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="auth-tab"
    >
      {label}
    </button>
  );
}
