import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

const DIMENSIONS = [
  {
    id: "pdp",
    title: "PDP Health",
    weight: 20,
    color: "bg-violet-500",
    description:
      "Evaluates product page effectiveness — how well the brand's website converts visitors into buyers.",
    dataSource: null,
    subMetrics: [
      {
        name: "Hero Image Quality",
        desc: "Checks for high-resolution lifestyle/product imagery, professional quality, above-the-fold placement, and alt text for accessibility.",
      },
      {
        name: "Copy Clarity",
        desc: "Assesses headline clarity, benefit-driven product descriptions, scannable formatting, and absence of jargon or walls of text.",
      },
      {
        name: "Social Proof Density",
        desc: "Looks for visible review counts, star ratings, testimonials, trust badges, and user-generated content on the product page.",
      },
      {
        name: "CTA Prominence",
        desc: "Evaluates Add-to-Cart / Buy Now button visibility, color contrast, placement above the fold, and clarity of the call-to-action.",
      },
      {
        name: "Trust Signals",
        desc: "Checks for secure checkout badges, return policy visibility, shipping info, certifications, and money-back guarantees.",
      },
      {
        name: "Mobile UX",
        desc: "Assesses responsive design, tap target sizes, mobile page speed signals, and mobile-friendly navigation.",
      },
    ],
  },
  {
    id: "creative",
    title: "Creative",
    weight: 15,
    color: "bg-pink-500",
    description:
      "Evaluates paid advertising creative strategy — variety, freshness, and effectiveness of Meta/Facebook ads.",
    dataSource: 'Requires Meta Ad Library screenshot upload. Without it, this dimension shows "No data."',
    subMetrics: [
      {
        name: "Image-to-Video Ratio",
        desc: "Checks the balance between static image ads and video ads. A healthy mix (40–60% video) indicates creative maturity.",
      },
      {
        name: "Active Ad Count",
        desc: "Number of currently running ads. More active ads suggest active testing and optimization.",
      },
      {
        name: "Creative Refresh Rate",
        desc: "How frequently new creatives are introduced. Stale ads lead to creative fatigue and rising CPAs.",
      },
      {
        name: "Hook Diversity",
        desc: "Variety in ad opening hooks — different angles, pain points, and attention-grabbers across the ad portfolio.",
      },
      {
        name: "UGC Integration",
        desc: "Presence of user-generated content in ads — unboxing videos, customer testimonials, influencer content.",
      },
      {
        name: "Brand Consistency",
        desc: "Visual coherence across ads — consistent color palette, typography, logo placement, and brand voice.",
      },
    ],
  },
  {
    id: "social",
    title: "Social / Content Authority",
    weight: 15,
    color: "bg-sky-500",
    description:
      "Evaluates organic social media presence and content strategy on Instagram.",
    dataSource: 'Requires Instagram profile screenshot upload. Without it, this dimension shows "No data."',
    subMetrics: [
      {
        name: "Follower Count",
        desc: "Total followers relative to brand maturity and category average.",
      },
      {
        name: "Post Frequency",
        desc: "Consistency of posting schedule — regular posting signals an active content strategy.",
      },
      {
        name: "Reels Ratio",
        desc: "Proportion of Reels vs static posts. Instagram's algorithm favors Reels for organic reach.",
      },
      {
        name: "Avg. Engagement Rate",
        desc: "Likes + comments divided by followers, per post. Industry benchmark is 1–3% for D2C.",
      },
      {
        name: "UGC Volume",
        desc: "Amount of user-generated content visible — reposts, tagged content, community highlights.",
      },
      {
        name: "Community Response Rate",
        desc: "How actively the brand responds to comments and engages with followers.",
      },
    ],
  },
  {
    id: "funnel",
    title: "Funnel",
    weight: 20,
    color: "bg-amber-500",
    description:
      "Evaluates the conversion funnel from awareness to purchase — how smoothly visitors move through the buying journey.",
    dataSource: null,
    subMetrics: [
      {
        name: "Awareness to Landing",
        desc: "Effectiveness of the homepage in communicating the brand's value proposition within 5 seconds.",
      },
      {
        name: "Landing to PDP",
        desc: "How easily visitors discover and navigate to product pages — navigation clarity, search, categories.",
      },
      {
        name: "PDP to Cart",
        desc: "Product page elements that drive add-to-cart actions — pricing visibility, variant selection, urgency cues.",
      },
      {
        name: "Cart to Checkout",
        desc: "Cart experience — visibility of cart contents, cross-sell integration, guest checkout availability.",
      },
      {
        name: "Checkout Completion",
        desc: "Checkout friction — number of steps, payment options, trust signals at checkout, form simplicity.",
      },
      {
        name: "Persona Mapping",
        desc: "Evidence that the site speaks to defined customer segments — personalized messaging, segment-specific landing pages.",
      },
    ],
  },
  {
    id: "retention",
    title: "Retention",
    weight: 15,
    color: "bg-emerald-500",
    description:
      "Evaluates post-purchase strategy — how well the brand retains customers and drives repeat purchases.",
    dataSource: null,
    subMetrics: [
      {
        name: "Email Automation",
        desc: "Presence of email capture forms, welcome flows, abandoned cart emails, post-purchase sequences.",
      },
      {
        name: "SMS Channel",
        desc: "SMS opt-in presence and evidence of SMS marketing integration.",
      },
      {
        name: "Loyalty Programme",
        desc: "Existence of a points/rewards/VIP loyalty program to incentivize repeat purchases.",
      },
      {
        name: "Subscription Mechanics",
        desc: "Subscribe-and-save options, auto-replenishment, or membership models for recurring revenue.",
      },
      {
        name: "Win-Back Flow",
        desc: "Evidence of re-engagement campaigns — 'we miss you' offers, lapsed customer targeting.",
      },
      {
        name: "Review Collection",
        desc: "Active review solicitation — post-purchase review requests, review incentives, review display.",
      },
    ],
  },
  {
    id: "seo",
    title: "SEO",
    weight: 15,
    color: "bg-indigo-500",
    description:
      "Evaluates search engine optimization — the brand's organic discoverability and search presence.",
    dataSource: null,
    subMetrics: [
      {
        name: "Domain Authority",
        desc: "Overall site authority based on backlink profile and domain age. Benchmarked against category.",
      },
      {
        name: "Blog Content Volume",
        desc: "Presence and depth of blog/content marketing — number of articles, content freshness.",
      },
      {
        name: "Keyword Coverage",
        desc: "Whether the site targets relevant product and category keywords in titles, headings, and content.",
      },
      {
        name: "On-Page SEO",
        desc: "Meta titles, meta descriptions, heading hierarchy (H1/H2/H3), image alt text, URL structure.",
      },
      {
        name: "Backlink Profile",
        desc: "Quality and quantity of external sites linking to the brand — indicates domain authority growth.",
      },
      {
        name: "Category SEO",
        desc: "Presence of optimized category/collection pages with descriptive content, not just product grids.",
      },
    ],
  },
];

const SCORE_RANGES = [
  { range: "0 – 30", label: "Critical", bg: "bg-red-100", text: "text-red-700", bar: "bg-red-500" },
  { range: "31 – 50", label: "Below Average", bg: "bg-orange-100", text: "text-orange-700", bar: "bg-orange-500" },
  { range: "51 – 65", label: "Average", bg: "bg-amber-100", text: "text-amber-700", bar: "bg-amber-500" },
  { range: "66 – 79", label: "Strong", bg: "bg-emerald-100", text: "text-emerald-700", bar: "bg-emerald-500" },
  { range: "80 – 100", label: "Exceptional", bg: "bg-green-100", text: "text-green-700", bar: "bg-green-500" },
];

const ICE_FIELDS = [
  {
    key: "Impact",
    range: "1 – 10",
    desc: "How much will this move the needle? Considers potential revenue impact, conversion improvement, and user experience gains.",
  },
  {
    key: "Confidence",
    range: "1 – 10",
    desc: "How certain are we that this will work? Based on the strength of evidence from the audit data and industry benchmarks.",
  },
  {
    key: "Ease",
    range: "1 – 10",
    desc: "How easy is this to implement? Considers technical complexity, time required, and resources needed.",
  },
];

export default async function ScoringMethodologyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const userDisplay = {
    name:
      (user.user_metadata?.full_name as string | undefined) ??
      user.email ??
      "",
    email: user.email ?? "",
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={userDisplay} isAuthenticated />

      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Scoring Methodology
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              How AuditGPT calculates every score in your audit report.
            </p>
          </div>

          {/* Anchor nav */}
          <nav className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border mb-8 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium">
              {[
                { href: "#brand-health", label: "Brand Health" },
                { href: "#dimensions", label: "Dimensions" },
                { href: "#root-cause", label: "Root Cause" },
                { href: "#recommendations", label: "Recommendations" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </nav>

          <div className="space-y-12">
            {/* ── SECTION 1: Brand Health ── */}
            <section id="brand-health">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Brand Health Score</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A single composite score (0–100) representing your brand's
                    overall D2C execution across six dimensions.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Formula */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Weighted Average Formula
                    </h3>
                    <div className="rounded-lg bg-secondary/60 border border-border p-4 font-mono text-sm text-foreground leading-relaxed">
                      Brand Health =<br />
                      &nbsp;&nbsp;PDP × 0.20 +<br />
                      &nbsp;&nbsp;Creative × 0.15 +<br />
                      &nbsp;&nbsp;Social × 0.15 +<br />
                      &nbsp;&nbsp;Funnel × 0.20 +<br />
                      &nbsp;&nbsp;Retention × 0.15 +<br />
                      &nbsp;&nbsp;SEO × 0.15
                    </div>
                  </div>

                  {/* Weight bars */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Dimension Weights
                    </h3>
                    <div className="space-y-2">
                      {DIMENSIONS.map((d) => (
                        <div key={d.id} className="flex items-center gap-3">
                          <span className="w-36 text-sm text-muted-foreground shrink-0">
                            {d.title}
                          </span>
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full ${d.color} rounded-full`}
                              style={{ width: `${d.weight * 5}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-sm font-mono font-semibold text-foreground shrink-0">
                            {d.weight}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing data note */}
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
                    <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800">
                      If any dimension has no data (not scored), Brand Health is
                      calculated as the weighted average of only the scored
                      dimensions, with weights re-normalized to sum to 1.0.
                    </p>
                  </div>

                  {/* Score ranges */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Score Ranges
                    </h3>
                    <div className="rounded-xl border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-secondary/50 border-b border-border">
                            <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Range
                            </th>
                            <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Label
                            </th>
                            <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                              Visual
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {SCORE_RANGES.map((r, i) => (
                            <tr
                              key={r.label}
                              className={
                                i % 2 === 1 ? "bg-secondary/20" : ""
                              }
                            >
                              <td className="p-3 font-mono text-sm text-foreground">
                                {r.range}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${r.bg} ${r.text}`}
                                >
                                  {r.label}
                                </span>
                              </td>
                              <td className="p-3 hidden sm:table-cell">
                                <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${r.bar} rounded-full`}
                                    style={{
                                      width: `${
                                        r.label === "Critical"
                                          ? 15
                                          : r.label === "Below Average"
                                          ? 40
                                          : r.label === "Average"
                                          ? 60
                                          : r.label === "Strong"
                                          ? 75
                                          : 95
                                      }%`,
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Most brands score between 40–75. Scores above 80 indicate
                      genuinely exceptional execution.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* ── SECTION 2: Dimension Breakdown ── */}
            <section id="dimensions">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  Dimension Breakdown
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Each dimension is scored 0–100 across 6 sub-metrics by
                  Gemini AI, grounded in scraped brand data.
                </p>
              </div>

              <div className="space-y-6">
                {DIMENSIONS.map((dim) => (
                  <Card key={dim.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`h-3 w-3 rounded-full ${dim.color}`}
                            />
                            <CardTitle className="text-base">
                              {dim.title}
                            </CardTitle>
                            <span className="text-xs font-mono font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                              {dim.weight}% weight
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {dim.description}
                          </p>
                        </div>
                      </div>
                      {dim.dataSource && (
                        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 flex gap-2">
                          <Info className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                          <p className="text-xs text-amber-800">
                            {dim.dataSource}
                          </p>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-xl border border-border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-secondary/50 border-b border-border">
                              <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-40">
                                Sub-metric
                              </th>
                              <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                What it evaluates
                              </th>
                              <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24 hidden sm:table-cell">
                                Score range
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {dim.subMetrics.map((sm, i) => (
                              <tr
                                key={sm.name}
                                className={
                                  i % 2 === 1 ? "bg-secondary/20" : ""
                                }
                              >
                                <td className="p-3 font-medium text-foreground align-top">
                                  {sm.name}
                                </td>
                                <td className="p-3 text-muted-foreground align-top leading-relaxed">
                                  {sm.desc}
                                </td>
                                <td className="p-3 text-center align-top font-mono text-xs text-muted-foreground hidden sm:table-cell">
                                  0 – 100
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-border bg-secondary/30 px-4 py-3 flex gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Each sub-metric is scored 0–100. The dimension score is the
                  AI's overall assessment of the dimension based on all
                  sub-metric evaluations and their relative importance.
                </p>
              </div>
            </section>

            {/* ── SECTION 3: Root Cause Analysis ── */}
            <section id="root-cause">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Root Cause Analysis — Why-Why Cascade
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    The 3 lowest-scoring dimensions automatically receive a
                    3-level root cause analysis.
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    {[
                      {
                        level: "L1",
                        label: "Surface Issue",
                        desc: "The visible symptom — what is observably broken or underperforming.",
                        border: "border-red-200",
                        bg: "bg-red-50",
                        badge: "bg-red-200 text-red-800",
                      },
                      {
                        level: "L2",
                        label: "Underlying Cause",
                        desc: "The operational or strategic reason behind the surface issue.",
                        border: "border-amber-200",
                        bg: "bg-amber-50",
                        badge: "bg-amber-200 text-amber-800",
                      },
                      {
                        level: "L3",
                        label: "Root Cause",
                        desc: "The fundamental business or capability gap that, if addressed, would resolve both L1 and L2.",
                        border: "border-emerald-200",
                        bg: "bg-emerald-50",
                        badge: "bg-emerald-200 text-emerald-800",
                      },
                    ].map((l) => (
                      <div
                        key={l.level}
                        className={`rounded-lg border ${l.border} ${l.bg} p-4`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded ${l.badge}`}
                          >
                            {l.level}
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {l.label}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{l.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This framework is based on the{" "}
                      <span className="font-medium text-foreground">
                        Five Whys methodology
                      </span>{" "}
                      used in lean management and product development. By
                      tracing surface problems to their root cause, brands can
                      prioritize fixes that solve multiple issues at once.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* ── SECTION 4: ICE Scoring ── */}
            <section id="recommendations">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Growth Recommendations — ICE Scoring
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Recommendations are ranked using the ICE prioritization
                    framework, a standard product management technique.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* ICE fields table */}
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-secondary/50 border-b border-border">
                          <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">
                            Factor
                          </th>
                          <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20 hidden sm:table-cell">
                            Scale
                          </th>
                          <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Definition
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {ICE_FIELDS.map((f, i) => (
                          <tr
                            key={f.key}
                            className={i % 2 === 1 ? "bg-secondary/20" : ""}
                          >
                            <td className="p-3 font-semibold text-foreground">
                              {f.key}
                            </td>
                            <td className="p-3 font-mono text-xs text-muted-foreground hidden sm:table-cell">
                              {f.range}
                            </td>
                            <td className="p-3 text-muted-foreground leading-relaxed">
                              {f.desc}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Formula */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      ICE Formula
                    </h3>
                    <div className="rounded-lg bg-secondary/60 border border-border p-4 font-mono text-sm text-foreground">
                      ICE Total = Impact × Confidence × Ease
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Higher total = higher priority. A recommendation scoring{" "}
                      <span className="font-mono font-semibold text-foreground">
                        8 × 7 × 9 = 504
                      </span>{" "}
                      ranks above one scoring{" "}
                      <span className="font-mono font-semibold text-foreground">
                        6 × 5 × 4 = 120
                      </span>
                      .
                    </p>
                  </div>

                  {/* Difficulty labels */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Difficulty Labels
                    </h3>
                    <div className="space-y-2">
                      {[
                        {
                          label: "Easy",
                          desc: "Can be done in days with no engineering.",
                          bg: "bg-emerald-100",
                          text: "text-emerald-700",
                        },
                        {
                          label: "Medium",
                          desc: "Requires some technical work or cross-team coordination.",
                          bg: "bg-amber-100",
                          text: "text-amber-700",
                        },
                        {
                          label: "Hard",
                          desc: "Significant engineering, budget, or organizational change needed.",
                          bg: "bg-red-100",
                          text: "text-red-700",
                        },
                      ].map((d) => (
                        <div
                          key={d.label}
                          className="flex items-start gap-3 rounded-lg border border-border p-3"
                        >
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold shrink-0 mt-0.5 ${d.bg} ${d.text}`}
                          >
                            {d.label}
                          </span>
                          <p className="text-sm text-muted-foreground">
                            {d.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      The top 3–5 recommendations are shown, sorted by ICE
                      total from highest to lowest.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
