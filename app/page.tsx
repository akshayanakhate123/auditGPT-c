import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, ChevronRight, Lock, Zap, Target, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreGauge } from "@/components/score-gauge";
import { createClient } from "@/lib/supabase/server";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Target,
    title: "Paste 3 links",
    desc: "Brand website, Meta Ad Library URL, and Instagram handle. That's all we need.",
  },
  {
    step: "02",
    icon: Zap,
    title: "AI diagnoses 6 dimensions",
    desc: "Llama 3.3 70B audits PDP, Creative, Social, Funnel, Retention, and SEO simultaneously.",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Get prioritised recommendations",
    desc: "ICE-scored actions with implementation templates. Not generic advice.",
  },
];

const PREVIEW_SCORES = [
  { dimension: "PDP Health", score: 72 },
  { dimension: "Creative", score: 85 },
  { dimension: "Social / Content", score: 78 },
  { dimension: "Funnel", score: 56 },
];

const PRICING = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    highlight: false,
    features: ["1 audit per month", "3 dimensions only", "Basic recommendations", "7-day report history"],
    cta: "Start for free",
    href: "/auth/signup",
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/month",
    highlight: true,
    features: ["10 audits per month", "All 6 dimensions", "ICE recommendations + templates", "PDF export", "Full history", "Competitor benchmarking"],
    cta: "Start Pro trial",
    href: "/auth/signup?plan=pro",
  },
  {
    name: "Agency",
    price: "₹4,999",
    period: "/month",
    highlight: false,
    features: ["Unlimited audits", "All Pro features", "White-label PDF", "Team seats (5)", "Priority support", "API access"],
    cta: "Contact us",
    href: "/auth/signup?plan=agency",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userDisplay = user
    ? { name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "", email: user.email ?? "" }
    : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={userDisplay} isAuthenticated={!!user} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,70,229,0.08),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Get a structured D2C growth audit{" "}
              <span className="text-primary">in 20 minutes</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Replace 6-hour manual audits with an AI diagnostic across 6 growth dimensions: PDP,
              Creative, Social, Funnel, Retention, and SEO. Get specific, prioritised recommendations.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" asChild>
                <Link href="/auth/signup">
                  Run free audit <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/samples">
                  See sample report <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required · Free for 1 audit/month</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">Three steps. No spreadsheets. No consultants.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-muted-foreground">{step}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample preview */}
      <section className="border-b border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">What your audit looks like</h2>
            <p className="mt-3 text-muted-foreground">Each dimension gets a score, sub-metrics, what's working, and critical gaps.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {PREVIEW_SCORES.map(({ dimension, score }) => (
              <div key={dimension} className="rounded-xl border border-border bg-card p-5 text-center">
                <ScoreGauge score={score} size="md" />
                <p className="mt-3 text-sm font-semibold text-foreground">{dimension}</p>
                <p className="text-xs text-muted-foreground mt-1">Sub-metrics below</p>
                <div className="mt-3 space-y-1.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-muted-foreground/30" style={{ width: `${60 + i * 10}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 relative">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-2 blur-sm pointer-events-none select-none">
              {["Retention", "SEO Footprint"].map((dim) => (
                <div key={dim} className="rounded-xl border border-border bg-card p-5 text-center">
                  <ScoreGauge score={62} size="md" />
                  <p className="mt-3 text-sm font-semibold text-foreground">{dim}</p>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-4 py-2.5 shadow-sm">
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Sign up to unlock all 6 dimensions</span>
                <Link href="/auth/signup" className="text-sm font-semibold text-primary hover:underline">
                  Get started →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Simple, transparent pricing</h2>
            <p className="mt-3 text-muted-foreground">Start free. Upgrade when you need more audits or dimensions.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {PRICING.map(({ name, price, period, highlight, features, cta, href }) => (
              <div
                key={name}
                className={`relative rounded-xl border p-6 ${
                  highlight
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border bg-card"
                }`}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="text-xs">Most popular</Badge>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground">{name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">{price}</span>
                    <span className="text-sm text-muted-foreground">{period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={highlight ? "default" : "outline"}
                  asChild
                >
                  <Link href={href}>{cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <BarChart3 className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold">AuditGPT</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/samples" className="hover:text-foreground transition-colors">Sample Reports</Link>
              <Link href="/auth/signup" className="hover:text-foreground transition-colors">Sign up</Link>
              <Link href="/auth/login" className="hover:text-foreground transition-colors">Log in</Link>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 AuditGPT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
