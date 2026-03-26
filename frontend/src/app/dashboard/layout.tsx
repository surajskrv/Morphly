"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  ClipboardCheck,
  FileText,
  Home,
  LogOut,
  RefreshCw,
  Settings2,
  Sparkles,
} from "lucide-react";

import { DashboardNavLink } from "@/components/layout/dashboard-nav-link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/jobs", label: "Recommended", icon: Briefcase },
  { href: "/dashboard/applied", label: "Tracking", icon: ClipboardCheck },
  { href: "/dashboard/preferences", label: "Profile", icon: Settings2 },
  { href: "/dashboard/resume", label: "Base Resume", icon: FileText },
];

function isNavItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { checkAuth, logout, user } = useAuthStore();
  const [ready, setReady] = useState(false);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, x: 0, opacity: 0 });

  const currentItem = NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href));
  const activeHref = currentItem?.href ?? "/dashboard";

  const syncIndicator = useCallback(() => {
    const activeTab =
      tabRefs.current[activeHref] ??
      Object.values(tabRefs.current).find((tab) => tab?.dataset.active === "true") ??
      null;

    if (!activeTab) {
      setIndicatorStyle((current) => (current.opacity === 0 ? current : { ...current, opacity: 0 }));
      return;
    }

    setIndicatorStyle({
      width: activeTab.offsetWidth,
      x: activeTab.offsetLeft,
      opacity: 1,
    });
  }, [activeHref]);

  const centerActiveTab = useCallback(() => {
    const scrollContainer = navScrollRef.current;
    const activeTab = tabRefs.current[activeHref];
    if (!scrollContainer || !activeTab) return;

    const hasOverflow = scrollContainer.scrollWidth > scrollContainer.clientWidth + 4;
    if (!hasOverflow) {
      if (scrollContainer.scrollLeft !== 0) {
        scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
      }
      return;
    }

    const targetLeft = activeTab.offsetLeft - (scrollContainer.clientWidth - activeTab.offsetWidth) / 2;

    scrollContainer.scrollTo({
      left: Math.max(targetLeft, 0),
      behavior: "smooth",
    });
  }, [activeHref]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      await checkAuth();
      if (cancelled) return;

      if (!useAuthStore.getState().isAuthenticated) {
        router.replace("/login");
        return;
      }

      setReady(true);
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [checkAuth, router]);

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(syncIndicator);
    return () => window.cancelAnimationFrame(frame);
  }, [syncIndicator]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(centerActiveTab);
    return () => window.cancelAnimationFrame(frame);
  }, [centerActiveTab]);

  useEffect(() => {
    const handleSync = () => syncIndicator();
    const scrollContainer = navScrollRef.current;

    window.addEventListener("resize", handleSync);
    scrollContainer?.addEventListener("scroll", handleSync, { passive: true });

    let observer: ResizeObserver | null = null;
    const activeTab = tabRefs.current[activeHref];

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(handleSync);
      if (scrollContainer) observer.observe(scrollContainer);
      if (activeTab) observer.observe(activeTab);
    }

    return () => {
      window.removeEventListener("resize", handleSync);
      scrollContainer?.removeEventListener("scroll", handleSync);
      observer?.disconnect();
    };
  }, [activeHref, syncIndicator]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-section-cream">
        <RefreshCw className="h-5 w-5 animate-spin text-primary/70" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-section-cream">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
            <div className="flex min-w-0 items-center gap-3 lg:justify-self-start">
              <Link
                href="/dashboard"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.15rem] border border-primary/10 bg-primary/10 text-primary shadow-[inset_0_1px_0_oklch(1_0_0_/_28%)] sm:h-11 sm:w-11 sm:rounded-[1.25rem]"
              >
                <Sparkles className="h-5 w-5" />
              </Link>
              <p className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">Morphly</p>
            </div>

            <div
              ref={navScrollRef}
              className="order-3 -mx-1 overflow-x-auto overscroll-x-contain px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:order-2 lg:mx-0 lg:w-full lg:overflow-visible lg:px-0"
            >
              <div className="flex justify-start lg:justify-center">
                <nav className="tab-bar-shell relative inline-flex min-w-max items-center gap-1 rounded-full border border-border/70 p-1 soft-shadow sm:p-1.5">
                  <span
                    aria-hidden="true"
                    className="tab-pill-glow pointer-events-none absolute inset-y-1 left-0 rounded-full bg-linear-to-r from-primary via-primary/95 to-primary/80 transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-y-1.5"
                    style={{
                      width: indicatorStyle.width,
                      opacity: indicatorStyle.opacity,
                      transform: `translateX(${indicatorStyle.x}px)`,
                    }}
                  />
                  {NAV_ITEMS.map((item) => (
                    <DashboardNavLink
                      key={item.href}
                      ref={(node) => {
                        tabRefs.current[item.href] = node;
                      }}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      variant="top"
                    />
                  ))}
                </nav>
              </div>
            </div>

            <div className="order-2 flex min-w-0 items-center justify-end gap-2 sm:gap-3 lg:order-3 lg:justify-self-end">
              <div className="hidden min-w-0 text-right sm:block">
                <p className="truncate text-sm font-medium text-foreground">{user?.full_name || user?.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl min-w-0 px-4 py-6 sm:px-6 sm:py-7">{children}</main>
    </div>
  );
}
