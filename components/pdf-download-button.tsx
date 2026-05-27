"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Audit } from "@/lib/mock-data";

export function PdfDownloadButton({ audit }: { audit: Audit }) {
  const [Comp, setComp] = useState<React.ComponentType<{ audit: Audit }> | null>(null);
  const [PDFLink, setPDFLink] = useState<React.ComponentType<{
    document: React.ReactElement;
    fileName: string;
    children: (params: { loading: boolean; url: string | null }) => React.ReactNode;
  }> | null>(null);

  useEffect(() => {
    // Load react-pdf only on the client
    Promise.all([
      import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
      import("@/components/audit-pdf").then((m) => m.AuditPdf),
    ]).then(([link, pdf]) => {
      setPDFLink(() => link as typeof PDFLink);
      setComp(() => pdf);
    });
  }, []);

  const filename = `${audit.brandName.replace(/\s+/g, "-").toLowerCase()}-auditgpt.pdf`;

  if (!Comp || !PDFLink) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" /> Preparing PDF…
      </Button>
    );
  }

  return (
    <PDFLink document={<Comp audit={audit} />} fileName={filename}>
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Preparing PDF…</>
          ) : (
            <><Download className="h-4 w-4" /> Download PDF</>
          )}
        </Button>
      )}
    </PDFLink>
  );
}
