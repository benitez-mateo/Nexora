"use client";

import Link from "next/link";
import { ProgressRing } from "@/components/primitives/ProgressRing";
import { useWorkspace } from "@/lib/workspace-context";
import {
  progressOf,
  projectProgress,
  projectStatus,
  type Project,
} from "@/lib/types";
import { PageHeader } from "./PageHeader";

export function ReportesPage() {
  const { projects } = useWorkspace();

  const totalSteps = projects.reduce((sum, p) => sum + p.steps.length, 0);
  const completedSteps = projects.reduce(
    (sum, p) =>
      sum + p.steps.filter((s) => s.status === "completed").length,
    0,
  );
  const totalDeliverables = projects.reduce(
    (sum, p) =>
      sum + p.steps.reduce((s, st) => s + st.deliverables.length, 0),
    0,
  );
  const doneDeliverables = projects.reduce(
    (sum, p) =>
      sum +
      p.steps.reduce(
        (s, st) => s + st.deliverables.filter((d) => d.done).length,
        0,
      ),
    0,
  );
  const delayedSteps = projects.reduce(
    (sum, p) => sum + p.steps.filter((s) => s.status === "delayed").length,
    0,
  );
  const delayMessages = projects.reduce(
    (sum, p) => sum + p.messages.filter((m) => m.alert).length,
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
        eyebrow="Reportes"
        title="Métricas consolidadas"
        description="Visión global del avance y la salud de todos los proyectos."
      />

      <section className="grid gap-6 lg:grid-cols-[auto_1fr] mb-10 items-start">
        <div
          className="grain rounded-design border border-hairline p-8 grid place-items-center"
          style={{ background: "var(--paper)", boxShadow: "var(--shadow-sm)" }}
        >
          <ProgressRing value={globalProgress} size={200} stroke={4} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Metric label="Proyectos" value={String(projects.length)} />
          <Metric
            label="Fases completadas"
            value={totalSteps === 0 ? "—" : `${completedSteps} / ${totalSteps}`}
          />
          <Metric
            label="Entregables"
            value={
              totalDeliverables === 0
                ? "—"
                : `${doneDeliverables} / ${totalDeliverables}`
            }
          />
          <Metric
            label="Fases con retraso"
            value={String(delayedSteps)}
            tone={delayedSteps > 0 ? "pink" : undefined}
          />
          <Metric
            label="Alertas difundidas"
            value={String(delayMessages)}
            tone={delayMessages > 0 ? "pink" : undefined}
          />
        </div>
      </section>

      <section className="mb-3">
        <h2 className="micro mb-4">Avance por proyecto</h2>
      </section>

      <div className="flex flex-col gap-4">
        {projects.map((project) => (
          <ProjectReport key={project.id} project={project} />
        ))}
      </div>

      {projects.length === 0 && (
        <p className="text-center text-muted py-12">
          No hay proyectos para reportar.
        </p>
      )}
    </>
  );
}

function ProjectReport({ project }: { project: Project }) {
  const progress = projectProgress(project);
  const status = projectStatus(project);
  const accent =
    status === "EN RIESGO"
      ? "var(--pink)"
      : status === "FINALIZADO"
        ? "var(--ink-2)"
        : "var(--cobalt)";

  return (
    <Link
      href={`/proyectos/${project.id}`}
      className="grain rounded-design border border-hairline p-6 hover:border-cobalt transition-colors block"
      style={{ background: "var(--paper)" }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="micro mb-1">{project.client}</div>
          <h3 className="font-serif text-xl font-medium">
            {project.title}
          </h3>
        </div>
        <div className="text-right">
          <div
            className="font-serif text-2xl font-medium leading-none"
            style={{ color: accent }}
          >
            {progress}%
          </div>
          <div
            className="font-mono text-[9.5px] tracking-[0.14em] uppercase mt-1.5"
            style={{ color: accent }}
          >
            {status}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {project.steps.length === 0 ? (
          <p className="text-xs text-muted italic">Sin fases definidas.</p>
        ) : (
          project.steps.map((s) => {
            const p = progressOf(s);
            const color =
              s.status === "delayed"
                ? "var(--pink)"
                : s.status === "completed"
                  ? "var(--ink-2)"
                  : "var(--cobalt)";
            return (
              <div key={s.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <div className="font-serif text-sm">
                    {s.num} · {s.title}{" "}
                    {s.subtitle && (
                      <span className="text-muted">{s.subtitle}</span>
                    )}
                  </div>
                  <div className="font-mono text-xs tracking-[0.06em]">
                    {p}%
                  </div>
                </div>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: "var(--hairline)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${p}%`, background: color }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Link>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "pink";
}) {
  const color = tone === "pink" ? "var(--pink)" : "var(--ink)";
  return (
    <div
      className="grain rounded-design border border-hairline p-5"
      style={{ background: "var(--paper)" }}
    >
      <div className="micro mb-2">{label}</div>
      <div
        className="font-serif text-[36px] font-medium leading-none"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}
