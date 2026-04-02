"use client";

import { forwardRef, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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



export const DashboardNavLink = forwardRef<HTMLAnchorElement, DashboardNavLinkProps>(
  function DashboardNavLink({ href, label, icon: Icon, variant = "top" }, ref) {
    const pathname = usePathname();

    const active = isNavItemActive(pathname, href);
    const compact = variant === "compact";

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          "relative z-10 inline-flex items-center justify-center font-semibold whitespace-nowrap transition-[color,background-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          compact
            ? cn(
                "gap-1.5 rounded-xl px-3 py-2 text-xs",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )
            : cn(
                "h-10 min-w-max gap-2 rounded-full px-3.5 sm:px-4.5 text-xs sm:text-sm",
                active
                  ? "text-white [text-shadow:0_1px_0_rgba(0,0,0,0.16)]"
                  : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
              )
        )}
        aria-current={active ? "page" : undefined}
        aria-label={label}
        data-active={active ? "true" : "false"}
        data-nav-href={href}
      >
        <Icon className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4 shrink-0 text-current/85")} />
        <span>{label}</span>
      </Link>
    );
  }
);
