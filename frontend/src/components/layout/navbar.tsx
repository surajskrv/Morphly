"use client";

import Link from "next/link";
import { Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border/60 px-6 py-3.5 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="font-semibold text-base tracking-tight">Morphly</span>
      </Link>
      <div className="flex items-center gap-2">
        {isAuthenticated && user ? (
          <>
            <span className="text-xs text-muted-foreground hidden sm:block mr-1">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-xs rounded-lg">Get Started</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
