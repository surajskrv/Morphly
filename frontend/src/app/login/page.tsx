"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LockKeyhole, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionEyebrow, SurfaceCard } from "@/components/ui/product-shell";
import { getErrorMessage } from "@/lib/error-utils";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";

const signInBenefits = [
  "Pick up where you left off in your workspace",
  "Review matched jobs and application drafts in one place",
  "Keep your resume-driven profile and tracking history together",
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);
      const res = await api.post("/auth/login", formData);
      const { access_token } = res.data;
      const userRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      login(access_token, userRes.data);
      toast.success("Welcome back.");
      router.push("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
        <div className="flex-1 space-y-6 lg:space-y-8 lg:py-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="space-y-4">
            <SectionEyebrow icon={Sparkles} label="Welcome back to Morphly" />
            <div className="space-y-3">
              <h1 className="max-w-xl text-balance text-[2rem] font-semibold tracking-tight sm:text-5xl">
                Return to a calmer job-search workspace.
              </h1>
              <p className="max-w-xl text-base leading-8 text-muted-foreground">
                Sign in to continue reviewing matched roles, tailoring documents, and tracking where you are in your search.
              </p>
            </div>
          </div>

          <SurfaceCard className="max-w-xl">
            <div className="space-y-4">
              <p className="text-sm font-semibold tracking-tight text-foreground">What you come back to</p>
              <div className="space-y-3">
                {signInBenefits.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[1.25rem] border border-border/70 bg-background/82 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard className="w-full lg:max-w-md lg:self-center">
          <div className="mb-6 space-y-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1.25rem] border border-primary/10 bg-primary/10 text-primary">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Use your account to continue with job discovery, tailored drafts, and application tracking.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Continue to workspace"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </SurfaceCard>
      </div>
    </div>
  );
}
