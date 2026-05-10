"use client";

import { useEffect, useState } from "react";
import { AvatarPicker } from "@/components/auth/AvatarPicker";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useAuth } from "@/lib/auth-context";
import { DEFAULT_AVATAR } from "@/lib/avatars";
import { useTheme } from "@/lib/theme-provider";
import { useWorkspace } from "@/lib/workspace-context";
import { PageHeader } from "./PageHeader";

export function AjustesPage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        eyebrow="Ajustes"
        title="Preferencias del workspace"
        description="Tu cuenta, apariencia y configuración del proyecto activo."
      />

      <div className="grid gap-6 max-w-3xl">
        {user && <ProfileSection />}
        {user && <SecuritySection />}
        <AppearanceSection />
        <DataSection />
        <UpcomingSection />
      </div>
    </>
  );
}

function ProfileSection() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [role, setRole] = useState(user?.role ?? "");
  const [avatar, setAvatar] = useState<string>(
    user?.avatar ?? DEFAULT_AVATAR,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setRole(user.role ?? "");
    setAvatar(user.avatar);
  }, [user]);

  if (!user) return null;

  const normalizedRole = role.trim();
  const userRole = user.role ?? "";
  const dirty =
    name.trim() !== user.name ||
    normalizedRole !== userRole ||
    avatar !== user.avatar;

  const submit = async () => {
    setError(null);
    setSuccess(false);
    setSaving(true);
    const res = await updateProfile({
      name,
      role: normalizedRole.length > 0 ? normalizedRole : null,
      avatar,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo guardar.");
      return;
    }
    setSuccess(true);
    window.setTimeout(() => setSuccess(false), 2800);
  };

  const reset = () => {
    setName(user.name);
    setRole(user.role ?? "");
    setAvatar(user.avatar);
    setError(null);
    setSuccess(false);
  };

  return (
    <Section title="Perfil">
      <div className="py-5 flex flex-col gap-5">
        <AvatarPicker value={avatar} onChange={setAvatar} name={name} />

        <Field label="Correo">
          <input
            className="field-input"
            value={user.email}
            readOnly
            disabled
            autoComplete="email"
          />
        </Field>

        <Field label="Nombre">
          <input
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre de usuario"
            autoComplete="username"
          />
        </Field>

        <Field label="Rol (opcional)">
          <input
            className="field-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ej. Diseñadora, Programador, Manager..."
          />
        </Field>

        {error && <ErrorBanner msg={error} />}
        {success && <SuccessBanner msg="Perfil actualizado." />}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={reset}
            disabled={!dirty || saving}
            className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!dirty || saving}
            className="btn-cobalt disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </Section>
  );
}

function SecuritySection() {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError(null);
  };

  const submit = async () => {
    setError(null);
    setSuccess(false);

    if (!current) {
      setError("Ingresa tu contraseña actual.");
      return;
    }
    if (next.length < 4) {
      setError("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }
    if (next !== confirm) {
      setError("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    setSaving(true);
    const res = await changePassword(current, next);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo cambiar la contraseña.");
      return;
    }
    reset();
    setSuccess(true);
    window.setTimeout(() => setSuccess(false), 2800);
  };

  const canSubmit =
    current.length > 0 && next.length >= 4 && confirm === next && !saving;

  return (
    <Section title="Seguridad">
      <div className="py-5 flex flex-col gap-5">
        <Field label="Contraseña actual">
          <PasswordInput
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            placeholder="Tu contraseña actual"
          />
        </Field>

        <Field label="Nueva contraseña">
          <PasswordInput
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            placeholder="Mínimo 4 caracteres"
          />
        </Field>

        <Field label="Confirmar nueva contraseña">
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="Repite la nueva contraseña"
          />
          {confirm.length > 0 && confirm !== next && (
            <span className="text-[11px] text-pink mt-1">
              Las contraseñas no coinciden.
            </span>
          )}
        </Field>

        {error && <ErrorBanner msg={error} />}
        {success && <SuccessBanner msg="Contraseña actualizada." />}

        <p className="text-[11px] text-muted leading-relaxed">
          Recordatorio: las contraseñas se guardan hasheadas con SHA-256 en este
          navegador. Para multi-dispositivo se requiere un backend.
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={reset}
            disabled={
              (!current && !next && !confirm) || saving
            }
            className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="btn-cobalt disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </div>
      </div>
    </Section>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  return (
    <Section title="Apariencia">
      <Setting
        label="Tema"
        description="Modo claro u oscuro. Se persiste por dispositivo."
      >
        <div className="flex gap-2">
          <ThemeBtn
            active={theme === "light"}
            onClick={() => setTheme("light")}
          >
            Claro
          </ThemeBtn>
          <ThemeBtn
            active={theme === "dark"}
            onClick={() => setTheme("dark")}
          >
            Oscuro
          </ThemeBtn>
        </div>
      </Setting>
    </Section>
  );
}

function DataSection() {
  const { resetWorkspace } = useWorkspace();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <Section title="Datos">
      <Setting
        label="Restablecer workspace"
        description="Borra todos los proyectos guardados en este navegador y vuelve al ejemplo inicial. No afecta tu cuenta ni a otros dispositivos."
      >
        <button
          type="button"
          onClick={() => {
            if (!confirmReset) {
              setConfirmReset(true);
              return;
            }
            resetWorkspace();
            setConfirmReset(false);
          }}
          onMouseLeave={() => setConfirmReset(false)}
          className="px-4 py-2 rounded-lg font-mono text-[10.5px] tracking-[0.14em] uppercase transition-colors"
          style={{
            color: "var(--pink)",
            background: confirmReset ? "var(--pink-soft)" : "transparent",
            border: `1px solid ${confirmReset ? "var(--pink)" : "var(--hairline)"}`,
          }}
        >
          {confirmReset ? "Confirmar" : "Restablecer"}
        </button>
      </Setting>
    </Section>
  );
}

function UpcomingSection() {
  return (
    <Section title="Próximamente">
      <Setting
        label="Conexión a backend"
        description="Conectar con Supabase / Postgres para sincronización entre dispositivos del equipo."
      >
        <UpcomingPill />
      </Setting>
      <Setting
        label="Notificaciones por email"
        description="Recibir alertas de retraso o nuevos mensajes por correo."
      >
        <UpcomingPill />
      </Setting>
      <Setting
        label="Pasarelas de pago"
        description="Stripe para facturar entregables al cliente."
      >
        <UpcomingPill />
      </Setting>
    </Section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="grain rounded-design border border-hairline overflow-hidden"
      style={{ background: "var(--paper)", boxShadow: "var(--shadow-sm)" }}
    >
      <header className="px-5 pt-4 pb-3 border-b border-hairline-2">
        <h2 className="font-serif text-lg font-medium">{title}</h2>
      </header>
      <div className="px-5 py-2">{children}</div>
    </section>
  );
}

function Setting({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4 border-b border-hairline-2 last:border-0 flex flex-wrap items-center justify-between gap-4">
      <div className="flex-1 min-w-[260px]">
        <div className="font-serif text-base font-medium">{label}</div>
        <p className="text-[13px] text-muted mt-1 leading-relaxed">
          {description}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="micro">{label}</span>
      {children}
    </label>
  );
}

function ThemeBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg font-mono text-[10.5px] tracking-[0.14em] uppercase transition-colors"
      style={{
        background: active ? "var(--cobalt)" : "transparent",
        color: active ? "white" : "var(--ink-2)",
        border: `1px solid ${active ? "var(--cobalt)" : "var(--hairline)"}`,
      }}
    >
      {children}
    </button>
  );
}

function UpcomingPill() {
  return (
    <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted">
      En desarrollo
    </span>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div
      role="alert"
      className="text-sm py-2.5 px-3.5 rounded-lg flex items-start gap-2"
      style={{
        background: "var(--pink-soft)",
        color: "var(--pink)",
        border: "1px solid var(--pink)",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <span>{msg}</span>
    </div>
  );
}

function SuccessBanner({ msg }: { msg: string }) {
  return (
    <div
      role="status"
      className="text-sm py-2.5 px-3.5 rounded-lg flex items-start gap-2"
      style={{
        background: "var(--cobalt-soft)",
        color: "var(--cobalt)",
        border: "1px solid var(--cobalt)",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0"
      >
        <path d="M5 12.5l4.5 4.5L19 7" />
      </svg>
      <span>{msg}</span>
    </div>
  );
}
