export interface ScraperSignals {
  has_email_signup: boolean;
  has_loyalty_program: boolean;
  has_reviews: boolean;
  has_cart_cta: boolean;
  cta_count: number;
}

export interface ScraperPage {
  status: "success" | "blocked";
  title: string;
  meta_description?: string;
  headings?: string[];
  content?: string;
  signals?: ScraperSignals;
  internal_links?: string[];
}

export async function warmUpScraper(timeoutMs = 90_000): Promise<boolean> {
  const base = process.env.SCRAPER_API_URL;
  if (!base) return false;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${base}/`, { signal: AbortSignal.timeout(5_000) });
      if (r.ok) return true;
    } catch { /* cold */ }
    await new Promise((r) => setTimeout(r, 3_000));
  }
  return false;
}

export async function scrapeUrl(
  url: string,
  target: "website" | "meta" | "instagram",
  timeoutMs = 90_000
): Promise<Record<string, unknown> | null> {
  const base = process.env.SCRAPER_API_URL;
  if (!base) return null;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(
      `${base}/scrape?url=${encodeURIComponent(url)}&target=${target}`,
      { signal: controller.signal }
    );
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function yn(v: boolean): string {
  return v ? "yes" : "no";
}

export function buildWebsiteContext(
  website: ScraperPage,
  productPage: ScraperPage | null
): string {
  const p: string[] = ["--- HOMEPAGE DATA ---"];

  if (website.status === "success") {
    if (website.title) p.push(`Title: ${website.title}`);
    if (website.meta_description) p.push(`Meta Description: ${website.meta_description}`);
    if (website.headings?.length) p.push(`Headings: ${website.headings.join(" | ")}`);
    if (website.signals) {
      const s = website.signals;
      p.push(
        `Signals: Email signup: ${yn(s.has_email_signup)}, Loyalty program: ${yn(s.has_loyalty_program)}, Reviews: ${yn(s.has_reviews)}, Cart CTA: ${yn(s.has_cart_cta)}, CTA count: ${s.cta_count}`
      );
    }
    if (website.content) p.push(`Content: ${website.content.slice(0, 3000)}`);
  } else {
    p.push("Homepage scraping blocked by anti-bot protection");
  }

  p.push("\n--- PRODUCT PAGE DATA ---");
  if (!productPage) {
    p.push("No product page URL provided - infer PDP details from homepage content");
  } else if (productPage.status === "success") {
    if (productPage.title) p.push(`Title: ${productPage.title}`);
    if (productPage.headings?.length) p.push(`Headings: ${productPage.headings.join(" | ")}`);
    if (productPage.signals) {
      const s = productPage.signals;
      p.push(
        `Signals: Email signup: ${yn(s.has_email_signup)}, Reviews: ${yn(s.has_reviews)}, Cart CTA: ${yn(s.has_cart_cta)}, CTA count: ${s.cta_count}`
      );
    }
    if (productPage.content) p.push(`Content: ${productPage.content.slice(0, 2000)}`);
  } else {
    p.push("Product page scraping blocked by anti-bot protection");
  }

  return p.join("\n");
}
