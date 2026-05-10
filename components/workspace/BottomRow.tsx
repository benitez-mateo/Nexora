"use client";

import { Avatar } from "@/components/primitives/Avatar";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/workspace-context";

function Activity() {
  const { messages } = useWorkspace();
  const recent = [...messages].slice(-5).reverse();

  return (
    <div className="animate-rise">
      <div className="micro mb-4">Actividad reciente</div>
      {recent.length === 0 ? (
        <p className="text-muted text-[13px]">
          Aún no hay actividad. Envía un mensaje en el chat o marca un
          entregable como completado.
        </p>
      ) : (
        <ul className="m-0 p-0 list-none flex flex-col gap-3.5">
          {recent.map((m) => (
            <li key={m.id} className="flex gap-3 items-start">
              <Avatar name={m.who} size="sm" />
              <div className="flex-1 text-[13px] leading-snug">
                <span className="font-semibold">{m.who}</span>{" "}
                <span className="text-ink-2">
                  {m.alert ? "difundió una alerta" : "envió un mensaje"}
                </span>
                <div className="font-mono text-[10px] text-muted mt-1 tracking-[0.1em]">
                  {m.time}
                </div>
              </div>
              <span
                className="w-1.5 h-1.5 rounded-full mt-2"
                style={{
                  background: m.alert ? "var(--pink)" : "var(--cobalt)",
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Metrics() {
  const { steps, totalProgress } = useWorkspace();
  const completed = steps.filter((s) => s.status === "completed").length;
  const totalDelivs = steps.reduce((sum, s) => sum + s.deliverables.length, 0);
  const doneDelivs = steps.reduce(
    (sum, s) => sum + s.deliverables.filter((d) => d.done).length,
    0,
  );

  return (
    <div className="animate-rise-1">
      <div className="micro mb-4">Métricas clave</div>
      <div className="flex flex-col gap-4">
        <div>
          <div className="micro text-[9.5px]">Progreso total</div>
          <div className="mt-1 font-mono text-[26px] tracking-[0.04em]">
            {totalProgress}
            <span className="text-muted-2">%</span>
          </div>
        </div>
        <div>
          <div className="micro text-[9.5px]">Fases completadas</div>
          <div className="mt-1 font-mono text-[26px] tracking-[0.04em]">
            {completed} <span className="text-muted-2">/</span> {steps.length}
          </div>
        </div>
        <div>
          <div className="micro text-[9.5px]">Entregables</div>
          <div className="mt-1 font-mono text-[26px] tracking-[0.04em]">
            {doneDelivs} <span className="text-muted-2">/</span> {totalDelivs}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusByPhase() {
  const { steps } = useWorkspace();

  return (
    <div className="animate-rise-2">
      <div className="micro mb-4">Estado por fase</div>
      {steps.length === 0 ? (
        <p className="text-muted text-[13px]">
          Aún no hay fases. Añade una desde el botón "+ Añadir fase".
        </p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {steps.slice(0, 6).map((s) => {
            const total = s.deliverables.length;
            const done = s.deliverables.filter((d) => d.done).length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            const color =
              s.status === "delayed"
                ? "var(--pink)"
                : s.status === "completed"
                  ? "var(--ink-2)"
                  : "var(--cobalt)";
            return (
              <div
                key={s.id}
                className="grid items-center gap-3.5"
                style={{ gridTemplateColumns: "minmax(80px,140px) 1fr 44px" }}
              >
                <div className="text-[13px] truncate">
                  {s.num} · {s.title}
                </div>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: "var(--hairline)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: color,
                      transition: "width 800ms cubic-bezier(.2,.8,.2,1)",
                    }}
                  />
                </div>
                <div className="font-mono text-[11px] text-muted text-right tracking-[0.06em]">
                  {pct}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function BottomRow() {
  const { user } = useAuth();
  return (
    <section className="grid gap-10 lg:gap-12 pt-6 border-t border-hairline grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.1fr_0.8fr_1.1fr]">
      <Activity />
      <Metrics />
      <StatusByPhase />
      {/* user prop kept for potential future activity attribution */}
      {user && <span className="hidden" aria-hidden />}
    </section>
  );
}
