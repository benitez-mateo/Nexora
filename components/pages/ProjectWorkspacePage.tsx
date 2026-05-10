"use client";

import Link from "next/link";
import { Workspace } from "@/components/workspace/Workspace";
import { useWorkspace } from "@/lib/workspace-context";

export function ProjectWorkspacePage() {
  const { currentProject, hydrated } = useWorkspace();

  if (!hydrated) {
    return <div className="min-h-[40vh]" aria-busy="true" />;
  }

  if (!currentProject) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <div
          className="grain rounded-design border border-hairline p-8 text-center max-w-md"
          style={{ background: "var(--paper)" }}
        >
          <div className="micro mb-2">404</div>
          <h2 className="font-serif text-2xl font-medium mb-2">
            Proyecto no encontrado
          </h2>
          <p className="text-sm text-muted leading-relaxed mb-5">
            El proyecto que buscas no existe o fue eliminado.
          </p>
          <Link href="/proyectos" className="btn-cobalt inline-flex">
            Volver a Proyectos
          </Link>
        </div>
      </div>
    );
  }

  return <Workspace />;
}
