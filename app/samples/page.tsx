import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreGauge } from "@/components/score-gauge";
import { SAMPLE_AUDITS } from "@/lib/mock-data";
import { scoreLabel } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

const SAMPLE_HIGHLIGHTS: Record<string, { tagline: string; highlight: string }> = {
  "sample-1": {
    tagline: "Clinical credibility meets retention excellence",
    highlight: "Strong overall. Best-in-class SEO opportunity.",
  },
  "sample-2": {
    tagline: "World-class creative, broken retention funnel",
    highlight: "Creative-strong, retention-weak. Fix the bottom of the funnel.",
  },
  "sample-3": {
    tagline: "SEO moat, invisible paid channel",
    highlight: "SEO-led with zero paid ad leverage",
  },
  "sample-4": {
    tagline: "Viral social, broken website",
    highlight: "Community-strong, PDP critical — website failing the brand",
  },
  "sample-5": {
    tagline: "Marketplace success, DTC neglected",
    highlight: "Below-average across all DTC dimensions",
  },
  "sample-6": {
    tagline: "Almost there, one sprint from breakout",
    highlight: "One checkout bug and a Pinterest launch away from 80+",
  },
};

export default async function SamplesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userDisplay = user
    ? { name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "", email: user.email ?? "" }
    : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={userDisplay} isAuthenticated={!!user} />

      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-foreground">Sample Audit Reports</h1>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              6 anonymised real-world D2C brand audits. See the depth of analysis before running your own.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_AUDITS.map((audit) => {
              const meta = SAMPLE_HIGHLIGHTS[audit.id];
              return (
                <Link
                  key={audit.id}
                  href={`/audit/${audit.id}`}
                  className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="teal" className="text-xs">{audit.category}</Badge>
                      </div>
                      <h3 className="font-semibold text-foreground">{audit.brandName}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(audit.createdAt, "d MMM yyyy")}
                      </p>
                    </div>
                    <ScoreGauge score={audit.brandHealthScore} size="sm" showLabel />
                  </div>

                  <p className="text-sm font-medium text-foreground mb-1">{meta?.tagline}</p>
                  <p className="text-xs text-muted-foreground mb-4">{meta?.highlight}</p>

                  {/* Mini dimension scores */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "PDP", score: audit.pdp.score },
                      { label: "Creative", score: audit.creative.score },
                      { label: "Social", score: audit.social.score },
                      { label: "Funnel", score: audit.funnel.score },
                      { label: "Retention", score: audit.retention.score },
                      { label: "SEO", score: audit.seo.score },
                    ].map(({ label, score }) => (
                      <div key={label} className="text-center">
                        <div className="text-xs font-mono font-bold" style={{ color: score === null ? "#9CA3AF" : score < 40 ? "#EF4444" : score < 70 ? "#F59E0B" : "#10B981" }}>
                          {score ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Read-only sample</span>
                    <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                      View report <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm mb-4">Ready to audit your own brand?</p>
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Run your free audit <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-card border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Sample audits are anonymised. Brand names and metrics are illustrative.
          </p>
        </div>
      </footer>
    </div>
  );
}
