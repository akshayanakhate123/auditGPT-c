"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  ArrowDown, ArrowRight, BarChart3, CheckCircle2, ChevronDown, ChevronUp,
  ExternalLink, Info, RefreshCw, Share2, XCircle, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Audit } from "@/lib/mock-data";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import { ScoreGauge } from "@/components/score-gauge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { scoreColor, cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Sub-components ───────────────────────────────────────────────────────────

function Expandable({
  label,
  icon,
  children,
}: {
  label: string;
  icon: "check" | "x";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-0 py-2.5 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          {icon === "check" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          {label}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && <div className="pb-3 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

function SubScoreCard({
  title,
  detail,
  dataStatus,
}: {
  title: string;
  detail: Audit["pdp"];
  dataStatus?: "HAS_DATA" | "NO_DATA" | null;
}) {
  const { score, subMetrics, whatsWorking, criticalGaps, whyThisScore } = detail;
  const [showWhy, setShowWhy] = useState(false);
  const hasData = score !== null && dataStatus !== "NO_DATA";

  const chartData = subMetrics.map((m) => ({
    name: m.name,
    score: m.score ?? 0,
    benchmark: m.benchmark ?? 0,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {dataStatus === "HAS_DATA" && (
              <span className="bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium px-2 py-0.5">Verified</span>
            )}
            {dataStatus === "NO_DATA" && (
              <span className="bg-gray-100 text-gray-500 rounded-full text-xs font-medium px-2 py-0.5">No data</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {score === null ? "No data available for this dimension" : score < 40 ? "Critical attention needed" : score < 70 ? "Room for improvement" : "Performing well"}
          </p>
        </div>
        <ScoreGauge score={score} size="sm" showLabel />
      </div>

      {hasData ? (
        <div className="mb-4">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 10, fill: "rgb(107 114 128)" }}
              />
              <Tooltip
                formatter={(v) => [`${v}`, ""]}
                contentStyle={{ fontSize: 11 }}
              />
              <Bar dataKey="score" radius={[0, 2, 2, 0]} barSize={8}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={scoreColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mb-4 bg-gray-50 border border-gray-200 text-gray-600 text-sm p-4 rounded-lg text-center">
          Data source not available for this dimension. Provide the required inputs to enable scoring.
        </div>
      )}

      <div className="space-y-0">
        <Expandable label="What's working" icon="check">
          <ul className="space-y-1.5 mt-1">
            {whatsWorking.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-500 shrink-0">·</span>
                {w}
              </li>
            ))}
          </ul>
        </Expandable>
        <Expandable label="Critical gaps" icon="x">
          <ul className="space-y-1.5 mt-1">
            {criticalGaps.map((g, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-red-400 shrink-0">·</span>
                {g}
              </li>
            ))}
          </ul>
        </Expandable>
        <Expandable label="Why this score?" icon="check">
          <p className="mt-1">{whyThisScore}</p>
        </Expandable>
      </div>
    </div>
  );
}

function ICEBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      <span className="w-5 text-right text-xs font-mono font-semibold text-foreground">{value}</span>
    </div>
  );
}

function RecommendationCard({
  rec,
  rank,
}: {
  rec: Audit["recommendations"][0];
  rank: number;
}) {
  const [showWhy, setShowWhy] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className={cn("rounded-xl border bg-card p-5", done && "opacity-60")}>
      <div className="flex items-start gap-4 mb-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
          {rank}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground text-sm leading-snug">{rec.title}</h3>
            <Badge
              variant={rec.difficulty === "Easy" ? "success" : rec.difficulty === "Medium" ? "warning" : "danger"}
              className="shrink-0"
            >
              {rec.difficulty}
            </Badge>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {rec.predictedImpact}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <ICEBar label="Impact" value={rec.ice.impact} />
        <ICEBar label="Confidence" value={rec.ice.confidence} />
        <ICEBar label="Ease" value={rec.ice.ease} />
      </div>

      <div className="space-y-0">
        <button
          onClick={() => setShowWhy((v) => !v)}
          className="flex w-full items-center justify-between border-t border-border py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Why we said this
          {showWhy ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {showWhy && (
          <p className="pb-3 text-sm text-muted-foreground">{rec.whyWeSaidThis}</p>
        )}

        <button
          onClick={() => setShowTemplate((v) => !v)}
          className="flex w-full items-center justify-between border-t border-border py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Implementation template
          {showTemplate ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {showTemplate && (
          <div className="pb-3 text-sm text-muted-foreground whitespace-pre-line font-mono text-xs bg-secondary/50 rounded-lg p-3">
            {rec.implementationTemplate}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={done}
            onChange={(e) => setDone(e.target.checked)}
            className="rounded"
          />
          Mark done
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={saved}
            onChange={(e) => setSaved(e.target.checked)}
            className="rounded"
          />
          Save for later
        </label>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

type DimKey = "pdp" | "creative" | "social" | "funnel" | "retention" | "seo";

function getDimStatus(audit: Audit, dim: DimKey): "HAS_DATA" | "NO_DATA" | null {
  const ds = audit.data_sources;
  if (!ds) return null;
  const keyMap: Record<DimKey, keyof NonNullable<Audit["data_sources"]>> = {
    pdp: "pdp_health",
    creative: "creative",
    social: "social",
    funnel: "funnel",
    retention: "retention",
    seo: "seo",
  };
  return ds[keyMap[dim]] ?? null;
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AuditReport({ audit }: { audit: Audit }) {
  const dimensions: Array<{ key: DimKey; title: string }> = [
    { key: "pdp", title: "PDP Health" },
    { key: "creative", title: "Creative" },
    { key: "social", title: "Social / Content Authority" },
    { key: "funnel", title: "Funnel" },
    { key: "retention", title: "Retention" },
    { key: "seo", title: "SEO" },
  ];

  const missingSources: string[] = [];
  if (["pdp", "funnel", "retention", "seo"].some((k) => getDimStatus(audit, k as DimKey) === "NO_DATA")) {
    if (!missingSources.includes("Brand Website")) missingSources.push("Brand Website");
  }
  if (getDimStatus(audit, "creative") === "NO_DATA") {
    missingSources.push("Meta Ad Library");
  }
  if (getDimStatus(audit, "social") === "NO_DATA") {
    missingSources.push("Instagram");
  }

  const competitorData = audit.competitorBenchmark
    .filter((c) => c.brandHealth !== null)
    .map((c) => ({
      name: c.brand,
      score: c.brandHealth as number,
      isAudited: c.isAudited,
    }));

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="teal">{audit.category}</Badge>
              <span className="text-xs text-muted-foreground font-mono">#{audit.id.slice(-8)}</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">{audit.brandName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Audited {format(audit.createdAt, "d MMMM yyyy")}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <ScoreGauge score={audit.brandHealthScore} size="xl" showLabel />
            <p className="mt-1 text-xs font-semibold text-muted-foreground">Brand Health</p>
            {audit.brandHealthScore === null && (
              <p className="text-xs text-gray-400 mt-0.5">Insufficient data</p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-secondary/50 p-4 mb-6">
          <p className="text-sm text-foreground leading-relaxed">
            <span className="font-semibold">Executive Summary:</span> {audit.executiveSummary}
          </p>
          {missingSources.length > 0 && (
            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800">Unavailable Data Sources</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    The following sources were not provided or blocked our scraper. Scores shown reflect only verified data.
                  </p>
                  <ul className="mt-2 text-sm text-amber-700 list-disc list-inside">
                    {missingSources.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <PdfDownloadButton audit={audit} />
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied to clipboard");
            }}
          >
            <Share2 className="h-3.5 w-3.5" /> Share link
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" asChild>
            <Link href="/new-audit">
              <RefreshCw className="h-3.5 w-3.5" /> Re-run audit
            </Link>
          </Button>
        </div>
      </div>

      {/* About the Brand */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4">About the Brand</h2>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">{audit.aboutBrand}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <ExternalLink className="h-3.5 w-3.5" />
            <a href={audit.brandUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              {audit.brandUrl}
            </a>
            {audit.instagramHandle && (
              <span>· {audit.instagramHandle}</span>
            )}
          </div>
        </div>
      </section>

      {/* 6 Sub-score cards */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Dimension Breakdown</h2>
          <Link href="/scoring-methodology#dimensions" className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />How are these scores calculated?
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dimensions.map(({ key, title }) => (
            <SubScoreCard
              key={key}
              title={title}
              detail={audit[key] as Audit["pdp"]}
              dataStatus={getDimStatus(audit, key)}
            />
          ))}
        </div>
      </section>

      {/* Why-Why Analysis */}
      {audit.whyWhyAnalysis.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-lg font-bold text-foreground">Root Cause Analysis</h2>
            <Link href="/scoring-methodology#root-cause" className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />How does root cause analysis work?
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mb-4">3-level why-why cascade for dimensions scoring below 70</p>
          <div className="space-y-6">
            {audit.whyWhyAnalysis.map((item) => (
              <div key={item.dimension} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-5">
                  <ScoreGauge score={item.score} size="sm" />
                  <div>
                    <h3 className="font-semibold text-foreground">{item.dimension}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.score !== null ? `Score: ${item.score}/100` : "Score: N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {item.levels.map((level, i) => (
                    <div key={level.level} className="relative">
                      <div className={cn(
                        "rounded-lg p-4 border",
                        level.level === "L1" ? "border-red-200 bg-red-50" :
                        level.level === "L2" ? "border-amber-200 bg-amber-50" :
                        "border-emerald-200 bg-emerald-50"
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-xs font-bold px-1.5 py-0.5 rounded",
                            level.level === "L1" ? "bg-red-200 text-red-800" :
                            level.level === "L2" ? "bg-amber-200 text-amber-800" :
                            "bg-emerald-200 text-emerald-800"
                          )}>
                            {level.level}
                          </span>
                          <span className="text-xs font-semibold text-foreground">{level.label}</span>
                        </div>
                        <p className="text-sm text-foreground">{level.content}</p>
                      </div>
                      {i < item.levels.length - 1 && (
                        <div className="flex justify-center py-1">
                          <ArrowDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top 3 Recommendations */}
      <section>
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="text-lg font-bold text-foreground">Top 3 Growth Recommendations</h2>
          <Link href="/scoring-methodology#recommendations" className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />How is ICE prioritization calculated?
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mb-4">ICE-prioritised · Impact × Confidence × Ease</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {audit.recommendations.map((rec, i) => (
            <RecommendationCard key={i} rec={rec} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* Competitor Benchmarking */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-1">Competitor Benchmarking</h2>
        <p className="text-sm text-muted-foreground mb-4">{audit.competitorTakeaway}</p>

        <div className="rounded-xl border border-border bg-card overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Brand</th>
                {["Health", "PDP", "Creative", "Social", "Funnel", "Retention", "SEO"].map((h) => (
                  <th key={h} className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {audit.competitorBenchmark.map((c) => (
                <tr
                  key={c.brand}
                  className={cn(
                    "transition-colors",
                    c.isAudited ? "bg-primary/5 font-semibold" : "hover:bg-secondary/30"
                  )}
                >
                  <td className="p-3 text-sm">
                    {c.brand}
                    {c.isAudited && <span className="ml-1.5 text-xs text-primary">(you)</span>}
                  </td>
                  {[c.brandHealth, c.pdp, c.creative, c.social, c.funnel, c.retention, c.seo].map((score, i) => (
                    <td key={i} className="p-3 text-center">
                      <span
                        className="font-mono text-xs font-semibold"
                        style={{ color: score !== null ? scoreColor(score) : "rgb(156 163 175)" }}
                      >
                        {score !== null ? score : "—"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Brand Health Comparison ({competitorData.length} brands)
          </p>
          <ResponsiveContainer width="100%" height={Math.max(160, competitorData.length * 36)}>
            <BarChart
              data={competitorData}
              layout={competitorData.length > 4 ? "vertical" : "horizontal"}
            >
              {competitorData.length > 4 ? (
                <>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} hide />
                </>
              )}
              <Tooltip formatter={(v) => [v, "Brand Health"]} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {competitorData.map((c, i) => (
                  <Cell key={i} fill={c.isAudited ? "rgb(79 70 229)" : "rgb(203 213 225)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" /> Your brand
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-300" /> Competitor
            </span>
          </div>
        </div>
      </section>

      {/* Upsell Priority Summary */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-1">Action Priority Summary</h2>
        <p className="text-sm text-muted-foreground mb-4">Prioritised actions with pitch angles for each growth lever</p>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Service</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Status</th>
                <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priority</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pitch Angle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {audit.upsellPriority.map((row) => (
                <tr key={row.service} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-3 font-medium text-foreground">{row.service}</td>
                  <td className="p-3 text-muted-foreground text-xs">{row.currentStatus}</td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white",
                        row.priority <= 2 ? "bg-red-500" :
                        row.priority <= 4 ? "bg-amber-500" :
                        "bg-emerald-500"
                      )}
                    >
                      {row.priority}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{row.pitchAngle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Strategic One-Liner */}
      <section>
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Strategic Diagnosis</p>
          <blockquote className="text-lg font-semibold text-foreground leading-relaxed max-w-3xl mx-auto">
            &ldquo;{audit.strategicOneLiner}&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Raw Scraped Data (Debug) */}
      {audit.raw_contexts && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Raw Scraped Data (Debug)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This section is only visible during debugging to verify the exact payload retrieved by the scraper before AI analysis.
          </p>
          <div className="space-y-6">
            {(['website', 'meta', 'instagram'] as const).map((source) => (
              audit.raw_contexts?.[source] && (
                <div key={source} className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="bg-secondary/50 px-4 py-2 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{source} Content</h3>
                  </div>
                  <div className="p-4 bg-black">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {audit.raw_contexts[source]}
                    </pre>
                  </div>
                </div>
              )
            ))}
          </div>
        </section>
      )}

      {/* Footer metadata */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 pb-2">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span>Generated: {format(audit.createdAt, "d MMM yyyy, HH:mm")}</span>
        </div>
        <div className="flex gap-2">
          <PdfDownloadButton audit={audit} />
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied to clipboard");
            }}
          >
            <Share2 className="h-3.5 w-3.5" /> Share link
          </Button>
        </div>
      </div>
    </div>
  );
}
