export function NexoraLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-9 h-9 rounded-[10px] grid place-items-center border border-hairline font-serif font-bold italic text-2xl leading-none text-ink"
        style={{ background: "var(--paper-2)" }}
      >
        N
      </div>
      <div className="leading-tight">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink">
          Nexora
        </div>
        <div className="font-mono text-[9px] tracking-[0.32em] uppercase text-muted">
          Workspace
        </div>
      </div>
    </div>
  );
}
