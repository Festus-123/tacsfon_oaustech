"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { images } from "@/data/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowLeft, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message || "Invalid administrator credentials.");
        return;
      }

      if (data?.session) {
        toast.success("Welcome back, Administrator!");
        router.push("/admin");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Login failure:", err);
      setErrorMessage("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-950 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Public Website</span>
          </Link>
        </div>

        {/* Login Box */}
        <div className="rounded-3xl border border-forest-800/15 bg-white p-8 sm:p-10 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="relative h-16 w-16 mx-auto rounded-full overflow-hidden border border-forest-800/20 bg-white p-1 shadow-2xs">
              <Image
                src={images.logos.tacsfon}
                alt="TACSFON Logo"
                fill
                sizes="64px"
                className="object-contain"
                priority
              />
            </div>

            <h1 className="font-serif text-2xl font-bold text-forest-950">
              Administrator Portal
            </h1>
            <p className="text-xs text-forest-700 max-w-xs mx-auto">
              Sign in to manage dynamic fellowship events, flyers, and calendar updates.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Administrator Email</Label>
              <div className="relative">
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@tacsfon-oaustech.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-forest-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-forest-400" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-forest-800 text-white font-semibold h-11 hover:bg-forest-900 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="pt-4 border-t border-forest-100 text-center">
            <p className="text-[11px] text-forest-500 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-forest-700" />
              <span>Protected Administrator Area • Supabase Auth</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
