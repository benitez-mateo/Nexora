"use client";

import { Avatar } from "@/components/primitives/Avatar";
import { TEAM } from "@/lib/data";
import { useWorkspace } from "@/lib/workspace-context";
import { PageHeader } from "./PageHeader";

export function EquipoPage() {
  const { steps } = useWorkspace();

  const taskCountFor = (name: string) =>
    steps.filter(
      (s) =>
        s.status === "active" ||
        s.status === "delayed" ||
        (s.status === "pending" && name === "María González"),
    ).length;

  return (
    <>
      <PageHeader
        eyebrow="Equipo"
        title="Quién está construyendo"
        description="Roles, carga de trabajo y disponibilidad de cada integrante del proyecto."
        action={
          <button className="btn-cobalt" disabled title="Próximamente">
            + Invitar miembro
          </button>
        }
      />

      {TEAM.length === 0 && (
        <div
          className="grain rounded-design border border-hairline p-10 text-center"
          style={{ background: "var(--paper)" }}
        >
          <p className="font-serif text-lg mb-2">Aún no hay miembros</p>
          <p className="text-muted text-sm">
            Cuando invites compañeros aparecerán aquí con su rol y carga.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM.map((m) => (
          <article
            key={m.name}
            className="grain rounded-design border border-hairline p-6"
            style={{ background: "var(--paper)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={m.name} size="lg" />
              <div>
                <div className="font-serif text-lg font-medium leading-tight">
                  {m.name}
                </div>
                <div className="font-mono text-[10.5px] text-muted tracking-[0.14em] uppercase mt-0.5">
                  {m.role}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-[13px]">
              <Row label="Carga" value={`${m.workload}%`} />
              <Row label="Tareas activas" value={String(taskCountFor(m.name))} />
              <Row
                label="Estado"
                value={m.workload > 80 ? "Saturado" : "Disponible"}
                color={m.workload > 80 ? "var(--pink)" : "var(--cobalt)"}
              />
            </div>

            <div
              className="mt-4 h-1 rounded-full overflow-hidden"
              style={{ background: "var(--hairline)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${m.workload}%`,
                  background:
                    m.workload > 80 ? "var(--pink)" : "var(--cobalt)",
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-mono tracking-[0.06em]" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
