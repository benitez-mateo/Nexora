"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/primitives/Avatar";
import { safeFromTo, safeTo } from "@/lib/gsap";
import { formatBytes, MAX_FILE_SIZE } from "@/lib/supabase/storage";
import { useMediaQuery, BREAKPOINT } from "@/lib/use-media-query";
import { useWorkspace } from "@/lib/workspace-context";
import { Message } from "./Message";

export function ChatPanel() {
  const {
    chatOpen,
    setChatOpen,
    messages,
    typing,
    sendMessage,
    broadcastDelayAlert,
    showToast,
    remote,
  } = useWorkspace();

  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mounted = useRef(false);
  const isDesktop = useMediaQuery(BREAKPOINT.lg);

  useEffect(() => {
    if (!panelRef.current) return;
    if (chatOpen) {
      safeFromTo(
        panelRef.current,
        { x: isDesktop ? 40 : 0, y: isDesktop ? 0 : 24, opacity: 0 },
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.42,
          ease: "power3.out",
        },
      );
    } else if (mounted.current) {
      safeTo(panelRef.current, {
        x: isDesktop ? 40 : 0,
        y: isDesktop ? 0 : 24,
        opacity: 0,
        duration: 0.28,
        ease: "power2.in",
      });
    }
    mounted.current = true;
  }, [chatOpen, isDesktop]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing, chatOpen]);

  if (!chatOpen) return null;

  const handleSend = async () => {
    if (sending) return;
    if (!draft.trim() && pendingFiles.length === 0) return;
    const text = draft;
    const files = pendingFiles;
    setDraft("");
    setPendingFiles([]);
    setSending(true);
    try {
      await sendMessage(text, files);
    } finally {
      setSending(false);
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    if (!remote) {
      showToast("Conecta Supabase para subir archivos al chat.");
      e.target.value = "";
      return;
    }

    const accepted: File[] = [];
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        showToast(`"${f.name}" supera 25 MB y no se puede subir.`);
        continue;
      }
      accepted.push(f);
    }
    setPendingFiles((prev) => [...prev, ...accepted]);
    // Reset para que el mismo archivo se pueda seleccionar de nuevo si lo quitas.
    e.target.value = "";
  };

  const removePendingFile = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <>
      {!isDesktop && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setChatOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        ref={panelRef}
        className={
          isDesktop
            ? "grain fixed right-6 top-24 bottom-6 w-[360px] border border-hairline rounded-[18px] overflow-hidden flex flex-col z-40"
            : "grain fixed left-0 right-0 bottom-0 top-16 border-t border-hairline rounded-t-[18px] overflow-hidden flex flex-col z-40"
        }
        style={{
          background: "var(--paper)",
          boxShadow: "var(--shadow-lg)",
          paddingBottom: isDesktop ? undefined : "env(safe-area-inset-bottom)",
        }}
        aria-label="Chat del proyecto"
        role="dialog"
      >
      <header className="px-[18px] py-4 border-b border-hairline-2 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-medium tracking-[-0.01em]">
              Chat del Proyecto
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--cobalt)" }}
            />
          </div>
          <div className="font-mono text-[10.5px] text-muted mt-1 tracking-[0.14em] uppercase">
            {messages.length === 0
              ? "Sin mensajes"
              : `${new Set(messages.map((m) => m.who)).size} participantes`}
          </div>
        </div>
        <div className="flex gap-1">
          <IconBtn label="Buscar">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </IconBtn>
          <IconBtn label="Más">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </IconBtn>
          <IconBtn label="Cerrar" onClick={() => setChatOpen(false)}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </IconBtn>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="scroll flex-1 overflow-y-auto px-[18px] py-4 flex flex-col gap-4"
      >
        {messages.length === 0 && !typing && (
          <div className="text-center text-muted text-sm py-8">
            <p className="font-serif text-base mb-1">Aún no hay mensajes.</p>
            <p className="font-mono text-[10.5px] tracking-[0.14em] uppercase">
              Inicia la conversación abajo
            </p>
          </div>
        )}
        {messages.map((m) => (
          <Message key={m.id} m={m} />
        ))}
        {typing && (
          <div className="flex gap-2.5 items-center">
            <Avatar name="Sistema" size="sm" />
            <div
              className="px-3.5 py-2.5 inline-flex gap-1 rounded-[14px] border border-hairline-2"
              style={{
                background: "var(--paper-2)",
                borderTopLeftRadius: 4,
              }}
            >
              <Dot delay={0} />
              <Dot delay={0.18} />
              <Dot delay={0.36} />
            </div>
          </div>
        )}
      </div>

      <div className="px-3.5 py-2 flex gap-1.5 border-t border-hairline-2 flex-wrap">
        <button
          onClick={broadcastDelayAlert}
          className="btn-ghost"
          style={{
            borderColor: "var(--pink)",
            color: "var(--pink)",
            fontSize: "9.5px",
          }}
        >
          Enviar aviso de retraso
        </button>
        <button
          onClick={() => setDraft("Reunión a las 16:00 ✅ ")}
          className="btn-ghost"
          style={{ fontSize: "9.5px" }}
        >
          Convocar reunión
        </button>
      </div>

      <div className="p-3 border-t border-hairline-2">
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {pendingFiles.map((f, i) => (
              <PendingFileChip
                key={`${f.name}-${i}`}
                file={f}
                onRemove={() => removePendingFile(i)}
              />
            ))}
          </div>
        )}
        <div
          className="flex items-center gap-2 rounded-full pl-4 pr-2 py-1.5 border border-hairline"
          style={{ background: "var(--paper-2)" }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              sending ? "Subiendo…" : "Escribe un mensaje…"
            }
            disabled={sending}
            className="flex-1 border-0 outline-0 bg-transparent text-ink font-sans text-[13px] py-2 disabled:opacity-60"
            aria-label="Mensaje"
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFilePick}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
          />
          <IconBtn
            label="Adjuntar archivo"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.5L12.5 21a5 5 0 0 1-7-7l9-9a3.5 3.5 0 1 1 5 5l-9 9a2 2 0 0 1-3-3l8-8" />
            </svg>
          </IconBtn>
          <button
            onClick={handleSend}
            disabled={
              sending || (!draft.trim() && pendingFiles.length === 0)
            }
            title="Enviar"
            aria-label="Enviar"
            className="w-[34px] h-[34px] rounded-full grid place-items-center text-white transition-transform hover:-translate-y-0.5 hover:-rotate-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:rotate-0"
            style={{
              background: "var(--cobalt)",
              boxShadow: "0 4px 12px rgba(27,61,255,0.28)",
            }}
          >
            {sending ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.2-8.55" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="w-[30px] h-[30px] rounded-full grid place-items-center text-ink-2 transition-colors hover:bg-paper-2"
    >
      {children}
    </button>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full animate-blink"
      style={{
        background: "var(--muted)",
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function PendingFileChip({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  return (
    <div
      className="flex items-center gap-1.5 rounded-full pl-2 pr-1 py-1 border border-hairline max-w-full"
      style={{ background: "var(--paper-2)" }}
    >
      <span
        className="w-5 h-5 rounded grid place-items-center shrink-0"
        style={{ background: "var(--cobalt-soft)", color: "var(--cobalt)" }}
        aria-hidden
      >
        {isImage ? (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        ) : isVideo ? (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
        )}
      </span>
      <span
        className="text-[11px] truncate max-w-[140px]"
        title={file.name}
      >
        {file.name}
      </span>
      <span className="font-mono text-[9px] text-muted shrink-0">
        {formatBytes(file.size)}
      </span>
      <button
        onClick={onRemove}
        aria-label={`Quitar ${file.name}`}
        className="w-5 h-5 rounded-full grid place-items-center text-muted hover:bg-paper transition-colors shrink-0"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
