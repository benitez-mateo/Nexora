interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-6 animate-rise">
      <div className="max-w-2xl">
        <div className="micro mb-3">{eyebrow}</div>
        <h1
          className="font-serif font-medium leading-[1.02] tracking-[-0.02em] m-0"
          style={{ fontSize: "clamp(36px, 5.2vw, 64px)" }}
        >
          {title}
          <span className="text-cobalt">.</span>
        </h1>
        {description && (
          <p className="mt-4 text-[15px] text-muted leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
