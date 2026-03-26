"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileSearch,
  FileText,
  LayoutPanelTop,
  ShieldCheck,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  ActionPanel,
  PageHeader,
  SectionEyebrow,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from "@/components/ui/product-shell";

const featureCards = [
  {
    icon: FileSearch,
    title: "All your strong-fit jobs in one place",
    description:
      "Pull relevant roles into one workspace, then sort through them with clearer signals instead of opening ten different job boards.",
  },
  {
    icon: WandSparkles,
    title: "Grounded resume and cover-letter drafts",
    description:
      "Morphly tailors each draft from your base resume and the target job, so the output stays useful without inventing experience.",
  },
  {
    icon: LayoutPanelTop,
    title: "A calmer application workflow",
    description:
      "Review your profile, prepare documents, and apply on the original source with better context and less tab chaos.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Upload your base resume",
    description:
      "Start once with the resume you already trust. Morphly extracts the basics and gives you a cleaner starting profile.",
  },
  {
    step: "02",
    title: "Review your profile and preferences",
    description:
      "Edit anything that feels off, add preferences like location or salary, and make your manual choices the source of truth.",
  },
  {
    step: "03",
    title: "Prepare stronger applications faster",
    description:
      "Open a matched role, generate tailored drafts, refine them in-app, and apply on the original listing when you are ready.",
  },
];

const principles = [
  "Tech-role focused matching and document prep",
  "Human review before submission, always",
  "No fake automation promises or mystery workflows",
  "Designed for clarity on desktop and mobile",
];

export default function Home() {
  return (
    <div className="min-h-screen text-foreground">
      <Navbar />

      <section className="marketing-hero border-b border-border/60 px-4 py-12 sm:px-6 sm:py-18">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-7">
            <SectionEyebrow icon={Sparkles} label="Calmer job discovery and application prep" />
            <div className="space-y-4">
              <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Find better-fit jobs and prepare better applications without the usual mess.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Morphly brings matching jobs into one workspace, reads your base resume, and helps you generate grounded resume and cover-letter drafts before you apply on the original site.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Start your workspace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign in
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <StatusBadge icon={ShieldCheck}>Grounded by your resume</StatusBadge>
              <StatusBadge tone="info" icon={Target}>Manual review stays in control</StatusBadge>
              <StatusBadge tone="success" icon={BriefcaseBusiness}>Built for tech-role workflows</StatusBadge>
            </div>
          </div>

          <SurfaceCard className="relative overflow-hidden p-0">
            <div className="border-b border-border/70 px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold tracking-tight">Morphly Workspace</p>
                  <p className="text-sm text-muted-foreground">A clearer path from discovery to apply.</p>
                </div>
                <StatusBadge tone="info">Live workflow</StatusBadge>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:p-6">
              <div className="surface-subtle rounded-[1.5rem] border border-border/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Profile readiness</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight">Step-by-step</p>
                  </div>
                  <div className="rounded-2xl border border-primary/10 bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                    Resume first
                  </div>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  {[
                    "Upload a base resume",
                    "Review extracted profile",
                    "Generate a tailored draft",
                  ].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/86 px-3 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ActionPanel
                  title="Matched role"
                  description="Surface why a job fits before you spend time tailoring for it."
                  actions={<StatusBadge tone="success">Fit reasons included</StatusBadge>}
                />
                <ActionPanel
                  title="Tailored draft"
                  description="Edit resume sections and cover letters in one workspace before applying externally."
                  actions={<StatusBadge tone="info">Editable in app</StatusBadge>}
                />
              </div>
            </div>
          </SurfaceCard>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeader
            title="What Morphly is actually good at"
            description="Not a vague auto-apply bot. A focused workflow for discovery, tailoring, and decision-making."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {featureCards.map((feature) => (
              <SurfaceCard key={feature.title} className="soft-shadow-hover">
                <div className="flex h-11 w-11 items-center justify-center rounded-[1.25rem] border border-primary/10 bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="mt-5 space-y-2">
                  <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">{feature.description}</p>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/55 px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="space-y-4">
            <SectionEyebrow label="How it flows" />
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              One base resume. One guided workflow. Less second-guessing.
            </h2>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              The product is designed to reduce scattered effort. Each step gives the next one better context, so users can move from setup to strong applications without losing the thread.
            </p>
          </div>

          <div className="grid gap-4">
            {workflow.map((item) => (
              <SurfaceCard key={item.step} className="soft-shadow-hover">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.35rem] border border-primary/10 bg-primary/10 text-sm font-semibold text-primary">
                    {item.step}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <SurfaceCard>
            <SectionHeader
              title="What the experience is designed to protect"
              description="The goal is speed without sacrificing trust or clarity."
            />
            <div className="mt-5 space-y-3">
              {principles.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[1.25rem] border border-border/70 bg-background/82 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <PageHeader
            className="h-full"
            eyebrow={<SectionEyebrow icon={FileText} label="Ready when you are" />}
            title="Build stronger applications with less friction."
            description="Create your free account, upload your base resume, and move into a calmer application-prep workflow that keeps you in control of the final apply step."
            actions={
              <>
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Create free account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Continue working
                  </Button>
                </Link>
              </>
            }
          />
        </div>
      </section>
    </div>
  );
}
