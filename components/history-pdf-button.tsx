"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function HistoryPdfButton({ auditId, brandName }: { auditId: string; brandName: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      // Fetch the full audit data (the jsonb field)
      const supabase = createClient();
      const { data, error } = await supabase
        .from("audits")
        .select("data")
        .eq("id", auditId)
        .single();

      if (error || !data?.data) {
        toast.error("Could not load audit data for PDF");
        return;
      }

      // Dynamically load react-pdf and the PDF component (client-only)
      const [reactPdf, { AuditPdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/audit-pdf"),
      ]);

      const { createElement } = await import("react");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await reactPdf.pdf(createElement(AuditPdf, { audit: data.data }) as any).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${brandName.replace(/\s+/g, "-").toLowerCase()}-auditgpt.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("PDF generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleDownload} disabled={loading}>
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
    </Button>
  );
}
