import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { ImageIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Fellowship Gallery",
  description:
    "Explore authentic photo moments and video highlights from worship services, prayer vigils, Bible studies, and celebrations at TACSFON (OAUSTECH).",
};

export default function GalleryPage() {
  return (
    <div className="py-12 md:py-20">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-forest-800/15 bg-forest-100/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-forest-800 mb-4">
            <ImageIcon className="h-3.5 w-3.5 text-gold-600" />
            Visual Fellowship Story
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-forest-950">
            Life in the Fellowship
          </h1>
          <p className="mt-4 text-base sm:text-lg text-forest-900/80 leading-relaxed">
            Moments of passionate worship, heartfelt prayer, disciplined study, and genuine community among university students walking with God.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
        <GalleryGrid />
      </section>
    </div>
  );
}
