"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PasswordInput } from "./PasswordInput";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await login(email, password);
    if (!res.ok) setError(res.error ?? "Error al iniciar sesión.");
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <Field label="Correo">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          autoComplete="email"
          inputMode="email"
          className="auth-input"
          placeholder="tu@correo.com"
        />
      </Field>

      <Field label="Contraseña">
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="auth-input"
          placeholder="••••••••"
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
        {busy ? "Entrando..." : "Iniciar sesión"}
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
