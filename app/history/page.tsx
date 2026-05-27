"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Eye, FileText, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreBadge } from "@/components/score-badge";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { HistoryPdfButton } from "@/components/history-pdf-button";

type AuditRow = {
  id: string;
  brand_name: string;
  category: string;
  brand_health_score: number | null;
  status: string;
  created_at: string;
};

const ALL_CATEGORIES = ["Beauty", "Fashion", "Wellness", "Electronics", "F&B", "Home Decor", "Supplements", "Personal Care", "Other"];

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const supabase = createClient();
    supabase
      .from("audits")
      .select("id, brand_name, category, brand_health_score, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Failed to load audits");
        setAudits(data ?? []);
        setFetching(false);
      });
  }, [user, userLoading, router]);

  const filtered = audits.filter((a) => {
    const matchSearch = a.brand_name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategories.length === 0 || selectedCategories.includes(a.category);
    return matchSearch && matchCat;
  });

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function toggleSelect(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    setSelected(selected.length === filtered.length ? [] : filtered.map((a) => a.id));
  }

  async function handleDelete() {
    if (!selected.length) return;
    const supabase = createClient();
    const { error } = await supabase.from("audits").delete().in("id", selected);
    if (error) {
      toast.error("Failed to delete audits");
      return;
    }
    setAudits((prev) => prev.filter((a) => !selected.includes(a.id)));
    setSelected([]);
    toast.success(`${selected.length} audit${selected.length > 1 ? "s" : ""} deleted`);
  }

  const userDisplay = user
    ? {
        name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "",
        email: user.email ?? "",
      }
    : null;

  const isLoading = userLoading || fetching;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={userDisplay ?? undefined} isAuthenticated={!!user} />

      <main className="flex-1 bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Audit History</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${audits.length} audit${audits.length !== 1 ? "s" : ""} across all brands`}
              </p>
            </div>
            {selected.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selected.length} selected</span>
                <Button size="sm" variant="destructive" className="gap-1.5" onClick={handleDelete}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedCategories.includes(cat)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0 animate-pulse">
                  <div className="h-4 w-4 rounded bg-muted" />
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-4 w-20 rounded bg-muted" />
                  <div className="h-4 w-12 rounded bg-muted ml-auto" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="font-semibold text-foreground">No audits found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {search || selectedCategories.length > 0
                  ? "No results match your filters."
                  : "Run your first audit to see it here."}
              </p>
              {!search && selectedCategories.length === 0 && (
                <Button className="mt-4" asChild>
                  <Link href="/new-audit">Run a new audit</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="w-10 p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selected.length === filtered.length && filtered.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Brand</th>
                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score</th>
                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="p-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((audit) => (
                    <tr key={audit.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(audit.id)}
                          onChange={() => toggleSelect(audit.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-sm text-foreground">{audit.brand_name}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">{audit.category}</Badge>
                      </td>
                      <td className="p-3">
                        {audit.brand_health_score != null ? (
                          <ScoreBadge score={audit.brand_health_score} />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(audit.created_at), "d MMM yyyy")}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            audit.status === "complete"
                              ? "success"
                              : audit.status === "processing"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {audit.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/audit/${audit.id}`}>
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          {audit.status === "complete" && (
                            <HistoryPdfButton auditId={audit.id} brandName={audit.brand_name} />
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelected([audit.id]);
                              handleDelete();
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
