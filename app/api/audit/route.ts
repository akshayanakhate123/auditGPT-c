import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAudit, DataAvailability } from "@/lib/groq";
import { AuditOutput } from "@/lib/rubric";
import { z } from "zod";

export const maxDuration = 200;

const RequestSchema = z.object({
  brandName: z.string().min(1),
  brandUrl: z.string().url(),
  product_url: z.string().url().optional(),
  category: z.string().min(1),
});

// ── Scraper types ──────────────────────────────────────────────────────────────

interface ScraperSignals {
  has_email_signup: boolean;
  has_loyalty_program: boolean;
  has_reviews: boolean;
  has_cart_cta: boolean;
  cta_count: number;
}

interface ScraperPage {
  status: "success" | "blocked";
  title: string;
  meta_description?: string;
  headings?: string[];
  content?: string;
  signals?: ScraperSignals;
  internal_links?: string[];
}

interface ScraperResult {
  website: ScraperPage;
  product_page: ScraperPage | null;
  meta: { status: "success" | "blocked"; content: string } | null;
  instagram: { status: "success" | "blocked"; content: string } | null;
  competitors: { status: "success" | "blocked"; content?: string; title?: string }[];
}

// ── Scraper call ───────────────────────────────────────────────────────────────

async function callScraper(params: {
  website_url: string;
  product_url?: string;
}): Promise<ScraperResult | null> {
  const scraperUrl = process.env.SCRAPER_API_URL;
  if (!scraperUrl) return null;

  // Retry-loop warm-up: poll until Railway responds or 90s deadline
  const wakeStart = Date.now();
  const wakeDeadline = wakeStart + 90_000;
  let railwayReady = false;
  while (Date.now() < wakeDeadline) {
    try {
      const r = await fetch(`${scraperUrl}/`, { signal: AbortSignal.timeout(5_000) });
      if (r.ok) { railwayReady = true; break; }
    } catch { /* still cold */ }
    await new Promise((res) => setTimeout(res, 3_000));
  }
  console.log(`[scraper] warm-up: railwayReady=${railwayReady} elapsed=${Date.now() - wakeStart}ms`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const get = async (url: string, target: string, timeoutMs = 90_000): Promise<any | null> => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(
        `${scraperUrl}/scrape?url=${encodeURIComponent(url)}&target=${target}`,
        { signal: controller.signal }
      );
      console.log(`[scraper] ${target} HTTP ${res.status}`);
      if (!res.ok) return null;
      const json = await res.json();
      console.log(`[scraper] ${target} status=${json.status}${json.reason ? ` reason="${json.reason}"` : ""}`);
      return json;
    } catch (e) {
      console.log(`[scraper] ${target} error: ${e instanceof Error ? e.message : String(e)}`);
      return null;
    } finally {
      clearTimeout(t);
    }
  };

  const website = await get(params.website_url, "website");
  const productPage = params.product_url
    ? await get(params.product_url, "website")
    : null;

  console.log(`[scraper] results: website=${website?.status ?? "null"} product_page=${productPage?.status ?? "null"}`);
  if (!website) return null;

  return {
    website,
    product_page: productPage ?? null,
    meta: null,
    instagram: null,
    competitors: [],
  };
}

// ── Context builders ───────────────────────────────────────────────────────────

function yn(v: boolean) {
  return v ? "yes" : "no";
}

function buildScrapedContext(data: ScraperResult): string {
  const parts: string[] = [];

  parts.push("--- HOMEPAGE DATA ---");
  if (data.website.status === "success") {
    if (data.website.title) parts.push(`Title: ${data.website.title}`);
    if (data.website.meta_description) parts.push(`Meta Description: ${data.website.meta_description}`);
    if (data.website.headings?.length) parts.push(`Headings: ${data.website.headings.join(" | ")}`);
    if (data.website.signals) {
      const s = data.website.signals;
      parts.push(
        `Signals: Email signup: ${yn(s.has_email_signup)}, Loyalty program: ${yn(s.has_loyalty_program)}, Reviews: ${yn(s.has_reviews)}, Cart CTA: ${yn(s.has_cart_cta)}, CTA count: ${s.cta_count}`
      );
    }
    if (data.website.content) parts.push(`Content: ${data.website.content.slice(0, 3000)}`);
  } else {
    parts.push("Homepage scraping blocked by anti-bot protection");
  }

  parts.push("\n--- PRODUCT PAGE DATA ---");
  if (!data.product_page) {
    parts.push("No product page URL provided - infer PDP details from homepage content");
  } else if (data.product_page.status === "success") {
    if (data.product_page.title) parts.push(`Title: ${data.product_page.title}`);
    if (data.product_page.headings?.length) parts.push(`Headings: ${data.product_page.headings.join(" | ")}`);
    if (data.product_page.signals) {
      const s = data.product_page.signals;
      parts.push(
        `Signals: Email signup: ${yn(s.has_email_signup)}, Reviews: ${yn(s.has_reviews)}, Cart CTA: ${yn(s.has_cart_cta)}, CTA count: ${s.cta_count}`
      );
    }
    if (data.product_page.content) parts.push(`Content: ${data.product_page.content.slice(0, 2000)}`);
  } else {
    parts.push("Product page scraping blocked by anti-bot protection - infer PDP details from homepage content");
  }

  parts.push("\n--- META AD LIBRARY DATA ---");
  if (!data.meta) {
    parts.push("Meta Ad Library link not provided - infer Creative scores from brand context and category benchmarks");
  } else if (data.meta.status === "success") {
    parts.push(`Content: ${data.meta.content.slice(0, 2000)}`);
  } else {
    parts.push("Meta Ad Library scraping blocked by anti-bot protection - infer Creative scores from brand context and category benchmarks");
  }

  parts.push("\n--- INSTAGRAM DATA ---");
  if (!data.instagram) {
    parts.push("Instagram handle not provided - infer Social/Content Authority scores from brand context and category benchmarks");
  } else if (data.instagram.status === "success") {
    parts.push(`Content: ${data.instagram.content.slice(0, 2000)}`);
  } else {
    parts.push("Instagram scraping blocked by anti-bot protection - infer Social/Content Authority scores from brand context and category benchmarks");
  }

  parts.push("\n--- COMPETITOR DATA ---");
  const scraped = data.competitors.filter((c) => c.status === "success");
  if (!data.competitors.length || !scraped.length) {
    parts.push("No competitor data available - use category benchmarks for comparison");
  } else {
    for (const comp of scraped) {
      parts.push(`Competitor: ${comp.title ?? "Unknown"} - ${(comp.content ?? "").slice(0, 1000)}`);
    }
  }

  return parts.join("\n");
}

function buildDimensionAvailability(data: ScraperResult | null): DataAvailability {
  if (!data) {
    return {
      pdp_health: "NO_DATA",
      creative: "NO_DATA",
      social: "NO_DATA",
      funnel: "NO_DATA",
      retention: "NO_DATA",
      seo: "NO_DATA",
    };
  }
  const websiteOk = data.website.status === "success";
  const productPageOk = data.product_page?.status === "success" ?? false;
  const metaOk = data.meta?.status === "success" ?? false;
  const instagramOk = data.instagram?.status === "success" ?? false;

  return {
    pdp_health: websiteOk || productPageOk ? "HAS_DATA" : "NO_DATA",
    creative:   metaOk      ? "HAS_DATA" : "NO_DATA",
    social:     instagramOk ? "HAS_DATA" : "NO_DATA",
    funnel:     websiteOk   ? "HAS_DATA" : "NO_DATA",
    retention:  websiteOk   ? "HAS_DATA" : "NO_DATA",
    seo:        websiteOk   ? "HAS_DATA" : "NO_DATA",
  };
}

function computeBrandHealth(result: AuditOutput): number | null {
  const scores = [
    result.pdp.score,
    result.creative.score,
    result.social.score,
    result.funnel.score,
    result.retention.score,
    result.seo.score,
  ].filter((s): s is number => s !== null);

  if (!scores.length) return null;
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { brandName, brandUrl, product_url, category } = parsed.data;

  const { data: auditRow, error: insertError } = await supabase
    .from("audits")
    .insert({
      user_id: user.id,
      brand_name: brandName,
      brand_url: brandUrl,
      category,
      meta_ad_url: null,
      instagram_handle: null,
      competitor_urls: [],
      status: "processing",
    })
    .select("id")
    .single();

  if (insertError || !auditRow) {
    return NextResponse.json({ error: "Failed to create audit record" }, { status: 500 });
  }

  const auditId = auditRow.id;

  try {
    // Call scraper — 90s timeout, gracefully degrade on any failure
    const scraperData = await callScraper({
      website_url: brandUrl,
      product_url: product_url || undefined,
    });

    const scrapedContext = scraperData ? buildScrapedContext(scraperData) : undefined;
    const dataAvailability = buildDimensionAvailability(scraperData);

    const result = await generateAudit({
      brandName,
      brandUrl,
      category,
      scrapedContext,
      dataAvailability,
    });

    // Server-side brand health: average of non-null dimension scores only
    const brandHealthScore = computeBrandHealth(result);

    await supabase
      .from("audits")
      .update({
        status: "complete",
        brand_health_score: brandHealthScore,
        pdp_score: result.pdp.score,
        creative_score: result.creative.score,
        social_score: result.social.score,
        funnel_score: result.funnel.score,
        retention_score: result.retention.score,
        seo_score: result.seo.score,
        data: {
          ...result,
          brandHealthScore,
          id: auditId,
          userId: user.id,
          brandName,
          brandUrl,
          metaAdLibraryUrl: "",
          instagramHandle: "",
          category,
          competitorUrls: [],
          status: "complete",
          createdAt: new Date().toISOString(),
          rubricVersion: "1.0",
          modelVersion: "llama-3.3-70b-versatile",
          recommendations: result.recommendations.map((r) => ({ ...r, done: false, saved: false })),
          data_sources: dataAvailability,
        },
      })
      .eq("id", auditId);

    return NextResponse.json({ id: auditId });
  } catch (err) {
    await supabase.from("audits").update({ status: "failed" }).eq("id", auditId);
    const message = err instanceof Error ? err.message : String(err);
    console.error("Groq audit generation failed:", err);
    return NextResponse.json({ error: "Audit generation failed. Please try again.", detail: message }, { status: 500 });
  }
}
