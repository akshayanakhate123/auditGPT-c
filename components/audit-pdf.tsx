"use client";

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { Audit } from "@/lib/mock-data";

// ─── Colours ──────────────────────────────────────────────────────────────────
const C = {
  primary: "#4F46E5",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  bg: "#F9FAFB",
  good: "#10B981",
  warn: "#F59E0B",
  bad: "#EF4444",
  white: "#FFFFFF",
  dark: "#1F2937",
};

function scoreCol(s: number | null) {
  if (s === null) return C.muted;
  return s >= 70 ? C.good : s >= 40 ? C.warn : C.bad;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: C.text, padding: "36 44", backgroundColor: C.white },
  // header bar
  headerBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 12, borderBottomWidth: 1.5, borderBottomColor: C.primary },
  logoBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoIcon: { width: 20, height: 20, backgroundColor: C.primary, borderRadius: 4, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.primary },
  headerRight: { alignItems: "flex-end" },
  brandName: { fontSize: 15, fontFamily: "Helvetica-Bold", color: C.dark },
  brandMeta: { fontSize: 8, color: C.muted, marginTop: 2 },
  // score pill
  scorePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  scoreText: { fontFamily: "Helvetica-Bold", color: C.white },
  // section
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 8, marginTop: 16 },
  card: { backgroundColor: C.bg, borderRadius: 6, padding: "10 12", marginBottom: 8 },
  row: { flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  // overview grid
  dimTile: { flex: 1, backgroundColor: C.bg, borderRadius: 6, padding: "8 10", alignItems: "center" },
  dimTileScore: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  dimTileLabel: { fontSize: 7, color: C.muted, textAlign: "center" },
  // sub-metrics
  metricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: C.border },
  metricName: { fontSize: 8, color: C.text, flex: 1 },
  metricBar: { flexDirection: "row", alignItems: "center", gap: 4, width: 90 },
  barTrack: { flex: 1, height: 4, backgroundColor: C.border, borderRadius: 2 },
  barFill: { height: 4, borderRadius: 2 },
  metricVal: { fontSize: 8, fontFamily: "Helvetica-Bold", width: 22, textAlign: "right" },
  // bullets
  bullet: { flexDirection: "row", gap: 5, marginBottom: 4 },
  bulletDot: { width: 5, height: 5, borderRadius: 3, marginTop: 2, flexShrink: 0 },
  bulletText: { fontSize: 8, color: C.text, flex: 1, lineHeight: 1.5 },
  // recommendation
  recCard: { backgroundColor: C.bg, borderRadius: 6, padding: "8 10", marginBottom: 6 },
  recTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 4 },
  icePill: { flexDirection: "row", gap: 4, marginBottom: 4 },
  iceChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, backgroundColor: "#EEF2FF" },
  iceChipText: { fontSize: 7, color: C.primary },
  // table
  tableHeader: { flexDirection: "row", backgroundColor: C.primary, paddingVertical: 4, paddingHorizontal: 6, borderRadius: 4, marginBottom: 2 },
  tableHeaderCell: { fontFamily: "Helvetica-Bold", color: C.white, fontSize: 7, flex: 1, textAlign: "center" },
  tableHeaderCellLeft: { fontFamily: "Helvetica-Bold", color: C.white, fontSize: 7, flex: 2 },
  tableRow: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: C.border },
  tableCell: { fontSize: 8, flex: 1, textAlign: "center" },
  tableCellLeft: { fontSize: 8, flex: 2 },
  tableAuditedRow: { backgroundColor: "#EEF2FF" },
  // why-why
  wwCard: { borderLeftWidth: 3, borderLeftColor: C.primary, paddingLeft: 8, marginBottom: 10 },
  wwDim: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 6 },
  wwLevel: { marginBottom: 4 },
  wwLevelLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.primary },
  wwLevelText: { fontSize: 8, color: C.text, lineHeight: 1.4 },
  // footer
  footer: { position: "absolute", bottom: 20, left: 44, right: 44, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { fontSize: 7, color: C.muted },
  pageNum: { fontSize: 7, color: C.muted },
});

// ─── Reusable pieces ──────────────────────────────────────────────────────────

function Header({ audit, pageLabel }: { audit: Audit; pageLabel: string }) {
  const dateStr = audit.createdAt
    ? new Date(audit.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";
  return (
    <View style={s.headerBar}>
      <View style={s.logoBox}>
        <View style={s.logoIcon}><Text style={{ fontSize: 8, color: C.white, fontFamily: "Helvetica-Bold" }}>A</Text></View>
        <Text style={s.logoText}>AuditGPT</Text>
      </View>
      <View style={s.headerRight}>
        <Text style={s.brandName}>{audit.brandName}</Text>
        <Text style={s.brandMeta}>{audit.category} · {dateStr} · {pageLabel}</Text>
      </View>
    </View>
  );
}

function Footer({ page, total }: { page: number; total: number }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Confidential — Generated by AuditGPT</Text>
      <Text style={s.pageNum}>{page} / {total}</Text>
    </View>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  return (
    <View style={[s.scorePill, { backgroundColor: scoreCol(score) }]}>
      <Text style={[s.scoreText, { fontSize: 9 }]}>{score ?? "—"}</Text>
    </View>
  );
}

function DimSection({ title, dim }: { title: string; dim: Audit["pdp"] }) {
  const hasData = dim.score !== null;
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: C.dark }}>{title}</Text>
        <ScoreBadge score={dim.score} />
      </View>

      {/* Sub-metrics */}
      <View style={s.card}>
        <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Sub-Metrics</Text>
        {hasData ? dim.subMetrics.map((m) => (
          <View key={m.name} style={s.metricRow}>
            <Text style={s.metricName}>{m.name}</Text>
            <View style={s.metricBar}>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${m.score ?? 0}%`, backgroundColor: scoreCol(m.score) }]} />
              </View>
            </View>
            <Text style={[s.metricVal, { color: scoreCol(m.score) }]}>{m.score ?? "—"}</Text>
            <Text style={{ fontSize: 7, color: C.muted, width: 28, textAlign: "right" }}>vs {m.benchmark ?? "—"}</Text>
          </View>
        )) : (
          <Text style={{ fontSize: 8, color: C.muted, fontStyle: "italic" }}>Data source not available for this dimension.</Text>
        )}
      </View>

      {/* What's working + Critical gaps */}
      <View style={s.row}>
        <View style={s.col}>
          <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.good, marginBottom: 4 }}>What's Working</Text>
          {dim.whatsWorking.map((w, i) => (
            <View key={i} style={s.bullet}>
              <View style={[s.bulletDot, { backgroundColor: C.good }]} />
              <Text style={s.bulletText}>{w}</Text>
            </View>
          ))}
        </View>
        <View style={s.col}>
          <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.bad, marginBottom: 4 }}>Critical Gaps</Text>
          {dim.criticalGaps.map((g, i) => (
            <View key={i} style={s.bullet}>
              <View style={[s.bulletDot, { backgroundColor: C.bad }]} />
              <Text style={s.bulletText}>{g}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 5, paddingTop: 5, borderTopWidth: 0.5, borderTopColor: C.border }}>
        <Text style={{ fontSize: 7.5, color: C.muted, fontStyle: "italic", lineHeight: 1.5 }}>{dim.whyThisScore}</Text>
      </View>
    </View>
  );
}

// ─── Main Document ────────────────────────────────────────────────────────────

export function AuditPdf({ audit }: { audit: Audit }) {
  const TOTAL_PAGES = 5;
  const dims = [
    { title: "PDP Health", key: "pdp" as const },
    { title: "Creative", key: "creative" as const },
    { title: "Social / Content", key: "social" as const },
    { title: "Funnel", key: "funnel" as const },
    { title: "Retention", key: "retention" as const },
    { title: "SEO Footprint", key: "seo" as const },
  ];

  return (
    <Document title={`${audit.brandName} — AuditGPT Report`} author="AuditGPT">

      {/* ── PAGE 1: Cover + Overview ── */}
      <Page size="A4" style={s.page}>
        <Header audit={audit} pageLabel="Overview" />

        {/* Hero score */}
        <View style={{ alignItems: "center", marginBottom: 20, paddingVertical: 16, backgroundColor: C.bg, borderRadius: 8 }}>
          <Text style={{ fontSize: 7, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Brand Health Score</Text>
          <Text style={{ fontSize: 52, fontFamily: "Helvetica-Bold", color: scoreCol(audit.brandHealthScore), lineHeight: 1 }}>{audit.brandHealthScore ?? "—"}</Text>
          <Text style={{ fontSize: 9, color: C.muted, marginTop: 4 }}>
            {audit.brandHealthScore === null ? "Insufficient data" : audit.brandHealthScore >= 70 ? "Strong" : audit.brandHealthScore >= 40 ? "Needs Work" : "Critical"}
          </Text>
        </View>

        {/* About */}
        <View style={{ marginBottom: 14 }}>
          <Text style={s.sectionTitle}>About the Brand</Text>
          <Text style={{ fontSize: 8.5, color: C.text, lineHeight: 1.6 }}>{audit.aboutBrand}</Text>
        </View>

        {/* Executive summary */}
        <View style={{ marginBottom: 14 }}>
          <Text style={s.sectionTitle}>Executive Summary</Text>
          <View style={s.card}>
            <Text style={{ fontSize: 8.5, color: C.text, lineHeight: 1.6 }}>{audit.executiveSummary}</Text>
          </View>
          <View style={{ backgroundColor: "#EEF2FF", borderRadius: 6, padding: "8 12", borderLeftWidth: 3, borderLeftColor: C.primary }}>
            <Text style={{ fontSize: 7, color: C.primary, fontFamily: "Helvetica-Bold", marginBottom: 2 }}>Strategic One-Liner</Text>
            <Text style={{ fontSize: 8.5, color: C.dark, lineHeight: 1.5, fontStyle: "italic" }}>{audit.strategicOneLiner}</Text>
          </View>
        </View>

        {/* Dimension scores grid */}
        <Text style={s.sectionTitle}>Dimension Scores</Text>
        <View style={{ ...s.row, flexWrap: "wrap", gap: 6 }}>
          {dims.map(({ title, key }) => (
            <View key={key} style={[s.dimTile, { minWidth: "30%", maxWidth: "32%" }]}>
              <Text style={[s.dimTileScore, { color: scoreCol(audit[key].score) }]}>{audit[key].score ?? "—"}</Text>
              <Text style={s.dimTileLabel}>{title}</Text>
            </View>
          ))}
        </View>

        <Footer page={1} total={TOTAL_PAGES} />
      </Page>

      {/* ── PAGE 2: PDP + Creative ── */}
      <Page size="A4" style={s.page}>
        <Header audit={audit} pageLabel="PDP & Creative" />
        <DimSection title="PDP Health" dim={audit.pdp} />
        <DimSection title="Creative" dim={audit.creative} />
        <Footer page={2} total={TOTAL_PAGES} />
      </Page>

      {/* ── PAGE 3: Social + Funnel ── */}
      <Page size="A4" style={s.page}>
        <Header audit={audit} pageLabel="Social & Funnel" />
        <DimSection title="Social / Content" dim={audit.social} />
        <DimSection title="Funnel" dim={audit.funnel} />
        <Footer page={3} total={TOTAL_PAGES} />
      </Page>

      {/* ── PAGE 4: Retention + SEO + Recommendations ── */}
      <Page size="A4" style={s.page}>
        <Header audit={audit} pageLabel="Retention, SEO & Recommendations" />
        <DimSection title="Retention" dim={audit.retention} />
        <DimSection title="SEO Footprint" dim={audit.seo} />

        <Text style={[s.sectionTitle, { marginTop: 10 }]}>Top Recommendations</Text>
        {audit.recommendations.slice(0, 5).map((rec, i) => {
          const iceTotal = rec.ice.impact + rec.ice.confidence + rec.ice.ease;
          return (
            <View key={i} style={s.recCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                <Text style={s.recTitle}>{i + 1}. {rec.title}</Text>
                <View style={[s.scorePill, { backgroundColor: C.primary, paddingHorizontal: 6, paddingVertical: 2 }]}>
                  <Text style={{ fontSize: 7, color: C.white, fontFamily: "Helvetica-Bold" }}>ICE {iceTotal}</Text>
                </View>
              </View>
              <View style={s.icePill}>
                {[`I:${rec.ice.impact}`, `C:${rec.ice.confidence}`, `E:${rec.ice.ease}`, rec.difficulty].map((label) => (
                  <View key={label} style={s.iceChip}><Text style={s.iceChipText}>{label}</Text></View>
                ))}
                <Text style={{ fontSize: 7.5, color: C.good, fontFamily: "Helvetica-Bold", marginLeft: 4 }}>{rec.predictedImpact}</Text>
              </View>
              <Text style={{ fontSize: 8, color: C.muted, lineHeight: 1.5 }}>{rec.implementationTemplate}</Text>
            </View>
          );
        })}

        <Footer page={4} total={TOTAL_PAGES} />
      </Page>

      {/* ── PAGE 5: Competitor Benchmark + Why-Why ── */}
      <Page size="A4" style={s.page}>
        <Header audit={audit} pageLabel="Benchmarks & Root Cause" />

        <Text style={s.sectionTitle}>Competitor Benchmark</Text>
        <View style={s.tableHeader}>
          <Text style={s.tableHeaderCellLeft}>Brand</Text>
          {["Health", "PDP", "Creative", "Social", "Funnel", "Retention", "SEO"].map((h) => (
            <Text key={h} style={s.tableHeaderCell}>{h}</Text>
          ))}
        </View>
        {audit.competitorBenchmark.map((row, i) => (
          <View key={i} style={[s.tableRow, row.isAudited ? s.tableAuditedRow : {}]}>
            <Text style={[s.tableCellLeft, row.isAudited ? { fontFamily: "Helvetica-Bold", color: C.primary } : {}]}>{row.brand}{row.isAudited ? " ★" : ""}</Text>
            {[row.brandHealth, row.pdp, row.creative, row.social, row.funnel, row.retention, row.seo].map((score, j) => (
              <Text key={j} style={[s.tableCell, { color: scoreCol(score), fontFamily: "Helvetica-Bold" }]}>{score ?? "—"}</Text>
            ))}
          </View>
        ))}
        <View style={{ marginTop: 6, padding: "6 8", backgroundColor: "#EEF2FF", borderRadius: 4 }}>
          <Text style={{ fontSize: 8, color: C.dark, lineHeight: 1.5 }}>{audit.competitorTakeaway}</Text>
        </View>

        <Text style={[s.sectionTitle, { marginTop: 14 }]}>Root Cause Analysis</Text>
        {audit.whyWhyAnalysis.map((item, i) => (
          <View key={i} style={s.wwCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <Text style={s.wwDim}>{item.dimension}</Text>
              <View style={[s.scorePill, { backgroundColor: scoreCol(item.score), paddingHorizontal: 6, paddingVertical: 2 }]}>
                <Text style={{ fontSize: 7, color: C.white, fontFamily: "Helvetica-Bold" }}>{item.score ?? "—"}</Text>
              </View>
            </View>
            {item.levels.map((lvl) => (
              <View key={lvl.level} style={s.wwLevel}>
                <Text style={s.wwLevelLabel}>{lvl.level} — {lvl.label}</Text>
                <Text style={s.wwLevelText}>{lvl.content}</Text>
              </View>
            ))}
          </View>
        ))}

        <Footer page={5} total={TOTAL_PAGES} />
      </Page>

    </Document>
  );
}
