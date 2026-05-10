"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/primitives/Avatar";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { InviteMemberModal } from "./InviteMemberModal";
import { PageHeader } from "./PageHeader";

interface Profile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string | null;
  created_at: string;
}

export function EquipoPage() {
  const { user } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    if (!supabaseReady) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("id, email, name, avatar, role, created_at")
        .order("created_at", { ascending: true });

      if (cancelled) return;
      if (queryError) {
        setError(queryError.message);
      } else {
        setProfiles((data as Profile[]) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabaseReady]);

  const sortedProfiles = useMemo(() => {
    if (!profiles) return [];
    // El usuario actual primero, después por fecha de registro.
    return [...profiles].sort((a, b) => {
      if (user) {
        if (a.id === user.id) return -1;
        if (b.id === user.id) return 1;
      }
      return a.created_at.localeCompare(b.created_at);
    });
  }, [profiles, user]);

  return (
    <>
      <PageHeader
        eyebrow="Equipo"
        title="Quién está construyendo"
        description={
          supabaseReady
            ? "Todos los miembros registrados en este espacio de trabajo."
            : "Modo local: invita compañeros para que aparezcan aquí."
        }
        action={
          <button onClick={() => setInviteOpen(true)} className="btn-cobalt">
            + Invitar miembro
          </button>
        }
      />

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />

      {!supabaseReady && (
        <EmptyCard
          title="Sin conexión con Supabase"
          message="En modo local no podemos listar a tus compañeros. Configura las variables de entorno de Supabase para verlos aquí."
        />
      )}

      {supabaseReady && loading && (
        <EmptyCard
          title="Cargando miembros…"
          message="Buscando perfiles registrados."
        />
      )}

      {supabaseReady && !loading && error && (
        <EmptyCard
          title="No se pudo cargar el equipo"
          message={
            error.includes("relation") || error.includes("does not exist")
              ? "La tabla 'profiles' aún no existe en Supabase. Revisa el archivo supabase/profiles.sql y ejecútalo en el SQL Editor."
              : error
          }
          tone="error"
        />
      )}

      {supabaseReady && !loading && !error && sortedProfiles.length === 0 && (
        <EmptyCard
          title="Aún no hay miembros"
          message="Comparte el enlace de invitación para que tu equipo se sume."
        />
      )}

      {supabaseReady && !loading && !error && sortedProfiles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProfiles.map((p) => (
            <MemberCard
              key={p.id}
              profile={p}
              isMe={user?.id === p.id}
            />
          ))}
        </div>
      )}
    </>
  );
}

function MemberCard({
  profile,
  isMe,
}: {
  profile: Profile;
  isMe: boolean;
}) {
  const joined = formatJoined(profile.created_at);
  const displayName = profile.name?.trim() || profile.email.split("@")[0];

  return (
    <article
      className="grain rounded-design border border-hairline p-6"
      style={{
        background: "var(--paper)",
        boxShadow: "var(--shadow-sm)",
        borderColor: isMe ? "var(--cobalt)" : undefined,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Avatar
          name={displayName}
          avatar={profile.avatar || undefined}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-serif text-lg font-medium leading-tight">
              {displayName}
            </div>
            {isMe && (
              <span
                className="font-mono text-[9px] tracking-[0.16em] uppercase px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--cobalt-soft)",
                  color: "var(--cobalt)",
                }}
              >
                tú
              </span>
            )}
          </div>
          <div className="font-mono text-[10.5px] text-muted tracking-[0.14em] uppercase mt-0.5">
            {profile.role?.trim() || "Miembro"}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-[13px]">
        <Row label="Correo" value={profile.email} mono />
        <Row label="Se unió" value={joined} />
      </div>
    </article>
  );
}

function Row({
  label,
  value,
  mono,
  color,
}: {
  label: string;
  value: string;
  mono?: boolean;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 min-w-0">
      <span className="text-muted shrink-0">{label}</span>
      <span
        className={
          mono
            ? "font-mono text-[12px] tracking-[0.02em] truncate"
            : "font-mono tracking-[0.06em] truncate"
        }
        style={{ color }}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyCard({
  title,
  message,
  tone,
}: {
  title: string;
  message: string;
  tone?: "error";
}) {
  return (
    <div
      className="grain rounded-design border border-hairline p-10 text-center"
      style={{
        background: "var(--paper)",
        borderColor: tone === "error" ? "var(--pink)" : undefined,
      }}
    >
      <p
        className="font-serif text-lg mb-2"
        style={{ color: tone === "error" ? "var(--pink)" : undefined }}
      >
        {title}
      </p>
      <p className="text-muted text-sm leading-relaxed max-w-md mx-auto">
        {message}
      </p>
    </div>
  );
}

function formatJoined(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const now = Date.now();
    const diffDays = Math.floor((now - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30)
      return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) === 1 ? "" : "s"}`;
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}
