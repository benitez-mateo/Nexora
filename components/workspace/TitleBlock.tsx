"use client";

import { ProgressRing } from "@/components/primitives/ProgressRing";
import { DateMono } from "@/components/primitives/DateMono";
import { DelayAlert } from "./DelayAlert";
import { useWorkspace } from "@/lib/workspace-context";

export function TitleBlock() {
  const { currentProject, totalProgress, steps } = useWorkspace();

  if (!currentProject) return null;

  const generalStatus = steps.some((s) => s.status === "delayed")
    ? "EN RIESGO"
    : steps.length > 0 && steps.every((s) => s.status === "completed")
      ? "FINALIZADO"
      : steps.length === 0
        ? "SIN FASES"
        : "EN PROCESO";

  const statusColor =
    generalStatus === "EN RIESGO" ? "var(--pink)" : "var(--cobalt)";

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start mb-12">
      <div>
        <h1
          className="font-serif font-medium leading-[0.95] tracking-[-0.02em] m-0 max-w-[900px] animate-rise"
          style={{ fontSize: "clamp(40px, 6.4vw, 96px)" }}
        >
          {currentProject.title}
          <span className="text-cobalt">.</span>
        </h1>
        <div
          className="flex flex-wrap gap-x-14 gap-y-4 mt-7 items-end"
          style={{
            animation: "rise 600ms cubic-bezier(.2,.8,.2,1) 60ms both",
          }}
        >
          <div>
            <div className="micro">Entrega Final</div>
            <div className="mt-1.5">
              <DateMono date={currentProject.finalDate} />
            </div>
          </div>
          <div>
            <div className="micro">Estado General</div>
            <div
              className="font-mono text-sm tracking-[0.08em] mt-1.5"
              style={{ color: statusColor }}
            >
              <span className="text-muted-2">[</span> {generalStatus}{" "}
              <span className="text-muted-2">]</span>
            </div>
          </div>
          <div>
            <div className="micro">Cliente</div>
            <div className="font-mono text-sm tracking-[0.08em] mt-1.5">
              {currentProject.client}
            </div>
          </div>
          <div>
            <div className="micro">Progreso Total</div>
            <div className="font-mono text-sm tracking-[0.08em] mt-1.5 text-cobalt">
              {totalProgress}%
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex gap-4 items-center"
        style={{
          animation: "rise 600ms cubic-bezier(.2,.8,.2,1) 120ms both",
        }}
      >
        <ProgressRing value={totalProgress} size={132} />
        <DelayAlert />
      </div>
    </section>
  );
}
