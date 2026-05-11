"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/primitives/Avatar";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace-context";
import type { ChatMessage } from "@/lib/types";

export function Message({ m }: { m: ChatMessage }) {
  const { user } = useAuth();
  const { editMessage, deleteMessage } = useWorkspace();

  // Detectamos "mío" preferentemente por userId (confiable). Si el mensaje es
  // viejo y no tiene userId, caemos a comparación por nombre.
  const mine = user
    ? m.userId
      ? m.userId === user.id
      : m.who === "You" || m.who === user.name
    : false;

  const displayName = mine ? user?.name ?? "Tú" : m.who;
  const avatarValue = m.avatar ?? (mine ? user?.avatar : undefined);

  const isAlert = m.alert;
  const isDeleted = Boolean(m.deletedAt);
  const isEdited = Boolean(m.editedAt) && !isDeleted;

  const [editing, setEditing] = useState(false);

  const handleEditSave = (newText: string) => {
    editMessage(m.id, newText);
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "group flex gap-2.5 items-start",
        mine ? "flex-row-reverse" : "flex-row",
      )}
    >
      <Avatar name={displayName} avatar={avatarValue} size="sm" />

      <div className="max-w-[240px] min-w-0">
        <div
          className={cn(
            "flex gap-2 items-baseline mb-1",
            mine ? "flex-row-reverse" : "flex-row",
          )}
        >
          <span className="font-semibold text-xs">{displayName}</span>
          <span className="font-mono text-[10px] text-muted tracking-[0.08em]">
            {m.time}
            {isEdited && (
              <span className="ml-1 italic opacity-80">· editado</span>
            )}
          </span>
        </div>

        {editing && !isDeleted ? (
          <EditBubble
            initial={m.text}
            onSave={handleEditSave}
            onCancel={() => setEditing(false)}
            mine={mine}
          />
        ) : (
          <BubbleRow mine={mine}>
            <Bubble
              isAlert={isAlert}
              mine={mine}
              isDeleted={isDeleted}
              text={m.text}
            />
            {mine && !isDeleted && (
              <MessageMenu
                onEdit={() => setEditing(true)}
                onDelete={() => deleteMessage(m.id)}
              />
            )}
          </BubbleRow>
        )}

        {!isDeleted && m.reacts && m.reacts.length > 0 && (
          <div
            className={cn(
              "flex gap-1.5 mt-1.5",
              mine ? "justify-end" : "justify-start",
            )}
          >
            {m.reacts.map((r, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-full border border-hairline-2"
                style={{ background: "var(--paper-2)" }}
              >
                {r.e} {r.n}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Subcomponentes
 * ------------------------------------------------------------------------ */

function BubbleRow({
  mine,
  children,
}: {
  mine: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        mine ? "flex-row-reverse" : "flex-row",
      )}
    >
      {children}
    </div>
  );
}

function Bubble({
  text,
  mine,
  isAlert,
  isDeleted,
}: {
  text: string;
  mine: boolean;
  isAlert?: boolean;
  isDeleted: boolean;
}) {
  if (isDeleted) {
    return (
      <div
        className="px-3.5 py-2.5 text-[13px] leading-snug rounded-[14px] flex items-center gap-1.5 italic"
        style={{
          background: "var(--paper-2)",
          color: "var(--muted)",
          border: "1px dashed var(--hairline)",
          borderTopRightRadius: mine ? 4 : 14,
          borderTopLeftRadius: mine ? 14 : 4,
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
        Mensaje eliminado
      </div>
    );
  }

  return (
    <div
      className="px-3.5 py-2.5 text-[13px] leading-snug rounded-[14px] whitespace-pre-wrap break-words"
      style={{
        background: isAlert
          ? "linear-gradient(135deg, #C8D7F7 0%, #7BA0F0 100%)"
          : mine
            ? "var(--cobalt)"
            : "var(--paper-2)",
        color: isAlert
          ? "rgb(15, 30, 90)"
          : mine
            ? "white"
            : "var(--ink)",
        border: mine || isAlert ? "0" : "1px solid var(--hairline-2)",
        borderTopRightRadius: mine ? 4 : 14,
        borderTopLeftRadius: mine ? 14 : 4,
        boxShadow: isAlert ? "0 6px 18px rgba(27,61,255,0.20)" : undefined,
        fontWeight: isAlert ? 500 : 400,
      }}
    >
      {text}
    </div>
  );
}

function MessageMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmDelete(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
          setConfirmDelete(false);
        }}
        aria-label="Opciones del mensaje"
        aria-expanded={open}
        className={cn(
          "w-6 h-6 rounded-full grid place-items-center text-muted transition-opacity",
          // Visible siempre en móvil/touch, hover-only en desktop.
          "md:opacity-0 md:group-hover:opacity-100 focus:opacity-100",
          open && "opacity-100",
        )}
        style={{ background: "var(--paper-2)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="grain absolute top-7 right-0 min-w-[160px] p-1 rounded-xl border border-hairline z-50"
          style={{
            background: "var(--paper)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <button
            role="menuitem"
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-paper-2 transition-colors flex items-center gap-2 text-[13px]"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
            Editar
          </button>
          <button
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              if (!confirmDelete) {
                setConfirmDelete(true);
                return;
              }
              onDelete();
              setOpen(false);
              setConfirmDelete(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-paper-2 transition-colors flex items-center gap-2 text-[13px]"
            style={{
              color: "var(--pink)",
              background: confirmDelete ? "var(--pink-soft)" : undefined,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
            {confirmDelete ? "Confirmar" : "Eliminar"}
          </button>
        </div>
      )}
    </div>
  );
}

function EditBubble({
  initial,
  onSave,
  onCancel,
  mine,
}: {
  initial: string;
  onSave: (text: string) => void;
  onCancel: () => void;
  mine: boolean;
}) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.setSelectionRange(value.length, value.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === initial.trim()) {
      onCancel();
      return;
    }
    onSave(trimmed);
  };

  return (
    <div
      className="px-3 py-2 rounded-[14px] flex flex-col gap-2"
      style={{
        background: "var(--paper-2)",
        border: "1px solid var(--cobalt)",
        borderTopRightRadius: mine ? 4 : 14,
        borderTopLeftRadius: mine ? 14 : 4,
      }}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        rows={Math.min(4, Math.max(1, value.split("\n").length))}
        className="w-full bg-transparent border-0 outline-0 text-[13px] leading-snug resize-none"
        style={{ color: "var(--ink)" }}
      />
      <div className="flex justify-end gap-1">
        <button
          onClick={onCancel}
          className="font-mono text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-md text-muted hover:bg-paper transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={submit}
          className="font-mono text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-md text-white"
          style={{ background: "var(--cobalt)" }}
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

