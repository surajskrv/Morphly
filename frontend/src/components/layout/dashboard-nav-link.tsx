"use client";

import { forwardRef, useEffect, useTransition, type ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface DashboardNavLinkProps {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  variant?: "top" | "compact";
}

function isNavItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isModifiedEvent(event: React.MouseEvent<HTMLButtonElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

export const DashboardNavLink = forwardRef<HTMLButtonElement, DashboardNavLinkProps>(
  function DashboardNavLink({ href, label, icon: Icon, variant = "top" }, ref) {
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const active = isNavItemActive(pathname, href);
    const compact = variant === "compact";

    useEffect(() => {
      router.prefetch(href);
    }, [href, router]);

    return (
      <button
        ref={ref}
        type="button"
        onClick={(event) => {
          if (active || isModifiedEvent(event)) return;
          startTransition(() => {
            router.push(href);
          });
        }}
        className={cn(
          "relative z-10 inline-flex items-center justify-center font-semibold whitespace-nowrap transition-[color,background-color,transform,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          compact
            ? cn(
                "gap-1.5 rounded-xl px-3 py-2 text-xs",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )
            : cn(
                "h-10 min-w-max gap-2 rounded-full px-3 text-xs sm:px-4.5 sm:text-sm",
                active
                  ? "text-white [text-shadow:0_1px_0_rgba(0,0,0,0.16)]"
                  : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                isPending && !active ? "text-foreground" : ""
              )
        )}
        aria-current={active ? "page" : undefined}
        aria-label={label}
        data-active={active ? "true" : "false"}
        data-nav-href={href}
      >
        <Icon className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4 shrink-0 text-current/85 sm:hidden")} />
        {compact ? <span>{label}</span> : <span className="hidden sm:inline">{label}</span>}
        {isPending && !active ? (
          <span className="absolute right-2 top-2 h-1.5 w-1.5 animate-pulse rounded-full bg-primary/80 sm:right-3 sm:top-1/2 sm:-translate-y-1/2" />
        ) : null}
      </button>
    );
  }
);
