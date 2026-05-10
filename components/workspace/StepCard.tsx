"use client";

import { useEffect, useRef } from "react";
import { safeTo } from "@/lib/gsap";
import type { Step } from "@/lib/types";
import { progressOf } from "@/lib/types";
import { DateMono } from "@/components/primitives/DateMono";
import { StepStatusBadge } from "@/components/primitives/StepStatusBadge";
import { cn } from "@/lib/utils";

interface StepCardProps {
  step: Step;
  active: boolean;
  locked: boolean;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleDeliverable: (deliverableId: string) => void;
}

export function StepCard({
  step,
  active,
  locked,
  index,
  isFirst,
  isLast,
  onSelect,
  onComplete,
  onEdit,
  onMoveUp,
  onMoveDown,
  onToggleDeliverable,
}: StepCardProps) {
  const isCompleted = step.status === "completed";
  const isActive = step.status === "active";
  const isDelayed = step.status === "delayed";
  const isPending = step.status === "pending";

  const accent = isDelayed ? "var(--pink)" : "var(--cobalt)";
  const ringRef = useRef<SVGCircleElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const progress = progressOf(step);

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (!ringRef.current) return;
    safeTo(ringRef.current, {
      strokeDashoffset: targetOffset,
      duration: 0.9,
      ease: "power3.out",
    });
  }, [targetOffset]);

  useEffect(() => {
    if (!cardRef.current) return;
    safeTo(cardRef.current, {
      y: active ? -4 : 0,
      duration: 0.32,
      ease: "power3.out",
    });
  }, [active]);

  const canCheckDeliverables = isActive || isDelayed;

  return (
    <div
      ref={cardRef}
      onClick={() => !locked && onSelect()}
      className={cn(
        "group grain relative grow shrink basis-full sm:basis-[200px] min-w-0 sm:min-w-[240px] sm:max-w-[300px] rounded-design p-[22px] flex flex-col gap-4 transition-[box-shadow,border-color] duration-300",
        locked ? "cursor-not-allowed opacity-70" : "cursor-pointer",
      )}
      style={{
        background: "var(--paper)",
        border: `1px solid ${active ? accent : "var(--hairline)"}`,
        boxShadow: active
          ? isDelayed
            ? "var(--shadow-active-pink)"
            : "var(--shadow-active)"
          : "var(--shadow-sm)",
        animation: `rise 600ms cubic-bezier(.2,.8,.2,1) ${100 + index * 50}ms both`,
      }}
      onMouseEnter={(e) => {
        if (!active && !locked) {
          safeTo(e.currentTarget, {
            y: -2,
            duration: 0.22,
            ease: "power2.out",
          });
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          safeTo(e.currentTarget, {
            y: 0,
            duration: 0.22,
            ease: "power2.out",
          });
        }
      }}
      role="button"
      aria-disabled={locked}
      tabIndex={locked ? -1 : 0}
    >
      <div className="flex items-start justify-between">
        <span
          className="font-serif text-[32px] font-medium leading-none"
          style={{
            color: isActive || isDelayed ? accent : "var(--ink)",
          }}
        >
          {step.num}
        </span>
        {active && (
          <span
            className="absolute -top-2 left-[22px] text-white font-mono text-[9px] tracking-[0.16em] uppercase px-2 py-[3px] rounded-full"
            style={{ background: accent }}
          >
            Foco
          </span>
        )}

        <div
          className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <ToolBtn
            label="Subir fase"
            onClick={onMoveUp}
            disabled={isFirst}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </ToolBtn>
          <ToolBtn
            label="Bajar fase"
            onClick={onMoveDown}
            disabled={isLast}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </ToolBtn>
          <ToolBtn label="Editar fase" onClick={onEdit}>
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </ToolBtn>
        </div>
      </div>

      <div>
        <div className="font-serif text-[22px] font-medium leading-tight tracking-[-0.01em]">
          {step.title}
          {step.subtitle && (
            <>
              <br />
              {step.subtitle}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 items-start">
        {isActive && (
          <span
            className="font-mono text-[10.5px] tracking-[0.14em] uppercase"
            style={{ color: "var(--cobalt)" }}
          >
            En proceso
          </span>
        )}
        {isDelayed && (
          <span
            className="font-mono text-[10.5px] tracking-[0.14em] uppercase"
            style={{ color: "var(--pink)" }}
          >
            Retrasada
          </span>
        )}
        {isPending && (
          <span
            className="font-mono text-[10.5px] tracking-[0.14em] uppercase"
            style={{ color: "var(--muted)" }}
          >
            {locked ? "Bloqueada" : "Lista para iniciar"}
          </span>
        )}

        {isActive || isDelayed ? (
          <div className="relative w-[76px] h-[76px]">
            <svg width="76" height="76" className="-rotate-90">
              <circle
                cx="38"
                cy="38"
                r={radius}
                stroke="var(--hairline)"
                strokeWidth="3"
                fill="none"
              />
              <circle
                ref={ringRef}
                cx="38"
                cy="38"
                r={radius}
                stroke={accent}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <span
                className="font-serif text-lg font-medium"
                style={{ color: accent }}
              >
                {progress}%
              </span>
            </div>
          </div>
        ) : (
          <StepStatusBadge status={step.status} />
        )}

        {isCompleted && (
          <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-ink-2">
            Completado
          </span>
        )}
      </div>

      {step.deliverables.length > 0 && (
        <div className="border-t border-hairline-2 pt-3.5">
          <div className="micro mb-2 flex items-center justify-between">
            <span>Entregables</span>
            <span className="font-mono text-[9.5px] text-muted-2">
              {step.deliverables.filter((d) => d.done).length}/
              {step.deliverables.length}
            </span>
          </div>
          <ul className="flex flex-col gap-1.5 m-0 p-0 list-none">
            {step.deliverables.map((d) => (
              <li key={d.id} className="flex items-start gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canCheckDeliverables)
                      onToggleDeliverable(d.id);
                  }}
                  disabled={!canCheckDeliverables && !isCompleted}
                  aria-label={`${d.done ? "Desmarcar" : "Marcar"} ${d.text}`}
                  className={cn(
                    "shrink-0 w-[15px] h-[15px] rounded grid place-items-center mt-0.5 transition-colors",
                    canCheckDeliverables
                      ? "cursor-pointer"
                      : "cursor-default",
                  )}
                  style={{
                    background: d.done ? accent : "transparent",
                    border: `1.5px solid ${d.done ? accent : "var(--hairline)"}`,
                  }}
                >
                  {d.done && (
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
                </button>
                <span
                  className={cn(
                    "text-[12.5px] leading-snug",
                    d.done ? "line-through text-muted-2" : "text-ink-2",
                  )}
                >
                  {d.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-hairline-2 pt-3.5 mt-auto">
        <div className="micro mb-1.5">{step.dateLabel}</div>
        <DateMono
          date={step.date}
          color={isCompleted ? "var(--ink)" : accent}
        />
      </div>

      {active && (isActive || isDelayed) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          title="Marcar todos los entregables como hechos"
          aria-label="Marcar todos los entregables"
          className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full grid place-items-center text-white transition-transform"
          style={{
            background: accent,
            boxShadow: "0 4px 12px rgba(27,61,255,0.28)",
          }}
          onMouseEnter={(e) =>
            safeTo(e.currentTarget, {
              scale: 1.12,
              rotation: 8,
              duration: 0.2,
              ease: "power2.out",
            })
          }
          onMouseLeave={(e) =>
            safeTo(e.currentTarget, {
              scale: 1,
              rotation: 0,
              duration: 0.2,
              ease: "power2.out",
            })
          }
        >
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
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

function ToolBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="w-6 h-6 rounded-md grid place-items-center text-ink-2 hover:bg-paper-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-hairline-2"
      style={{ background: "var(--paper)" }}
    >
      {children}
    </button>
  );
}
