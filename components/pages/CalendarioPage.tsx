"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import { progressOf } from "@/lib/types";
import type { Project, Step } from "@/lib/types";
import { PageHeader } from "./PageHeader";

interface TimelineItem {
  step: Step;
  project: Project;
  date: Date;
  offset: number;
}

function parseDate(d: string): Date | null {
  const parts = d.split("/");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

const PROJECT_COLORS = [
  "var(--cobalt)",
  "var(--pink)",
  "#7c3aed",
  "#10b981",
  "#f59e0b",
  "#06b6d4",
  "#ef4444",
  "#a855f7",
];

export function CalendarioPage() {
  const { projects } = useWorkspace();

  const projectColorMap = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach((p, i) => m.set(p.id, PROJECT_COLORS[i % PROJECT_COLORS.length]));
    return m;
  }, [projects]);

  const timeline = useMemo(() => {
    const dated: TimelineItem[] = [];
    projects.forEach((project) => {
      project.steps.forEach((step) => {
        const date = parseDate(step.date);
        if (date) dated.push({ step, project, date, offset: 0 });
      });
    });
    if (dated.length === 0) return null;
    const min = Math.min(...dated.map((x) => x.date.getTime()));
    const max = Math.max(...dated.map((x) => x.date.getTime()));
    const range = max - min || 1;
    return dated
      .map((x) => ({
        ...x,
        offset: ((x.date.getTime() - min) / range) * 100,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [projects]);

  return (
    <>
      <PageHeader
        eyebrow="Calendario"
        title="Línea de tiempo de todos los proyectos"
        description="Cada fase de cada proyecto ubicada en su fecha. Las retrasadas aparecen en magenta."
      />

      {projects.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 text-[12px]"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: projectColorMap.get(p.id) }}
              />
              <span className="font-serif">{p.title}</span>
              <span className="text-muted">· {p.client}</span>
            </div>
          ))}
        </div>
      )}

      {timeline ? (
        <div
          className="grain rounded-design border border-hairline p-8 mb-8"
          style={{ background: "var(--paper)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="relative h-32">
            <div
              className="absolute left-0 right-0 top-1/2 h-px"
              style={{ background: "var(--hairline)" }}
            />
            {timeline.map(({ step, project, offset }, i) => (
              <div
                key={`${project.id}-${step.id}`}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${offset}%` }}
              >
                <div
                  className="w-3 h-3 rounded-full mx-auto ring-2"
                  style={{
                    background:
                      step.status === "delayed"
                        ? "var(--pink)"
                        : step.status === "completed"
                          ? projectColorMap.get(project.id)
                          : projectColorMap.get(project.id),
                    opacity: step.status === "completed" ? 0.4 : 1,
                    // @ts-expect-error css var
                    "--tw-ring-color": "var(--paper)",
                  }}
                />
                <div
                  className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
                  style={{ marginTop: i % 2 === 0 ? 0 : 36 }}
                >
                  <div className="font-mono text-[10px] text-muted tracking-[0.1em]">
                    {step.date}
                  </div>
                  <div className="font-serif text-xs mt-0.5">
                    {step.num} · {step.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted text-center py-12">
          No hay fases con fechas para mostrar.
        </p>
      )}

      <div className="grid gap-3">
        {projects.map((project) => (
          <ProjectGroup
            key={project.id}
            project={project}
            color={projectColorMap.get(project.id) ?? "var(--cobalt)"}
          />
        ))}
      </div>
    </>
  );
}

function ProjectGroup({
  project,
  color,
}: {
  project: Project;
  color: string;
}) {
  if (project.steps.length === 0) return null;

  return (
    <Link
      href={`/proyectos/${project.id}`}
      className="grain rounded-design border border-hairline p-5 hover:border-cobalt transition-colors"
      style={{ background: "var(--paper)" }}
    >
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-hairline-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: color }}
        />
        <div className="flex-1">
          <div className="font-serif text-base">{project.title}</div>
          <div className="micro mt-0.5">{project.client}</div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {project.steps.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 text-[13px]"
          >
            <div
              className="w-9 h-9 rounded-full grid place-items-center font-mono text-xs shrink-0"
              style={{
                background:
                  s.status === "completed"
                    ? "var(--paper-2)"
                    : s.status === "delayed"
                      ? "var(--pink-soft)"
                      : s.status === "active"
                        ? "var(--cobalt-soft)"
                        : "var(--paper-2)",
                color:
                  s.status === "delayed"
                    ? "var(--pink)"
                    : s.status === "active"
                      ? "var(--cobalt)"
                      : "var(--ink)",
              }}
            >
              {s.num}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-serif">
                {s.title}{" "}
                {s.subtitle && (
                  <span className="text-muted">{s.subtitle}</span>
                )}
              </div>
              <div className="font-mono text-[10.5px] text-muted tracking-[0.14em] uppercase mt-0.5">
                {s.dateLabel} · {s.date}
              </div>
            </div>
            <div className="font-mono text-xs tracking-[0.06em]">
              {progressOf(s)}%
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}
