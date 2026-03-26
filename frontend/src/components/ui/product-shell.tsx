import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "surface-panel surface-grid relative overflow-hidden rounded-[1.6rem] border border-border/70 px-4 py-5 sm:rounded-[2rem] sm:px-7 sm:py-7",
        className
      )}
    >
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          {eyebrow ? <div>{eyebrow}</div> : null}
          <div className="space-y-2">
            <h1 className="text-balance text-[1.7rem] font-semibold tracking-tight text-foreground sm:text-[2rem]">
              {title}
            </h1>
            {description ? (
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">{actions}</div> : null}
      </div>
    </section>
  );
}

export function SectionEyebrow({
  icon: Icon,
  label,
  className,
}: {
  icon?: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm sm:text-[11px] sm:tracking-[0.2em]",
        className
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 text-primary" /> : null}
      <span>{label}</span>
    </div>
  );
}

export function SurfaceCard({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "surface-card rounded-[1.75rem] border border-border/70 bg-card/96 p-5 sm:p-6",
        className
      )}
      {...props}
    />
  );
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function MetricTile({
  icon: Icon,
  label,
  value,
  detail,
  tone = "default",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  tone?: "default" | "success" | "attention";
  className?: string;
}) {
  return (
    <div className={cn("surface-subtle rounded-[1.5rem] border border-border/70 p-4 sm:p-5", className)}>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-2xl border",
            tone === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : tone === "attention"
                ? "border-amber-100 bg-amber-50 text-amber-700"
                : "border-primary/10 bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span>{label}</span>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{value}</div>
      {detail ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

export function ActionPanel({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("surface-subtle rounded-[1.5rem] border border-border/70 p-4 sm:p-5", className)}>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "default",
  icon: Icon,
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "attention" | "info";
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
        tone === "success"
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : tone === "attention"
            ? "border-amber-100 bg-amber-50 text-amber-700"
            : tone === "info"
              ? "border-sky-100 bg-sky-50 text-sky-700"
              : "border-primary/10 bg-primary/10 text-primary",
        className
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
  className,
}: {
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "surface-subtle flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/80 px-4 py-8 text-center sm:rounded-[1.75rem] sm:px-5 sm:py-10",
        className
      )}
    >
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div> : null}
    </div>
  );
}

export function InfoCallout({
  title,
  description,
  tone = "default",
  className,
}: {
  title: string;
  description: React.ReactNode;
  tone?: "default" | "success" | "attention";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[1.5rem] border px-4 py-4",
        tone === "success"
          ? "border-emerald-100 bg-emerald-50/70"
          : tone === "attention"
            ? "border-amber-100 bg-amber-50/75"
            : "border-border/70 bg-muted/40",
        className
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border bg-background sm:h-9 sm:w-9 sm:rounded-2xl",
          tone === "success"
            ? "border-emerald-100 text-emerald-700"
            : tone === "attention"
              ? "border-amber-100 text-amber-700"
              : "border-border/60 text-primary"
        )}
      >
        <CheckCircle2 className="h-4.5 w-4.5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function FilterChips<T extends string>({
  items,
  selected,
  onSelect,
  className,
}: {
  items: ReadonlyArray<{ label: string; value: T }>;
  selected: T;
  onSelect: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {items.map((item) => {
        const active = item.value === selected;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onSelect(item.value)}
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-200",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border/70 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
            aria-pressed={active}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function WorkspacePane({
  title,
  description,
  headerAction,
  className,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("surface-card rounded-[1.75rem] border border-border/70 bg-card/96 p-5 sm:p-6", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
