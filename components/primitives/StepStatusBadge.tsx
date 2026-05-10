import type { StepStatus } from "@/lib/types";

const SIZE = "w-9 h-9";

export function StepStatusBadge({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return (
      <div
        className={`${SIZE} rounded-full grid place-items-center bg-paper border-[1.5px] border-ink-2`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path className="draw-check" d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      </div>
    );
  }
  if (status === "active") {
    return (
      <div
        className={`${SIZE} rounded-full grid place-items-center border-[1.5px] border-cobalt`}
        style={{ background: "var(--cobalt-soft)", color: "var(--cobalt)" }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full animate-pulse"
          style={{ background: "var(--cobalt)" }}
        />
      </div>
    );
  }
  if (status === "delayed") {
    return (
      <div
        className={`${SIZE} rounded-full grid place-items-center border-[1.5px] border-pink`}
        style={{ background: "var(--pink-soft)", color: "var(--pink)" }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
    );
  }
  return (
    <div
      className={`${SIZE} rounded-full border-[1.5px] border-dashed border-muted-2 bg-transparent`}
    />
  );
}
