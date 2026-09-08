import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { EventForm } from "@/components/admin/event-form";
import { ArrowLeft, Sparkles } from "lucide-react";

export const metadata = {
  title: "Create Event | Admin",
};

export default async function NewEventPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-canvas">
      <AdminNav userEmail={user.email} />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-950 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Events Overview</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
            <Sparkles className="h-5 w-5 text-gold-600" />
          </span>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950">
              Create New Fellowship Event
            </h1>
            <p className="text-xs text-forest-700 mt-0.5">
              Add a new program to the fellowship calendar with flyer, venue details, and description.
            </p>
          </div>
        </div>

        <EventForm />
      </main>
    </div>
  );
}
