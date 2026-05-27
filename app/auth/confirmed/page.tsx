import Link from "next/link";
import { BarChart3, CheckCircle2 } from "lucide-react";

export default function ConfirmedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BarChart3 className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-bold">AuditGPT</span>
        </Link>

        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">Email confirmed</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Your email address has been verified successfully. You can now sign in to your account.
        </p>

        <div className="mt-8">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
