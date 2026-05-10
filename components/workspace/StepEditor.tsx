"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/primitives/Modal";
import type { Step } from "@/lib/types";
import {
  useWorkspace,
  type DeliverableDraft,
  type StepDraft,
} from "@/lib/workspace-context";

interface StepEditorProps {
  open: boolean;
  onClose: () => void;
  step: Step | null;
  insertAfter: number | null;
}

const DATE_LABELS = [
  "Est. Inicio",
  "Est. Finalización",
  "Completado el",
  "Hito",
];

function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

const blankDraft = (): StepDraft => ({
  title: "",
  subtitle: "",
  date: "",
  dateLabel: "Est. Inicio",
  deliverables: [{ text: "" }],
});

export function StepEditor({
  open,
  onClose,
  step,
  insertAfter,
}: StepEditorProps) {
  const { addStep, updateStep, removeStep } = useWorkspace();
  const [draft, setDraft] = useState<StepDraft>(blankDraft);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isEditing = step !== null;

  useEffect(() => {
    if (!open) return;
    setConfirmDelete(false);
    if (step) {
      setDraft({
        title: step.title,
        subtitle: step.subtitle ?? "",
        date: step.date,
        dateLabel: step.dateLabel,
        deliverables:
          step.deliverables.length > 0
            ? step.deliverables.map((d) => ({
                id: d.id,
                text: d.text,
                done: d.done,
              }))
            : [{ text: "" }],
      });
    } else {
      setDraft(blankDraft());
    }
  }, [open, step]);

  const updateDeliverable = (idx: number, value: string) => {
    setDraft((d) => ({
      ...d,
      deliverables: d.deliverables.map((it, i) =>
        i === idx ? { ...it, text: value } : it,
      ),
    }));
  };

  const addDeliverable = () => {
    setDraft((d) => ({
      ...d,
      deliverables: [...d.deliverables, { text: "" }],
    }));
  };

  const removeDeliverable = (idx: number) => {
    setDraft((d) => ({
      ...d,
      deliverables: d.deliverables.filter((_, i) => i !== idx),
    }));
  };

  const submit = () => {
    if (!draft.title.trim()) return;
    if (isEditing && step) {
      updateStep(step.id, draft);
    } else {
      addStep(draft, insertAfter);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!step) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    removeStep(step.id);
    onClose();
  };

  const footer = (
    <>
      <div>
        {isEditing && (
          <button
            onClick={handleDelete}
            className="px-3 py-2 rounded-lg font-mono text-[10.5px] tracking-[0.14em] uppercase transition-colors"
            style={{
              color: "var(--pink)",
              background: confirmDelete ? "var(--pink-soft)" : "transparent",
              border: `1px solid ${confirmDelete ? "var(--pink)" : "var(--hairline)"}`,
            }}
          >
            {confirmDelete ? "Confirmar eliminar" : "Eliminar fase"}
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="btn-ghost">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={!draft.title.trim()}
          className="btn-cobalt disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditing ? "Guardar" : "Crear fase"}
        </button>
      </div>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar fase" : "Nueva fase"}
      footer={footer}
      maxWidth={560}
    >
      <div className="flex flex-col gap-5">
        <Field label="Título *">
          <input
            value={draft.title}
            onChange={(e) =>
              setDraft((d) => ({ ...d, title: e.target.value }))
            }
            placeholder="Ej. Investigación"
            className="input-base font-serif text-lg"
            autoFocus
          />
        </Field>

        <Field label="Subtítulo (opcional)">
          <input
            value={draft.subtitle ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, subtitle: e.target.value }))
            }
            placeholder="Ej. y Análisis"
            className="input-base font-serif text-lg"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4">
          <Field label="Fecha (DD/MM/AAAA)">
            <input
              value={draft.date}
              onChange={(e) =>
                setDraft((d) => ({ ...d, date: formatDateInput(e.target.value) }))
              }
              placeholder="30/05/2024"
              inputMode="numeric"
              maxLength={10}
              className="input-base font-mono"
            />
          </Field>
          <Field label="Etiqueta de fecha">
            <select
              value={draft.dateLabel}
              onChange={(e) =>
                setDraft((d) => ({ ...d, dateLabel: e.target.value }))
              }
              className="input-base font-mono text-xs uppercase tracking-[0.14em]"
            >
              {DATE_LABELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Entregables (informes que definen el % de la fase)">
          <div className="flex flex-col gap-2">
            {draft.deliverables.map((d, i) => (
              <DeliverableRow
                key={d.id ?? `new-${i}`}
                deliverable={d}
                onChange={(value) => updateDeliverable(i, value)}
                onRemove={
                  draft.deliverables.length > 1
                    ? () => removeDeliverable(i)
                    : undefined
                }
              />
            ))}
            <button
              onClick={addDeliverable}
              className="self-start font-mono text-[10.5px] tracking-[0.14em] uppercase text-cobalt hover:underline"
            >
              + Añadir entregable
            </button>
          </div>
          <p className="text-[11px] text-muted mt-1.5">
            Cada entregable marcado contribuye el mismo % al avance de la fase.
            Cuando todos están marcados, la fase pasa a completada.
          </p>
        </Field>

        {!isEditing && (
          <p className="text-xs text-muted leading-relaxed">
            La fase se crea como{" "}
            <span className="font-mono">PENDIENTE</span> y se desbloquea
            automáticamente cuando todas las anteriores estén completadas.
          </p>
        )}
      </div>

      <style jsx>{`
        :global(.input-base) {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid var(--hairline);
          background: var(--paper-2);
          color: var(--ink);
          font-family: var(--font-sans);
          font-size: 14px;
          outline: none;
          transition: border-color 200ms, box-shadow 200ms;
        }
        :global(.input-base:focus) {
          border-color: var(--cobalt);
          box-shadow: 0 0 0 3px var(--cobalt-soft);
        }
      `}</style>
    </Modal>
  );
}

function DeliverableRow({
  deliverable,
  onChange,
  onRemove,
}: {
  deliverable: DeliverableDraft;
  onChange: (value: string) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      {deliverable.done !== undefined && (
        <span
          title={deliverable.done ? "Entregado" : "Pendiente"}
          className="shrink-0 w-[15px] h-[15px] rounded grid place-items-center"
          style={{
            background: deliverable.done ? "var(--cobalt)" : "transparent",
            border: `1.5px solid ${deliverable.done ? "var(--cobalt)" : "var(--hairline)"}`,
          }}
        >
          {deliverable.done && (
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.5l4.5 4.5L19 7" />
            </svg>
          )}
        </span>
      )}
      <input
        value={deliverable.text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nombre del entregable"
        className="input-base flex-1"
      />
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label="Quitar entregable"
          className="w-9 h-9 rounded-lg grid place-items-center border border-hairline text-ink-2 hover:bg-paper-2 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="micro">{label}</span>
      {children}
    </label>
  );
}
