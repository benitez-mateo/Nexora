"use client";

import Link from "next/link";
import { ProgressRing } from "@/components/primitives/ProgressRing";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/workspace-context";
import {
  projectProgress,
  projectStatus,
  type Project,
} from "@/lib/types";
import { PageHeader } from "./PageHeader";

export function InicioPage() {
  const { user } = useAuth();
  const { projects } = useWorkspace();
  const firstName = user?.name.split(" ")[0] ?? "";

  const totalSteps = projects.reduce((sum, p) => sum + p.steps.length, 0);
  const completedSteps = projects.reduce(
    (sum, p) =>
      sum + p.steps.filter((s) => s.status === "completed").length,
    0,
  );
  const delayedSteps = projects.reduce(
    (sum, p) => sum + p.steps.filter((s) => s.status === "delayed").length,
    0,
  );
  const totalMessages = projects.reduce(
    (sum, p) => sum + p.messages.length,
    0,
  );
  const globalProgress =
    projects.length === 0
      ? 0
      : Math.round(
          projects.reduce((sum, p) => sum + projectProgress(p), 0) /
            projects.length,
        );

  return (
    <>
      <PageHeader
        eyebrow={firstName ? `Hola, ${firstName}` : "Bienvenida"}
        title="Tu jornada de hoy"
        description="Resumen de todos tus proyectos activos."
      />

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <Stat
          label="Progreso global"
          value={`${globalProgress}%`}
          accent="cobalt"
        />
        <Stat
          label="Proyectos"
          value={String(projects.length)}
        />
        <Stat
          label="Fases completadas"
          value={totalSteps === 0 ? "—" : `${completedSteps}/${totalSteps}`}
        />
        <Stat
          label="En atención"
          value={String(delayedSteps)}
          accent={delayedSteps > 0 ? "pink" : undefined}
        />
      </section>

      <section className="mb-2 flex items-baseline justify-between">
        <h2 className="micro">Tus proyectos</h2>
        <Link
          href="/proyectos"
          className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-cobalt hover:underline"
        >
          Ver todos →
        </Link>
      </section>

      {projects.length === 0 ? (
        <EmptyProjects />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {projects.slice(0, 6).map((p) => (
            <ProjectMiniCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <p className="text-[11px] text-muted">
        {totalMessages} {totalMessages === 1 ? "mensaje" : "mensajes"} en los
        chats de proyectos.
      </p>
    </>
  );
}

function ProjectMiniCard({ project }: { project: Project }) {
  const progress = projectProgress(project);
  const status = projectStatus(project);
  const accentColor =
    status === "EN RIESGO"
      ? "var(--pink)"
      : status === "FINALIZADO"
        ? "var(--ink-2)"
        : "var(--cobalt)";
  const focus = project.steps.find(
    (s) => s.status === "active" || s.status === "delayed",
  );

  return (
    <Link
      href={`/proyectos/${project.id}`}
      className="grain rounded-design border border-hairline p-5 flex flex-col gap-4 transition-[transform,border-color] hover:-translate-y-1 hover:border-cobalt"
      style={{ background: "var(--paper)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="micro mb-1">{project.client}</div>
          <h3 className="font-serif text-lg font-medium leading-tight">
            {project.title}
          </h3>
        </div>
        <ProgressRing
          value={progress}
          size={56}
          stroke={2.5}
          color={accentColor}
          label=""
        />
      </div>

      {focus ? (
        <div
          className="rounded-design-sm p-2.5 text-[12px]"
          style={{ background: "var(--paper-2)" }}
        >
          <div className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-muted mb-0.5">
            Foco
          </div>
          <div className="font-serif">
            {focus.num} · {focus.title}
          </div>
        </div>
      ) : (
        <div
          className="rounded-design-sm p-2.5 text-[12px]"
          style={{ background: "var(--paper-2)" }}
        >
          <div
            className="font-mono text-[9.5px] tracking-[0.14em] uppercase"
            style={{ color: accentColor }}
          >
            {status}
          </div>
        </div>
      )}

      <div className="border-t border-hairline-2 pt-2.5 flex items-center justify-between text-[11px]">
        <span className="font-mono tracking-[0.08em]">
          {project.finalDate}
        </span>
        <span className="font-mono tracking-[0.14em] uppercase text-muted">
          {project.steps.length}{" "}
          {project.steps.length === 1 ? "fase" : "fases"}
        </span>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "cobalt" | "pink";
}) {
  const color =
    accent === "cobalt"
      ? "var(--cobalt)"
      : accent === "pink"
        ? "var(--pink)"
        : "var(--ink)";
  return (
    <div
      className="grain rounded-design border border-hairline p-5"
      style={{ background: "var(--paper)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="micro mb-2">{label}</div>
      <div
        className="font-serif text-[40px] font-medium leading-none"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyProjects() {
  return (
    <div
      className="grain rounded-design border border-dashed border-hairline p-10 text-center mb-10"
      style={{ background: "var(--paper)" }}
    >
      <div className="font-serif text-2xl font-medium mb-2">
        Aún no tienes proyectos
      </div>
      <p className="text-sm text-muted max-w-md mx-auto mb-5">
        Crea tu primer proyecto para empezar a trabajar.
      </p>
      <Link href="/proyectos" className="btn-cobalt inline-flex">
        + Crear primer proyecto
      </Link>
    </div>
  );
}
