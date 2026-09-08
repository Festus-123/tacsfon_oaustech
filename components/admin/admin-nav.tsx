"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { images } from "@/data/images";
import { Button } from "@/components/ui/button";
import { LogOut, Globe, Shield, Calendar, Plus } from "lucide-react";
import { toast } from "sonner";

export function AdminNav({ userEmail }: { userEmail?: string }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to log out");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-forest-800/10 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 rounded-full overflow-hidden border border-forest-800/20 bg-white p-0.5 shrink-0">
              <Image
                src={images.logos.tacsfon}
                alt="TACSFON Emblem"
                fill
                sizes="36px"
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-serif font-bold text-base text-forest-950 block leading-tight">
                TACSFON Admin
              </span>
              <span className="text-[10px] font-semibold text-gold-600 uppercase tracking-wider block">
                Portal
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2 text-xs font-medium">
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-md text-forest-900 hover:bg-forest-50 transition-colors flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Events Overview</span>
            </Link>
            <Link
              href="/admin/events/new"
              className="px-3 py-1.5 rounded-md text-forest-900 hover:bg-forest-50 transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Event</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-forest-700 hover:text-forest-950 font-medium px-2.5 py-1.5 rounded-md hover:bg-forest-50"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>View Public Site</span>
          </Link>

          {userEmail && (
            <span className="hidden lg:inline-block text-xs text-forest-600 bg-forest-50 px-2.5 py-1 rounded-md border border-forest-100 max-w-[180px] truncate">
              {userEmail}
            </span>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loggingOut}
            onClick={handleLogout}
            className="text-xs h-8 text-forest-900 border-forest-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
          >
            <LogOut className="h-3.5 w-3.5 mr-1" />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
