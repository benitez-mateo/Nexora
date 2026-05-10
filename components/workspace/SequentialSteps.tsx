"use client";

import { useEffect, useRef, useState } from "react";
import { safeFromTo } from "@/lib/gsap";
import type { Step } from "@/lib/types";
import { useWorkspace } from "@/lib/workspace-context";
import { StepCard } from "./StepCard";
import { StepEditor } from "./StepEditor";

interface EditorState {
  open: boolean;
  step: Step | null;
  insertAfter: number | null;
}

export function SequentialSteps() {
  const {
    steps,
    activeStepId,
    selectStep,
    completeStep,
    moveStep,
    toggleDeliverable,
  } = useWorkspace();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [editor, setEditor] = useState<EditorState>({
    open: false,
    step: null,
    insertAfter: null,
  });

  useEffect(() => {
    if (!trackRef.current || activeStepId == null) return;
    const card = trackRef.current.querySelector<HTMLElement>(
      `[data-step-id="${activeStepId}"]`,
    );
    if (!card) return;
    safeFromTo(
      card,
      { scale: 0.98 },
      { scale: 1, duration: 0.32, ease: "back.out(1.6)" },
    );
  }, [activeStepId]);

  const lastCompletedIdx = steps.reduce(
    (acc, step, idx) => (step.status === "completed" ? idx : acc),
    -1,
  );
  const focusIdx = steps.findIndex(
    (step) => step.status === "active" || step.status === "delayed",
  );

  return (
    <section className="mb-14">
      <div className="flex items-center gap-3.5 mb-5 animate-rise flex-wrap">
        <span className="micro">Procesamiento Secuencial</span>
        <span className="flex-1 h-px bg-hairline min-w-[20px]" />
        <span className="font-mono text-[10.5px] text-muted tracking-[0.14em] uppercase">
          {steps.length} {steps.length === 1 ? "Fase" : "Fases"}
        </span>
        <button
          onClick={() =>
            setEditor({ open: true, step: null, insertAfter: null })
          }
          className="btn-cobalt"
          style={{ padding: "8px 14px", fontSize: "10.5px" }}
        >
          + Añadir fase
        </button>
      </div>

      {steps.length === 0 ? (
        <EmptyState
          onAdd={() =>
            setEditor({ open: true, step: null, insertAfter: null })
          }
        />
      ) : (
        <div
          ref={trackRef}
          className="flex items-stretch gap-2 overflow-x-auto pb-2 scroll"
        >
          {steps.map((s, i) => {
            const isLockedPending =
              s.status === "pending" &&
              (focusIdx !== -1 ? i > focusIdx : i > lastCompletedIdx + 1);

            return (
              <div
                key={s.id}
                data-step-id={s.id}
                className="flex items-stretch shrink-0"
              >
                <StepCard
                  step={s}
                  active={activeStepId === s.id}
                  locked={isLockedPending}
                  index={i}
                  isFirst={i === 0}
                  isLast={i === steps.length - 1}
                  onSelect={() => selectStep(s.id)}
                  onComplete={() => completeStep(s.id)}
                  onEdit={() =>
                    setEditor({ open: true, step: s, insertAfter: null })
                  }
                  onMoveUp={() => moveStep(s.id, "up")}
                  onMoveDown={() => moveStep(s.id, "down")}
                  onToggleDeliverable={(did) => toggleDeliverable(s.id, did)}
                />
                {i < steps.length - 1 && (
                  <div className="grid place-items-center px-1 text-muted-2 shrink-0">
                    <svg
                      width="22"
                      height="14"
                      viewBox="0 0 22 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M0 7h20M14 1l6 6-6 6" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <StepEditor
        open={editor.open}
        onClose={() =>
          setEditor({ open: false, step: null, insertAfter: null })
        }
        step={editor.step}
        insertAfter={editor.insertAfter}
      />
    </section>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      className="grain rounded-design border border-dashed border-hairline p-10 text-center"
      style={{ background: "var(--paper)" }}
    >
      <div className="font-serif text-2xl font-medium mb-2">
        Aún no hay fases en el plan
      </div>
      <p className="text-sm text-muted max-w-md mx-auto mb-5">
        Define el paso a paso de tu proyecto. Cada fase debe completarse antes
        de habilitar la siguiente.
      </p>
      <button onClick={onAdd} className="btn-cobalt">
        + Crear primera fase
      </button>
    </div>
  );
}
