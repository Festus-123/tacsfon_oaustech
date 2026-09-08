import Link from "next/link";
import { FellowshipEvent } from "@/data/events";
import { EventCard } from "@/components/events/event-card";
import { ArrowRight, CalendarDays } from "lucide-react";

interface HighlightedEventsProps {
  events: FellowshipEvent[];
}

export function HighlightedEvents({ events }: HighlightedEventsProps) {
  const displayedEvents = events.slice(0, 3);

  return (
    <section className="py-16 md:py-24 bg-canvas border-b border-forest-800/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <CalendarDays className="h-3.5 w-3.5" />
              Programs & Gatherings
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-forest-950">
              Upcoming Fellowship Events
            </h2>
            <p className="mt-2 text-sm sm:text-base text-forest-900/75">
              Scheduled programs, special teachings, vigils, and celebrations.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-forest-800 hover:text-forest-950 transition-colors"
          >
            <span>View All Events</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {displayedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white border border-forest-100">
            <p className="text-sm text-forest-800">
              No upcoming events scheduled right now. Check back soon or join our weekly services!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
