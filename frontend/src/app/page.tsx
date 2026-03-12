"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import {
  ArrowRight,
  Briefcase,
  FileText,
  Zap,
  Search,
  Send,
  Shield,
  Clock,
  TrendingUp,
  CheckCircle2,
  Star,
  Users,
  Target,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Discovery",
    desc: "AI crawls job boards and ranks listings that match your unique skills, experience, and career goals.",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    icon: FileText,
    title: "Auto Resume",
    desc: "Generates a tailored resume for every application — highlighting the skills each employer wants to see.",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: Send,
    title: "One-Click Apply",
    desc: "Playwright-powered automation fills out forms and submits applications on your behalf. Hands-free.",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  {
    icon: TrendingUp,
    title: "Match Scoring",
    desc: "Every job gets a relevance score so you can focus your energy on the opportunities that matter most.",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "JWT authentication, bcrypt-hashed passwords, and zero third-party data sharing. Your data is yours.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: Clock,
    title: "Save Hours Weekly",
    desc: "What used to take 10+ hours of copy-pasting now happens automatically in the background.",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
  },
];

const steps = [
  { num: "1", title: "Set your preferences", desc: "Choose your desired role, location, salary range, and skills. Takes 30 seconds.", bg: "bg-sky-50", color: "text-sky-700", border: "border-sky-100" },
  { num: "2", title: "Upload your resume", desc: "Add your base resume. Our AI will customize it for every single application.", bg: "bg-violet-50", color: "text-violet-700", border: "border-violet-100" },
  { num: "3", title: "Relax & interview", desc: "Morphly finds matching jobs, generates resumes, and applies — you just show up.", bg: "bg-teal-50", color: "text-teal-700", border: "border-teal-100" },
];

const stats = [
  { icon: Target, value: "95%", label: "Match Accuracy" },
  { icon: Clock, value: "10x", label: "Faster Applications" },
  { icon: Users, value: "500+", label: "Jobs Searched Daily" },
  { icon: Star, value: "4.9", label: "User Satisfaction" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── warm cream with soft gradient blobs */}
      <section className="relative overflow-hidden bg-section-cream">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-teal-100/30 blur-3xl" />
          <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[55%] rounded-full bg-violet-100/25 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[30%] w-[40%] h-[50%] rounded-full bg-amber-100/20 blur-3xl" />
        </div>

        <div className="flex flex-col items-center text-center px-6 pt-20 sm:pt-28 pb-20">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/15">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Job Automation
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl leading-[1.1]">
            Your next job,{" "}
            <span className="text-primary">found and applied</span>
            {" "}automatically
          </h1>

          <p className="mt-5 text-muted-foreground max-w-lg text-base sm:text-lg leading-relaxed">
            Set your preferences, upload your resume, and let Morphly handle the entire application process — from discovery to submission.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-7 h-12 rounded-xl text-base">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-7 h-12 rounded-xl text-base bg-card/80">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 mt-8 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            <span>Free forever</span>
            <span className="text-border">·</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            <span>No credit card</span>
            <span className="text-border hidden sm:inline">·</span>
            <span className="hidden sm:flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              60-second setup
            </span>
          </div>
        </div>
      </section>

      {/* ── Stats ── soft sage background */}
      <section className="px-6 py-12 bg-section-sage border-y border-border/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-2">
                <s.icon className="w-5 h-5 text-teal-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── warm cream background */}
      <section className="px-6 py-20 bg-section-cream">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary mb-2">Features</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Everything you need to land a job</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              One platform that handles your entire application pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="p-5 rounded-2xl bg-card soft-shadow soft-shadow-hover border border-border/50">
                <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-base mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── soft lavender background */}
      <section className="px-6 py-20 bg-section-lavender">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary mb-2">How It Works</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Three steps. That&apos;s it.</h2>
            <p className="text-muted-foreground mt-2">No complicated setup. No learning curve. Just results.</p>
          </div>

          <div className="space-y-4">
            {steps.map((s) => (
              <div key={s.num} className="flex items-start gap-5 p-5 rounded-2xl bg-card soft-shadow border border-border/50">
                <div className={`w-11 h-11 rounded-xl ${s.bg} ${s.color} ${s.border} flex items-center justify-center font-bold text-base shrink-0 border`}>
                  {s.num}
                </div>
                <div>
                  <h3 className="font-semibold text-base">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── peach tint */}
      <section className="px-6 py-14 bg-section-peach border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-muted-foreground mb-5">Built with modern technology</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Next.js", "FastAPI", "MongoDB", "Redis", "Celery", "Playwright", "Gemini"].map((tech) => (
              <span key={tech} className="px-4 py-2 rounded-xl bg-card border border-border/50 text-sm font-medium text-muted-foreground soft-shadow">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── sky tint */}
      <section className="px-6 py-20 bg-section-sky">
        <div className="relative max-w-xl mx-auto text-center bg-card rounded-3xl p-10 soft-shadow border border-border/50 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-violet-400 to-rose-400" />
          <Briefcase className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to automate your job search?</h2>
          <p className="text-muted-foreground mb-6">
            Create your free account and start receiving matched jobs in minutes.
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2 px-8 h-12 rounded-xl text-base">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 py-8 px-6 bg-section-cream">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            Morphly
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Morphly · Built with ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
