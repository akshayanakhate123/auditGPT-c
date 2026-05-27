"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";

const CATEGORIES = [
  "Beauty", "Fashion", "F&B", "Wellness", "Electronics",
  "Home Decor", "Jewelry", "Footwear", "Pet", "Baby",
  "Personal Care", "Supplements", "Other",
];

const LOADING_STAGES = [
  "Analyzing PDP structure...",
  "Reading creative inventory...",
  "Scoring social authority...",
  "Mapping funnel...",
  "Checking retention readiness...",
  "Auditing SEO footprint...",
  "Benchmarking against competitors...",
  "Prioritizing recommendations...",
  "Done!",
];

export default function NewAuditPage() {
  const router = useRouter();
  const { user } = useUser();
  const [state, setState] = useState<"form" | "loading">("form");
  const [loadingStage, setLoadingStage] = useState(0);
  const stageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [form, setForm] = useState({
    brandName: "",
    brandUrl: "",
    product_url: "",
    category: "",
  });

  function handleInput(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");

    // Animate stages while waiting for the API — advance every ~7s
    let stageIndex = 0;
    setLoadingStage(0);
    stageIntervalRef.current = setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, LOADING_STAGES.length - 2);
      setLoadingStage(stageIndex);
    }, 7000);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: form.brandName,
          brandUrl: form.brandUrl,
          product_url: form.product_url || undefined,
          category: form.category,
        }),
      });

      if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setState("form");
        const msg = err.detail ? `${err.error}: ${err.detail}` : (err.error ?? "Audit generation failed.");
        toast.error(msg, { duration: 10000 });
        return;
      }

      setLoadingStage(LOADING_STAGES.length - 1); // "Done!"
      const { id } = await res.json();
      await new Promise((r) => setTimeout(r, 800));
      router.push(`/audit/${id}`);
    } catch {
      if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
      setState("form");
      toast.error("Network error. Please check your connection and try again.");
    }
  }

  if (state === "loading") {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar user={user ? { name: user.user_metadata?.full_name as string, email: user.email ?? "" } : undefined} isAuthenticated={!!user} />
        <main className="flex flex-1 items-center justify-center bg-background">
          <div className="text-center max-w-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-6">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Generating your audit</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Llama 3.3 70B is analysing <strong>{form.brandName || "your brand"}</strong> across 6 dimensions
            </p>

            <div className="space-y-3 text-left">
              {LOADING_STAGES.map((stage, i) => (
                <div
                  key={stage}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all",
                    i < loadingStage
                      ? "text-emerald-600"
                      : i === loadingStage
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground opacity-40"
                  )}
                >
                  {i < loadingStage ? (
                    <span className="h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">✓</span>
                  ) : i === loadingStage ? (
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-border flex-shrink-0" />
                  )}
                  {stage}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user ? { name: user.user_metadata?.full_name as string, email: user.email ?? "" } : undefined} isAuthenticated={!!user} />

      <main className="flex-1 bg-background py-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">New Audit</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste 3 inputs and let AI do the 6-hour audit in minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide text-muted-foreground">
                Brand basics
              </h2>

              <div className="space-y-1.5">
                <Label htmlFor="brandName">Brand name *</Label>
                <Input
                  id="brandName"
                  required
                  placeholder="e.g. Wellbeing Co."
                  value={form.brandName}
                  onChange={(e) => handleInput("brandName", e.target.value)}
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
                  onChange={(e) => handleInput("brandUrl", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product_url">Product page URL</Label>
                <Input
                  id="product_url"
                  type="url"
                  placeholder="https://yourbrand.com/products/best-seller"
                  value={form.product_url}
                  onChange={(e) => handleInput("product_url", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Optional — paste a specific product page for deeper PDP analysis
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Brand category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => handleInput("category", v)}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
