"use client";

import Link from "next/link";
import { ArrowRight, LogOut, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/10 text-primary shadow-[inset_0_1px_0_oklch(1_0_0_/_28%)] sm:h-10 sm:w-10 sm:rounded-2xl">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">Morphly</p>
            <p className="hidden text-xs text-muted-foreground sm:block">Job discovery and application prep</p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">{user.full_name || user.email}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <span className="hidden sm:inline">Sign in</span>
                  <span className="sm:hidden">In</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  <span className="hidden sm:inline">Get started</span>
                  <span className="sm:hidden">Start</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
