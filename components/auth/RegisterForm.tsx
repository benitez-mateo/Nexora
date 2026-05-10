"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { DEFAULT_AVATAR } from "@/lib/avatars";
import { AvatarPicker } from "./AvatarPicker";
import { PasswordInput } from "./PasswordInput";

export function RegisterForm() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await register(email, password, name, avatar, role);
    if (!res.ok) setError(res.error ?? "Error al crear la cuenta.");
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <AvatarPicker value={avatar} onChange={setAvatar} name={name} />

      <Field label="Correo *">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
          className="auth-input"
          placeholder="tu@correo.com"
        />
      </Field>

      <Field label="Nombre *">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="auth-input"
          placeholder="Cómo quieres que te llamen"
        />
      </Field>

      <Field label="Rol (opcional)">
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="auth-input"
          placeholder="Ej. Diseñadora, Front-end, Manager..."
        />
      </Field>

      <Field label="Contraseña *">
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="auth-input"
          placeholder="Mínimo 6 caracteres"
        />
      </Field>

      {error && (
        <div
          role="alert"
          className="text-sm py-2 px-3 rounded-lg"
          style={{
            background: "var(--pink-soft)",
            color: "var(--pink)",
            border: "1px solid var(--pink)",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="btn-cobalt mt-2 disabled:opacity-50"
      >
        {busy ? "Creando..." : "Crear cuenta"}
      </button>
    </form>
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
