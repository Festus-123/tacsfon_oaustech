"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { images } from "@/data/images";
import { Button } from "@/components/ui/button";
import { LogOut, Globe, Calendar, Plus, CreditCard, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export function AdminNav({ userEmail }: { userEmail?: string }) {
  const router = useRouter();
  const pathname = usePathname();
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

  const navItems = [
    { href: "/admin", label: "Events", icon: Calendar },
    { href: "/admin/events/new", label: "New Event", icon: Plus },
    { href: "/admin/payments", label: "Programme Payments", icon: CreditCard },
    { href: "/admin/academic", label: "Academic Hub", icon: GraduationCap },
  ];

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
                Executive Portal
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "bg-forest-100 text-forest-950 font-semibold"
                      : "text-forest-800 hover:bg-forest-50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-forest-700 hover:text-forest-950 font-medium px-2.5 py-1.5 rounded-md hover:bg-forest-50"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Public Site</span>
          </Link>

          {userEmail && (
            <span className="hidden xl:inline-block text-xs text-forest-600 bg-forest-50 px-2.5 py-1 rounded-md border border-forest-100 max-w-[180px] truncate">
              {userEmail}
            </span>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loggingOut}
            onClick={handleLogout}
            className="text-xs h-8 text-forest-900 border-forest-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 mr-1" />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          </Button>
        </div>
      </div>

      {/* Mobile Submenu */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 border-t border-forest-100 overflow-x-auto bg-stone-50/70 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 shrink-0 ${
                isActive ? "bg-forest-900 text-white font-medium" : "text-forest-800 hover:bg-forest-100"
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
