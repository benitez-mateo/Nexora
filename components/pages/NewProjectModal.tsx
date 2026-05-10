"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "@/components/primitives/Modal";
import { useWorkspace } from "@/lib/workspace-context";

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
}

function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function NewProjectModal({ open, onClose }: NewProjectModalProps) {
  const { addProject } = useWorkspace();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setClient("");
    setFinalDate("");
    setError(null);
  }, [open]);

  const submit = () => {
    if (!title.trim()) {
      setError("Dale un título al proyecto.");
      return;
    }
    if (!client.trim()) {
      setError("Indica el cliente del proyecto.");
      return;
    }
    const id = addProject({ title, client, finalDate });
    onClose();
    router.push(`/proyectos/${id}`);
  };

  const footer = (
    <>
      <div />
      <div className="flex gap-2">
        <button onClick={onClose} className="btn-ghost">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={!title.trim() || !client.trim()}
          className="btn-cobalt disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Crear proyecto
        </button>
      </div>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo proyecto"
      footer={footer}
      maxWidth={520}
    >
      <div className="flex flex-col gap-5">
        <Field label="Título del proyecto *">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Plataforma E-commerce"
            className="field-input font-serif text-lg"
            autoFocus
          />
        </Field>

        <Field label="Cliente *">
          <input
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Ej. Acme Corp."
            className="field-input"
          />
        </Field>

        <Field label="Fecha de entrega final">
          <input
            value={finalDate}
            onChange={(e) => setFinalDate(formatDateInput(e.target.value))}
            placeholder="DD/MM/AAAA"
            inputMode="numeric"
            maxLength={10}
            className="field-input font-mono"
          />
        </Field>

        {error && (
          <div
            role="alert"
            className="text-sm py-2 px-3 rounded-lg"
            style={{
              background: "var(--pink-soft)",
              color: "var(--pink)",
              border: "1px solid var(--pink)",
            }}
          >
            {error}
          </div>
        )}

        <p className="text-[11px] text-muted leading-relaxed">
          El proyecto se crea sin fases. Podrás añadirlas, editarlas y
          reordenarlas dentro del workspace del proyecto.
        </p>
      </div>
    </Modal>
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
