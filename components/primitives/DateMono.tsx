interface DateMonoProps {
  date: string;
  color?: string;
}

export function DateMono({ date, color = "var(--cobalt-ink)" }: DateMonoProps) {
  const parts = date.split("/");
  const valid = parts.length === 3 && parts.every((p) => p.trim().length > 0);

  if (!valid) {
    return (
      <span
        className="font-mono text-sm tracking-[0.08em]"
        style={{ color }}
      >
        {date || "—"}
      </span>
    );
  }

  const [d, m, y] = parts;
  return (
    <span className="font-mono text-sm tracking-[0.08em]" style={{ color }}>
      {d} <span className="text-muted-2">/</span> {m}{" "}
      <span className="text-muted-2">/</span> {y}
    </span>
  );
}
