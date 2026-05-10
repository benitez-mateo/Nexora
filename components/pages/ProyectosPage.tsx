"use client";

import Link from "next/link";
import { useState } from "react";
import { ProgressRing } from "@/components/primitives/ProgressRing";
import { useWorkspace } from "@/lib/workspace-context";
import {
  projectProgress,
  projectStatus,
  type Project,
} from "@/lib/types";
import { NewProjectModal } from "./NewProjectModal";
import { PageHeader } from "./PageHeader";

export function ProyectosPage() {
  const { projects } = useWorkspace();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Proyectos"
        title="Tus proyectos en curso"
        description={`${projects.length} proyecto${projects.length === 1 ? "" : "s"} activo${projects.length === 1 ? "" : "s"}. Entra a uno o crea uno nuevo.`}
        action={
          <button onClick={() => setModalOpen(true)} className="btn-cobalt">
            + Nuevo proyecto
          </button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState onCreate={() => setModalOpen(true)} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { removeProject } = useWorkspace();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const progress = projectProgress(project);
  const status = projectStatus(project);
  const completedPhases = project.steps.filter(
    (s) => s.status === "completed",
  ).length;
  const delayedPhases = project.steps.filter(
    (s) => s.status === "delayed",
  ).length;

  const accentColor =
    status === "EN RIESGO"
      ? "var(--pink)"
      : status === "FINALIZADO"
        ? "var(--ink-2)"
        : "var(--cobalt)";

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    removeProject(project.id);
  };

  return (
    <Link
      href={`/proyectos/${project.id}`}
      onMouseLeave={() => setConfirmDelete(false)}
      className="grain group relative rounded-design border border-hairline p-6 flex flex-col gap-4 transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-cobalt"
      style={{
        background: "var(--paper)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="micro mb-1.5">{project.client}</div>
          <h3 className="font-serif text-xl font-medium leading-tight tracking-[-0.01em]">
            {project.title}
          </h3>
        </div>
        <ProgressRing
          value={progress}
          size={64}
          stroke={2.5}
          color={accentColor}
          label=""
        />
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-1">
        <Stat
          label="Estado"
          value={status}
          color={accentColor}
        />
        <Stat
          label="Fases"
          value={
            project.steps.length === 0
              ? "—"
              : `${completedPhases}/${project.steps.length}`
          }
        />
        {delayedPhases > 0 && (
          <Stat
            label="Retrasos"
            value={String(delayedPhases)}
            color="var(--pink)"
          />
        )}
      </div>

      <div className="border-t border-hairline-2 pt-3.5 mt-auto flex items-center justify-between">
        <div>
          <div className="micro">Entrega</div>
          <div className="font-mono text-xs tracking-[0.08em] mt-1">
            {project.finalDate}
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 transition-opacity font-mono text-[10px] tracking-[0.14em] uppercase px-2.5 py-1.5 rounded-md"
          style={{
            color: "var(--pink)",
            background: confirmDelete ? "var(--pink-soft)" : "transparent",
            border: `1px solid ${confirmDelete ? "var(--pink)" : "var(--hairline)"}`,
          }}
          aria-label="Eliminar proyecto"
        >
          {confirmDelete ? "Confirmar" : "Eliminar"}
        </button>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-muted">
        {label}
      </div>
      <div
        className="font-mono text-xs tracking-[0.08em] mt-0.5"
        style={{ color: color ?? "var(--ink)" }}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="grain rounded-design border border-dashed border-hairline p-12 text-center max-w-2xl mx-auto"
      style={{ background: "var(--paper)" }}
    >
      <div className="font-serif text-3xl font-medium mb-2">
        Aún no tienes proyectos
      </div>
      <p className="text-sm text-muted max-w-md mx-auto mb-6 leading-relaxed">
        Crea tu primer proyecto para empezar a definir fases, asignar
        entregables y colaborar con tu equipo.
      </p>
      <button onClick={onCreate} className="btn-cobalt">
        + Crear primer proyecto
      </button>
    </div>
  );
}
