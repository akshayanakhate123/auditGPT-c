"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";

const CATEGORIES = [
  "Beauty", "Fashion", "F&B", "Wellness", "Electronics",
  "Home Decor", "Jewelry", "Footwear", "Pet", "Baby",
  "Personal Care", "Supplements", "Other",
];

type SectionStatus = "pending" | "running" | "done" | "skipped" | "error";

const SECTION_LABELS = [
  "Creating audit record",
  "Analyzing website & product page",
  "Analyzing Meta Ad creatives",
  "Analyzing Instagram",
  "Analyzing competitors",
  "Building your report",
];

export default function NewAuditPage() {
  const router = useRouter();
  const { user } = useUser();
  const [state, setState] = useState<"form" | "loading">("form");
  const [sectionStatuses, setSectionStatuses] = useState<SectionStatus[]>(
    SECTION_LABELS.map(() => "pending")
  );

  const [form, setForm] = useState({
    brandName: "",
    brandUrl: "",
    product_url: "",
    category: "",
    metaAdUrl: "",
    instagramHandle: "",
    competitors: [""] as string[],
  });

  function setField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setCompetitor(idx: number, value: string) {
    setForm((f) => {
      const competitors = [...f.competitors];
      competitors[idx] = value;
      return { ...f, competitors };
    });
  }

  function addCompetitor() {
    setForm((f) => ({ ...f, competitors: [...f.competitors, ""] }));
  }

  function removeCompetitor(idx: number) {
    setForm((f) => ({
      ...f,
      competitors: f.competitors.filter((_, i) => i !== idx),
    }));
  }

  function setSection(i: number, status: SectionStatus) {
    setSectionStatuses((prev) => prev.map((s, idx) => (idx === i ? status : s)));
  }

  async function postJson(url: string, body: object): Promise<Record<string, unknown>> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(
        err.detail ? `${err.error}: ${err.detail}` : (err.error ?? "Request failed")
      );
    }
    return res.json();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setSectionStatuses(SECTION_LABELS.map(() => "pending"));

    try {
      // 0. Create audit record
      setSection(0, "running");
      const { id: auditId } = await postJson("/api/audit", {
        brandName: form.brandName,
        brandUrl: form.brandUrl,
        category: form.category,
        meta_ad_url: form.metaAdUrl || undefined,
        instagram_handle: form.instagramHandle.replace(/^@/, "") || undefined,
        competitor_urls: form.competitors.filter(Boolean),
      });
      setSection(0, "done");

      // 1. Website section (always)
      setSection(1, "running");
      await postJson(`/api/audit/${auditId}/section`, {
        section: "website",
        product_url: form.product_url || undefined,
      });
      setSection(1, "done");

      // 2. Meta section (if provided)
      if (form.metaAdUrl) {
        setSection(2, "running");
        await postJson(`/api/audit/${auditId}/section`, {
          section: "meta",
          metaAdUrl: form.metaAdUrl,
        });
        setSection(2, "done");
      } else {
        setSection(2, "skipped");
      }

      // 3. Instagram section (if provided)
      const handle = form.instagramHandle.replace(/^@/, "");
      if (handle) {
        setSection(3, "running");
        await postJson(`/api/audit/${auditId}/section`, {
          section: "instagram",
          instagramHandle: handle,
        });
        setSection(3, "done");
      } else {
        setSection(3, "skipped");
      }

      // 4. Competitors section (if provided)
      const compUrls = form.competitors.filter(Boolean);
      if (compUrls.length) {
        setSection(4, "running");
        await postJson(`/api/audit/${auditId}/section`, {
          section: "competitors",
          competitorUrls: compUrls,
        });
        setSection(4, "done");
      } else {
        setSection(4, "skipped");
      }

      // 5. Finalize
      setSection(5, "running");
      await postJson(`/api/audit/${auditId}/finalize`, {});
      setSection(5, "done");

      await new Promise((r) => setTimeout(r, 800));
      router.push(`/audit/${auditId}`);
    } catch (err) {
      setState("form");
      const msg = err instanceof Error ? err.message : "Audit generation failed.";
      toast.error(msg, { duration: 10000 });
    }
  }

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar
          user={
            user
              ? { name: user.user_metadata?.full_name as string, email: user.email ?? "" }
              : undefined
          }
          isAuthenticated={!!user}
        />
        <main className="flex flex-1 items-center justify-center bg-background">
          <div className="text-center max-w-sm w-full px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-6">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Generating your audit</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Analysing <strong>{form.brandName || "your brand"}</strong> section by section
            </p>

            <div className="space-y-2 text-left">
              {SECTION_LABELS.map((label, i) => {
                const status = sectionStatuses[i];
                return (
                  <div
                    key={label}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all",
                      status === "done"
                        ? "text-emerald-600"
                        : status === "running"
                        ? "bg-primary/10 text-primary font-medium"
                        : status === "error"
                        ? "text-destructive"
                        : status === "skipped"
                        ? "text-muted-foreground opacity-60"
                        : "text-muted-foreground opacity-40"
                    )}
                  >
                    {status === "done" ? (
                      <span className="h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs shrink-0">
                        ✓
                      </span>
                    ) : status === "running" ? (
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    ) : status === "skipped" ? (
                      <span className="h-4 w-4 rounded-full border border-border flex items-center justify-center shrink-0 text-xs">
                        –
                      </span>
                    ) : status === "error" ? (
                      <span className="h-4 w-4 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 text-destructive text-xs">
                        !
                      </span>
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-border flex-shrink-0" />
                    )}
                    <span className="flex-1">{label}</span>
                    {status === "skipped" && (
                      <span className="text-xs text-muted-foreground">Skipped</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        user={
          user
            ? { name: user.user_metadata?.full_name as string, email: user.email ?? "" }
            : undefined
        }
        isAuthenticated={!!user}
      />

      <main className="flex-1 bg-background py-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">New Audit</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill in as many sections as you have — each is analysed independently.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Section 1 — Brand basics */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
                  1
                </span>
                <h2 className="font-semibold text-foreground">Brand basics</h2>
                <span className="ml-auto text-xs text-muted-foreground">Required</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brandName">Brand name *</Label>
                <Input
                  id="brandName"
                  required
                  placeholder="e.g. Wellbeing Co."
                  value={form.brandName}
                  onChange={(e) => setField("brandName", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brandUrl">Brand website URL *</Label>
                <Input
                  id="brandUrl"
                  required
                  type="url"
                  placeholder="https://yourbrand.com"
                  value={form.brandUrl}
                  onChange={(e) => setField("brandUrl", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product_url">Product page URL</Label>
                <Input
                  id="product_url"
                  type="url"
                  placeholder="https://yourbrand.com/products/best-seller"
                  value={form.product_url}
                  onChange={(e) => setField("product_url", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Optional — paste a specific product page for deeper PDP analysis
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Brand category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setField("category", v)}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Section 2 — Meta Ad Library */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-semibold shrink-0">
                  2
                </span>
                <h2 className="font-semibold text-foreground">Meta Ad Library</h2>
                <span className="ml-auto text-xs text-muted-foreground">
                  Optional · Creative score
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="metaAdUrl">Meta Ad Library URL</Label>
                <Input
                  id="metaAdUrl"
                  type="url"
                  placeholder="https://www.facebook.com/ads/library/?..."
                  value={form.metaAdUrl}
                  onChange={(e) => setField("metaAdUrl", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Paste the brand&apos;s Meta Ad Library link to score Creative quality and ad
                  strategy
                </p>
              </div>
            </div>

            {/* Section 3 — Instagram */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-semibold shrink-0">
                  3
                </span>
                <h2 className="font-semibold text-foreground">Instagram</h2>
                <span className="ml-auto text-xs text-muted-foreground">
                  Optional · Social score
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="instagramHandle">Instagram handle</Label>
                <Input
                  id="instagramHandle"
                  placeholder="@brandhandle"
                  value={form.instagramHandle}
                  onChange={(e) => setField("instagramHandle", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Used to score Social / Content Authority (post frequency, engagement, reels ratio)
                </p>
              </div>
            </div>

            {/* Section 4 — Competitors */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-semibold shrink-0">
                  4
                </span>
                <h2 className="font-semibold text-foreground">Competitors</h2>
                <span className="ml-auto text-xs text-muted-foreground">
                  Optional · Benchmark
                </span>
              </div>

              <div className="space-y-2">
                {form.competitors.map((url, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://competitor.com"
                      value={url}
                      onChange={(e) => setCompetitor(idx, e.target.value)}
                      className="flex-1"
                    />
                    {form.competitors.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCompetitor(idx)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCompetitor}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add competitor
                </Button>
                <p className="text-xs text-muted-foreground">
                  Add competitor website URLs for benchmarking
                </p>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!form.brandName || !form.brandUrl || !form.category}
            >
              Generate audit →
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
