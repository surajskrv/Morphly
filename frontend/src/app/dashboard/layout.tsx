"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, FileText, Home, LogOut, Settings2, Sparkles, ClipboardCheck, RefreshCw } from "lucide-react";

import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/jobs", label: "Recommended", icon: Briefcase },
  { href: "/dashboard/applied", label: "Applied Jobs", icon: ClipboardCheck },
  { href: "/dashboard/preferences", label: "Preferences", icon: Settings2 },
  { href: "/dashboard/resume", label: "Resume", icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { checkAuth, logout, user } = useAuthStore();
  const [ready, setReady] = useState(false);

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

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-section-cream">
        <RefreshCw className="w-5 h-5 animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-section-cream">
      <header className="sticky top-0 z-20 border-b border-border/60 backdrop-blur-sm bg-background/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Morphly Workspace</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Post-login control center</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden md:block text-xs text-muted-foreground">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 rounded-lg gap-1.5"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="hidden lg:block">
          <nav className="bg-card rounded-2xl border border-border/50 soft-shadow p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="space-y-4 min-w-0">
          <nav className="lg:hidden bg-card border border-border/50 rounded-xl p-2 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
