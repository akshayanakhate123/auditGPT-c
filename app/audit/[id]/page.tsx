import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AuditReport } from "@/components/audit-report";
import { SAMPLE_AUDITS } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getAudit(id: string) {
  // Sample audits served from mock data (no auth required)
  const sample = SAMPLE_AUDITS.find((a) => a.id === id);
  if (sample) return { audit: sample, isSample: true };

  // Real audit from DB (requires auth)
  const supabase = await createClient();
  const { data } = await supabase
    .from("audits")
    .select("*")
    .eq("id", id)
    .single();

  return { audit: data, isSample: false };
}

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { audit, isSample } = await getAudit(id);

  if (!audit) notFound();

  // DB audits without full data aren't renderable yet (Phase 3 will fix this)
  if (!isSample && !audit.data) notFound();

  const userDisplay = user
    ? {
        name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "",
        email: user.email ?? "",
      }
    : undefined;

  // For DB audits, use the stored data object; for samples, use the audit directly
  const reportData = isSample ? audit : audit.data;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={userDisplay} isAuthenticated={!!user} />
      <main className="flex-1 bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AuditReport audit={reportData} />
        </div>
      </main>
    </div>
  );
}
