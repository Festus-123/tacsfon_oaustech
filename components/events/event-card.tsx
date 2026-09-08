import Image from "next/image";
import { FellowshipEvent } from "@/data/events";
import { Calendar, Clock, MapPin, ExternalLink, Sparkles } from "lucide-react";

interface EventCardProps {
  event: FellowshipEvent;
  featured?: boolean;
}

export function EventCard({ event, featured = false }: EventCardProps) {
  const formattedDate = new Date(event.event_date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article
      className={`rounded-2xl border border-forest-800/15 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col ${
        featured ? "lg:flex-row" : ""
      }`}
    >
      {/* Event Flyer / Image */}
      {event.image_url ? (
        <div
          className={`relative bg-forest-100 overflow-hidden ${
            featured ? "lg:w-1/2 aspect-4/3 lg:aspect-auto" : "aspect-16/10 w-full"
          }`}
        >
          <Image
            src={event.image_url}
            alt={`${event.title} flyer`}
            fill
            sizes={featured ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
          {event.category && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 rounded-full bg-forest-950/80 backdrop-blur-xs text-gold-300 text-xs font-semibold uppercase tracking-wider">
                {event.category}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`bg-forest-50 p-6 flex flex-col justify-center items-center text-center border-b border-forest-100 ${
            featured ? "lg:w-1/3 lg:border-b-0 lg:border-r" : "h-32"
          }`}
        >
          <Sparkles className="h-8 w-8 text-gold-500 mb-2" />
          <span className="text-xs font-semibold uppercase tracking-wider text-forest-800">
            {event.category || "Fellowship Program"}
          </span>
        </div>
      )}

      {/* Content */}
      <div className={`p-6 flex-1 flex flex-col justify-between ${featured ? "lg:p-8" : ""}`}>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-forest-700 font-medium">
            <span className="inline-flex items-center gap-1 bg-forest-100/70 px-2.5 py-1 rounded-md">
              <Calendar className="h-3.5 w-3.5 text-forest-800" />
              {formattedDate}
            </span>
            {event.event_time && (
              <span className="inline-flex items-center gap-1 text-forest-600">
                <Clock className="h-3.5 w-3.5" />
                {event.event_time}
              </span>
            )}
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-forest-950 leading-snug">
            {event.title}
          </h3>

          <p className="text-sm text-forest-900/80 leading-relaxed line-clamp-3">
            {event.description}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-forest-100 flex items-center justify-between gap-3 text-xs">
          {event.location ? (
            <div className="flex items-center gap-1.5 text-forest-700 truncate max-w-[70%]">
              <MapPin className="h-3.5 w-3.5 text-gold-600 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          ) : (
            <span className="text-forest-400">Venue details upon arrival</span>
          )}

          {event.external_url && (
            <a
              href={event.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-forest-800 hover:text-forest-950 underline underline-offset-2 shrink-0"
            >
              <span>Details</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
