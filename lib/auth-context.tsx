"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase/client";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role?: string;
  createdAt: number;
  /** En el modo local guardamos el hash; en modo Supabase queda vacío. */
  passwordHash?: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export interface ProfileUpdate {
  name?: string;
  role?: string | null;
  avatar?: string;
}

interface AuthContextValue {
  user: User | null;
  hydrated: boolean;
  /** True si la app está conectada a Supabase. */
  remote: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    email: string,
    password: string,
    name: string,
    avatar: string,
    role?: string,
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<AuthResult>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ===========================================================================
 * Adaptador local (modo offline / sin Supabase)
 * ========================================================================= */

const USERS_KEY = "nexora_users";
const SESSION_KEY = "nexora_session";

async function hashPassword(p: string): Promise<string> {
  if (
    typeof crypto === "undefined" ||
    !("subtle" in crypto) ||
    !crypto.subtle
  ) {
    return `plain:${p}`;
  }
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(p),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loadLocalUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Migración suave: usuarios viejos sin email reciben uno sintético.
    return (parsed as Partial<User>[]).map((u) => ({
      id: u.id ?? "",
      email: u.email ?? `${(u.name ?? "user").toLowerCase().replace(/\s+/g, ".")}@local`,
      name: u.name ?? "Sin nombre",
      avatar: u.avatar ?? "",
      role: u.role,
      createdAt: u.createdAt ?? Date.now(),
      passwordHash: u.passwordHash,
    }));
  } catch {
    return [];
  }
}

function saveLocalUsers(users: User[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `u-${Date.now()}-${Math.random().toString(16).slice(2)}`;

/* ===========================================================================
 * Helpers Supabase
 * ========================================================================= */

function userFromSession(session: Session | null): User | null {
  if (!session?.user) return null;
  const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: (meta.name as string) || session.user.email?.split("@")[0] || "",
    avatar: (meta.avatar as string) || "",
    role: (meta.role as string) || undefined,
    createdAt: session.user.created_at
      ? new Date(session.user.created_at).getTime()
      : Date.now(),
  };
}

/* ===========================================================================
 * Provider
 * ========================================================================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const remote = useRef(isSupabaseConfigured());

  /* ---- Hidratación inicial ---- */
  useEffect(() => {
    let mounted = true;

    if (remote.current) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setHydrated(true);
        return;
      }
      supabase.auth.getSession().then(({ data }) => {
        if (!mounted) return;
        setUser(userFromSession(data.session));
        setHydrated(true);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(userFromSession(session));
      });
      return () => {
        mounted = false;
        sub.subscription.unsubscribe();
      };
    } else {
      try {
        const sessionId = localStorage.getItem(SESSION_KEY);
        if (sessionId) {
          const found = loadLocalUsers().find((u) => u.id === sessionId);
          if (found) setUser(found);
        }
      } catch {
        /* ignore */
      }
      setHydrated(true);
    }
  }, []);

  /* ---- Register ---- */
  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      avatar: string,
      role?: string,
    ): Promise<AuthResult> => {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();
      if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail))
        return { ok: false, error: "Ingresa un correo válido." };
      if (!trimmedName) return { ok: false, error: "Ingresa un nombre." };
      if (trimmedName.length < 2)
        return { ok: false, error: "El nombre es muy corto." };
      if (password.length < 6)
        return {
          ok: false,
          error: "La contraseña debe tener al menos 6 caracteres.",
        };
      if (!avatar) return { ok: false, error: "Elige un avatar." };

      if (remote.current) {
        const supabase = getSupabaseClient();
        if (!supabase) return { ok: false, error: "Supabase no disponible." };
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              name: trimmedName,
              avatar,
              role: role?.trim() || null,
            },
            emailRedirectTo:
              typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (error) return { ok: false, error: traduceSupabaseError(error.message) };
        // Si el proyecto tiene "Confirm email" activado, no habrá session.
        if (!data.session) {
          return {
            ok: false,
            error:
              "Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja.",
          };
        }
        setUser(userFromSession(data.session));
        return { ok: true };
      }

      // Modo local
      const users = loadLocalUsers();
      if (users.find((u) => u.email.toLowerCase() === trimmedEmail))
        return { ok: false, error: "Ya existe un usuario con ese correo." };

      const newUser: User = {
        id: newId(),
        email: trimmedEmail,
        name: trimmedName,
        avatar,
        role: role?.trim() || undefined,
        createdAt: Date.now(),
        passwordHash: await hashPassword(password),
      };
      saveLocalUsers([...users, newUser]);
      localStorage.setItem(SESSION_KEY, newUser.id);
      setUser(newUser);
      return { ok: true };
    },
    [],
  );

  /* ---- Login ---- */
  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) return { ok: false, error: "Ingresa tu correo." };
      if (!password) return { ok: false, error: "Ingresa tu contraseña." };

      if (remote.current) {
        const supabase = getSupabaseClient();
        if (!supabase) return { ok: false, error: "Supabase no disponible." };
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) return { ok: false, error: traduceSupabaseError(error.message) };
        setUser(userFromSession(data.session));
        return { ok: true };
      }

      const users = loadLocalUsers();
      const found = users.find((u) => u.email.toLowerCase() === trimmedEmail);
      if (!found) return { ok: false, error: "Usuario no encontrado." };
      const hash = await hashPassword(password);
      if (hash !== found.passwordHash)
        return { ok: false, error: "Contraseña incorrecta." };
      localStorage.setItem(SESSION_KEY, found.id);
      setUser(found);
      return { ok: true };
    },
    [],
  );

  /* ---- Logout ---- */
  const logout = useCallback(async () => {
    if (remote.current) {
      const supabase = getSupabaseClient();
      if (supabase) await supabase.auth.signOut();
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    setUser(null);
  }, []);

  /* ---- Update profile ---- */
  const updateProfile = useCallback(
    async (updates: ProfileUpdate): Promise<AuthResult> => {
      if (!user) return { ok: false, error: "Sesión no encontrada." };

      const next: Partial<User> = {};

      if (updates.name !== undefined) {
        const trimmed = updates.name.trim();
        if (!trimmed)
          return { ok: false, error: "El nombre no puede estar vacío." };
        if (trimmed.length < 2)
          return { ok: false, error: "El nombre es muy corto." };
        next.name = trimmed;
      }

      if (updates.role !== undefined) {
        if (updates.role === null) next.role = undefined;
        else next.role = updates.role.trim() || undefined;
      }

      if (updates.avatar !== undefined) {
        if (!updates.avatar) return { ok: false, error: "Avatar inválido." };
        next.avatar = updates.avatar;
      }

      if (remote.current) {
        const supabase = getSupabaseClient();
        if (!supabase) return { ok: false, error: "Supabase no disponible." };
        const merged = { ...user, ...next };
        const { error } = await supabase.auth.updateUser({
          data: {
            name: merged.name,
            avatar: merged.avatar,
            role: merged.role ?? null,
          },
        });
        if (error) return { ok: false, error: error.message };
        setUser(merged);
        return { ok: true };
      }

      const merged = { ...user, ...next };
      const users = loadLocalUsers().map((u) => (u.id === user.id ? merged : u));
      saveLocalUsers(users);
      setUser(merged);
      return { ok: true };
    },
    [user],
  );

  /* ---- Change password ---- */
  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
    ): Promise<AuthResult> => {
      if (!user) return { ok: false, error: "Sesión no encontrada." };
      if (!currentPassword)
        return { ok: false, error: "Ingresa tu contraseña actual." };
      if (newPassword.length < 6)
        return {
          ok: false,
          error: "La nueva contraseña debe tener al menos 6 caracteres.",
        };

      if (remote.current) {
        const supabase = getSupabaseClient();
        if (!supabase) return { ok: false, error: "Supabase no disponible." };

        // Re-autentica para validar la contraseña actual.
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });
        if (signInError)
          return { ok: false, error: "Contraseña actual incorrecta." };

        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      }

      const currentHash = await hashPassword(currentPassword);
      if (currentHash !== user.passwordHash)
        return { ok: false, error: "Contraseña actual incorrecta." };
      const newHash = await hashPassword(newPassword);
      if (newHash === user.passwordHash)
        return {
          ok: false,
          error: "La nueva contraseña debe ser distinta a la actual.",
        };
      const next = { ...user, passwordHash: newHash };
      const users = loadLocalUsers().map((u) =>
        u.id === user.id ? next : u,
      );
      saveLocalUsers(users);
      setUser(next);
      return { ok: true };
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        hydrated,
        remote: remote.current,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

/* ===========================================================================
 * Errores Supabase → mensajes humanos
 * ========================================================================= */

function traduceSupabaseError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Correo o contraseña incorrectos.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "Ya existe una cuenta con ese correo.";
  if (m.includes("password")) return "Contraseña inválida.";
  if (m.includes("email")) return "Correo inválido.";
  if (m.includes("rate")) return "Demasiados intentos. Espera un momento.";
  return msg;
}
