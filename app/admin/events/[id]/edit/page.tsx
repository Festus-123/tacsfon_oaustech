import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/supabase/events";
import { AdminNav } from "@/components/admin/admin-nav";
import { EventForm } from "@/components/admin/event-form";
import { ArrowLeft, Edit3 } from "lucide-react";

export const metadata = {
  title: "Edit Event | Admin",
};

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const event = await getEventById(id);

  if (!event) {
    notFound();
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
            <Edit3 className="h-5 w-5 text-gold-600" />
          </span>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950">
              Edit Fellowship Event
            </h1>
            <p className="text-xs text-forest-700 mt-0.5">
              Update event details, flyer, location, timing, or change publishing status.
            </p>
          </div>
        </div>

        <EventForm initialData={event} isEdit={true} />
      </main>
    </div>
  );
}
