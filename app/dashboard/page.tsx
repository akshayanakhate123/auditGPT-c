import { redirect } from "next/navigation";
import Link from "next/link";
import { format, startOfMonth } from "date-fns";
import { ArrowRight, BarChart3, Clock, FileText, Plus, TrendingUp, Zap } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreBadge } from "@/components/score-badge";
import { DidYouKnow } from "@/components/did-you-know";
import { createClient } from "@/lib/supabase/server";


type AuditRow = {
  id: string;
  brand_name: string;
  category: string;
  brand_health_score: number | null;
  pdp_score: number | null;
  creative_score: number | null;
  social_score: number | null;
  funnel_score: number | null;
  retention_score: number | null;
  seo_score: number | null;
  status: string;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const firstName = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0]
    ?? user.email?.split("@")[0]
    ?? "there";

  const userDisplay = {
    name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "",
    email: user.email ?? "",
  };

  // Fetch all audits for stats + recent list
  const { data: audits } = await supabase
    .from("audits")
    .select("id, brand_name, category, brand_health_score, pdp_score, creative_score, social_score, funnel_score, retention_score, seo_score, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const auditList: AuditRow[] = audits ?? [];
  const completed = auditList.filter((a) => a.status === "complete");
  const totalAudits = auditList.length;
  const avgHealth =
    completed.length > 0
      ? Math.round(completed.reduce((s, a) => s + (a.brand_health_score ?? 0), 0) / completed.length)
      : 0;
  const thisMonth = auditList.filter(
    (a) => new Date(a.created_at) >= startOfMonth(new Date())
  ).length;

  // Find strongest dimension
  let strongestDim = "—";
  if (completed.length > 0) {
    const avg = (key: keyof AuditRow) =>
      completed.reduce((s, a) => s + ((a[key] as number) ?? 0), 0) / completed.length;
    const dims = {
      PDP: avg("pdp_score"),
      Creative: avg("creative_score"),
      Social: avg("social_score"),
      Funnel: avg("funnel_score"),
      Retention: avg("retention_score"),
      SEO: avg("seo_score"),
    };
    strongestDim = Object.entries(dims).sort(([, a], [, b]) => b - a)[0][0];
  }

  const statCards = [
    { label: "Total Audits", value: totalAudits.toString(), icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
    { label: "Avg Brand Health", value: avgHealth > 0 ? avgHealth.toString() : "—", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Strongest Dimension", value: strongestDim, icon: Zap, color: "text-teal-600", bg: "bg-teal-100" },
    { label: "Audits This Month", value: thisMonth.toString(), icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  const recentAudits = auditList.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={userDisplay} isAuthenticated />

      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {firstName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Your brand diagnostics at a glance
              </p>
            </div>
            <Button asChild>
              <Link href="/new-audit">
                <Plus className="h-4 w-4" /> New audit
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-4">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                  <Card key={label}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                          <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-xl font-bold text-foreground font-mono">{value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* CTA card */}
              <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-6">
                <div className="absolute right-0 top-0 h-full w-64 bg-[radial-gradient(ellipse_at_right,rgba(79,70,229,0.12),transparent_70%)]" />
                <div className="relative">
                  <h3 className="font-semibold text-foreground text-lg">Run a new audit</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                    Paste 3 inputs (website, Meta Ad Library, Instagram) and get a full 6-dimension diagnostic in minutes.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/new-audit">
                      Start audit <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Recent audits */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Audits</CardTitle>
                    {recentAudits.length > 0 && (
                      <Link href="/history" className="text-sm text-primary hover:underline">
                        View all →
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {recentAudits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-medium text-foreground">No audits yet</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Run your first audit to see it here.
                      </p>
                      <Button size="sm" asChild>
                        <Link href="/new-audit">Run your first audit</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {recentAudits.map((audit) => (
                        <Link
                          key={audit.id}
                          href={`/audit/${audit.id}`}
                          className="flex items-center justify-between rounded-lg p-3 hover:bg-secondary transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                              <BarChart3 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {audit.brand_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {audit.category} · {format(new Date(audit.created_at), "d MMM yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {audit.brand_health_score != null && (
                              <ScoreBadge score={audit.brand_health_score} />
                            )}
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <DidYouKnow />

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">D2C Benchmarks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "PDP Conversion (Wellness)", value: "6-8%" },
                    { label: "Email Open Rate (avg)", value: "22-28%" },
                    { label: "Cart Abandonment (India)", value: "72-78%" },
                    { label: "Subscription Mix (top brands)", value: "30-40%" },
                    { label: "Avg Reels Engagement", value: "3-5%" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-xs font-mono font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
