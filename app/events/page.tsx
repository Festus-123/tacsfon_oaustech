import type { Metadata } from "next";
import { getPublicEvents } from "@/lib/supabase/events";
import { EventCard } from "@/components/events/event-card";
import { Calendar, Sparkles, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Events & Programmes",
  description:
    "Explore upcoming fellowship services, prayer vigils, Bible study intensives, seminars, and TACSFON Week celebrations at OAUSTECH.",
};

export const revalidate = 60; // revalidate public events every minute

export default async function EventsPage() {
  const allEvents = await getPublicEvents();

  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingEvents = allEvents.filter((e) => e.event_date >= todayStr);
  const pastEvents = allEvents.filter((e) => e.event_date < todayStr);

  return (
    <div className="py-12 md:py-20">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-forest-800/15 bg-forest-100/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-forest-800 mb-4">
            <Calendar className="h-3.5 w-3.5 text-gold-600" />
            Calendar of Programs
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-forest-950">
            Fellowship Events & Programs
          </h1>
          <p className="mt-4 text-base sm:text-lg text-forest-900/80 leading-relaxed">
            Stay informed on all upcoming fellowship meetings, special programs, vigils, evangelism campaigns, and annual celebrations across OAUSTECH.
          </p>
        </div>
      </section>

      {/* Primary Upcoming Events */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between border-b border-forest-800/10 pb-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-600" />
            <h2 className="font-serif text-2xl font-bold text-forest-950">
              Upcoming Programs
            </h2>
          </div>
          <span className="text-xs font-semibold text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
            {upcomingEvents.length} Scheduled
          </span>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((evt, idx) => (
              <EventCard key={evt.id} event={evt} featured={idx === 0} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-forest-100 bg-white p-12 text-center">
            <Sparkles className="h-8 w-8 text-gold-500 mx-auto mb-3" />
            <p className="text-base font-medium text-forest-950">
              No upcoming events currently scheduled in the database.
            </p>
            <p className="text-xs text-forest-700 mt-1">
              Join us for our regular weekly gatherings: Sunday 8am/9am, Tuesday 5:30pm, Friday 5:30pm!
            </p>
          </div>
        )}
      </section>

      {/* Past Programs (if any) */}
      {pastEvents.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 border-t border-forest-800/10">
          <div className="flex items-center justify-between border-b border-forest-800/10 pb-4 mb-8">
            <h2 className="font-serif text-xl font-bold text-forest-900/80">
              Past Fellowship Gatherings
            </h2>
            <span className="text-xs text-forest-500">
              {pastEvents.length} Recorded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-85">
            {pastEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
