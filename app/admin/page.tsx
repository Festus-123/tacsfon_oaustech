import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEvents } from "@/lib/supabase/events";
import { AdminNav } from "@/components/admin/admin-nav";
import { EventList } from "@/components/admin/event-list";
import { Calendar, CheckCircle, Clock, Plus, Database } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const events = await getAdminEvents();

  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.published).length;
  const draftEvents = totalEvents - publishedEvents;

  return (
    <div className="min-h-screen bg-canvas">
      <AdminNav userEmail={user.email} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-forest-800/15 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest-600">
                Total Events
              </span>
              <span className="p-2 rounded-lg bg-forest-100 text-forest-800">
                <Calendar className="h-4 w-4" />
              </span>
            </div>
            <p className="font-serif text-3xl font-bold text-forest-950 mt-2">
              {totalEvents}
            </p>
            <p className="text-xs text-forest-600 mt-1">Recorded in fellowship calendar</p>
          </div>

          <div className="rounded-2xl border border-forest-800/15 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Published & Live
              </span>
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <CheckCircle className="h-4 w-4" />
              </span>
            </div>
            <p className="font-serif text-3xl font-bold text-forest-950 mt-2">
              {publishedEvents}
            </p>
            <p className="text-xs text-emerald-700 mt-1">Visible to the public</p>
          </div>

          <div className="rounded-2xl border border-forest-800/15 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-700">
                Drafts / Hidden
              </span>
              <span className="p-2 rounded-lg bg-gold-100 text-gold-800">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <p className="font-serif text-3xl font-bold text-forest-950 mt-2">
              {draftEvents}
            </p>
            <p className="text-xs text-forest-600 mt-1">Unpublished internal drafts</p>
          </div>
        </div>

        {/* Database setup notification helper */}
        <div className="rounded-2xl border border-forest-800/15 bg-forest-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-lg bg-forest-800 text-white shrink-0 mt-0.5">
              <Database className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-forest-950 uppercase tracking-wide">
                Database & Supabase Storage Note
              </h4>
              <p className="text-xs text-forest-800 leading-relaxed max-w-2xl mt-0.5">
                Ensure you have executed the schema migration script in <code className="bg-white px-1.5 py-0.5 rounded border text-[11px] font-mono">supabase/schema.sql</code> inside your Supabase SQL Editor to enable persistent event storage and storage policies.
              </p>
            </div>
          </div>

          <Link href="/admin/events/new" className="shrink-0">
            <Button size="sm" variant="gold" className="text-xs font-semibold">
              <Plus className="h-3.5 w-3.5 mr-1" />
              New Event
            </Button>
          </Link>
        </div>

        {/* Event List Table */}
        <EventList initialEvents={events} />
      </main>
    </div>
  );
}
