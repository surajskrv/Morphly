"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Sparkles, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionEyebrow, SurfaceCard } from "@/components/ui/product-shell";
import { getErrorMessage } from "@/lib/error-utils";
import api from "@/services/api";

const registerBenefits = [
  "Resume-driven onboarding instead of long setup forms",
  "Matched jobs, tailored drafts, and tracking in one workspace",
  "A workflow designed around clarity instead of blind automation",
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { email, full_name: fullName, password });
      toast.success("Account created. Please sign in.");
      router.push("/login");
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
            <SectionEyebrow icon={Sparkles} label="Start your Morphly workspace" />
            <div className="space-y-3">
              <h1 className="max-w-xl text-balance text-[2rem] font-semibold tracking-tight sm:text-5xl">
                Create an account and move into a more organized search.
              </h1>
              <p className="max-w-xl text-base leading-8 text-muted-foreground">
                Sign up to upload your base resume, confirm your profile, and start preparing stronger applications with less repetitive work.
              </p>
            </div>
          </div>

          <SurfaceCard className="max-w-xl">
            <div className="space-y-4">
              <p className="text-sm font-semibold tracking-tight text-foreground">What you unlock</p>
              <div className="space-y-3">
                {registerBenefits.map((item) => (
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
              <UserPlus className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Create account</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Start free and build a calmer workflow for job discovery, drafting, and tracking.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full name</label>
              <Input placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm password</label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating account..." : "Create free account"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </SurfaceCard>
      </div>
    </div>
  );
}
