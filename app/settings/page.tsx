"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwForm, setPwForm] = useState({ newPassword: "", confirmPassword: "" });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
  });

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";
    const parts = fullName.split(" ");
    setForm({
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" ") ?? "",
      email: user.email ?? "",
      company: (user.user_metadata?.company as string | undefined) ?? "",
      role: (user.user_metadata?.role as string | undefined) ?? "",
    });
  }, [user, userLoading, router]);

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const fullName = `${form.firstName} ${form.lastName}`.trim();

    const { error: authError } = await supabase.auth.updateUser({
      email: form.email !== user?.email ? form.email : undefined,
      data: { full_name: fullName, company: form.company, role: form.role },
    });

    if (authError) {
      toast.error(authError.message);
      setSaving(false);
      return;
    }

    // Sync to profiles table
    await supabase
      .from("profiles")
      .update({ full_name: fullName, company: form.company })
      .eq("id", user!.id);

    toast.success("Profile updated");
    setSaving(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setPwSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPassword });
    if (error) {
      toast.error(error.message);
      setPwSaving(false);
      return;
    }
    toast.success("Password changed successfully");
    setPwForm({ newPassword: "", confirmPassword: "" });
    setPwSaving(false);
  }

  const userDisplay = user
    ? {
        name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "",
        email: user.email ?? "",
      }
    : undefined;

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={userDisplay} isAuthenticated={!!user} />

      <main className="flex-1 bg-background py-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h1 className="text-2xl font-bold text-foreground mb-8">Settings</h1>

          <div className="space-y-6">
            {/* Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your name and company details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" value={form.firstName} onChange={field("firstName")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" value={form.lastName} onChange={field("lastName")} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={field("email")} />
                    {form.email !== (user?.email ?? "") && (
                      <p className="text-xs text-amber-600">
                        A confirmation will be sent to your new email address.
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company">Company / Brand</Label>
                    <Input id="company" value={form.company} onChange={field("company")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" placeholder="e.g. Founder & CEO" value={form.role} onChange={field("role")} />
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Set a new password for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword">New password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNew ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        required
                        value={pwForm.newPassword}
                        onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter new password"
                      required
                      value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" disabled={pwSaving}>
                    {pwSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Change password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Plan</CardTitle>
                <CardDescription>Your current subscription and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Free Plan</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">1 audit/month · 3 dimensions</p>
                  </div>
                  <Button variant="outline">Upgrade to Pro</Button>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Audits this month</span>
                    <span className="font-mono font-semibold">0 / 1</span>
                  </div>
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <div className="h-full w-0 rounded-full bg-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Resets on 1 Jun 2026</p>
                </div>
              </CardContent>
            </Card>

            {/* Danger zone */}
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Permanent and irreversible actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Sign out of all devices</p>
                    <p className="text-xs text-muted-foreground">Revoke all active sessions</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const supabase = createClient();
                      await supabase.auth.signOut({ scope: "global" });
                      router.push("/");
                    }}
                  >
                    Sign out all
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <div>
                    <p className="text-sm font-medium text-destructive">Delete account</p>
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all audit data</p>
                  </div>
                  <Button variant="destructive" size="sm" disabled>
                    Delete account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
