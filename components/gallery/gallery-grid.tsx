"use client";

import * as React from "react";
import Image from "next/image";
import { images } from "@/data/images";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ZoomIn, Video, Image as ImageIcon } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  src: string;
  type: "image" | "video";
  span?: string; // CSS grid span
}

export function GalleryGrid() {
  const [activeItem, setActiveItem] = React.useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: "gal-1",
      title: "Audio-Visual & Altar Ministry",
      category: "Production & Technical",
      src: images.photography.worshipProduction,
      type: "image",
      span: "md:col-span-8 aspect-16/10 md:aspect-auto",
    },
    {
      id: "gal-2",
      title: "Studying the Word with Diligence",
      category: "Bible Study & Discipleship",
      src: images.photography.heroStudents,
      type: "image",
      span: "md:col-span-4 aspect-4/5",
    },
    {
      id: "gal-3",
      title: "Passionate Praise & Dancing",
      category: "Worship Ministry",
      src: images.photography.praiseSession,
      type: "image",
      span: "md:col-span-4 aspect-4/5",
    },
    {
      id: "gal-4",
      title: "Deep In Contemplation & Prayer",
      category: "Prayer & Seeking God",
      src: images.photography.ferventPrayer,
      type: "image",
      span: "md:col-span-4 aspect-4/5",
    },
    {
      id: "gal-5",
      title: "The Congregation at Worship",
      category: "Sunday Gathering",
      src: images.photography.fellowshipCongregation,
      type: "image",
      span: "md:col-span-4 aspect-4/5",
    },
    {
      id: "gal-6",
      title: "Reverence & Christian Brotherhood",
      category: "Fellowship Life",
      src: images.photography.brothersAndSisters,
      type: "image",
      span: "md:col-span-6 aspect-16/10",
    },
    {
      id: "gal-7",
      title: "Listening & Growing in Truth",
      category: "Sunday Service",
      src: images.photography.listeningService,
      type: "image",
      span: "md:col-span-6 aspect-16/10",
    },
  ];

  return (
    <div>
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {galleryItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className={`group relative rounded-2xl overflow-hidden border border-forest-800/15 bg-forest-100 shadow-2xs hover:shadow-lg transition-all cursor-pointer ${
              item.span || "md:col-span-4 aspect-square"
            }`}
          >
            <div className="relative w-full h-full min-h-[260px]">
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

              <div className="absolute bottom-0 inset-x-0 p-5 text-white flex items-end justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white leading-snug mt-0.5">
                    {item.title}
                  </h3>
                </div>

                <span className="p-2 rounded-full bg-white/20 backdrop-blur-xs text-white group-hover:bg-gold-500 group-hover:text-forest-950 transition-colors">
                  <ZoomIn className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Reel Highlight Section */}
      <div className="mt-14 rounded-3xl border border-forest-800/15 bg-forest-950 text-white p-6 sm:p-10 shadow-xl overflow-hidden">
        <div className="max-w-2xl mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-3 py-1 text-xs font-semibold text-gold-400 mb-2">
            <Video className="h-3.5 w-3.5" />
            Live Fellowship Highlight
          </div>
          <h3 className="font-serif text-2xl font-bold text-white">
            Moments in His Presence
          </h3>
          <p className="text-xs sm:text-sm text-forest-200/80 mt-1">
            Short video glimpse into our gatherings, praise sessions, and genuine fellowship.
          </p>
        </div>

        <div className="relative aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden border border-forest-800 bg-black">
          <video
            controls
            preload="metadata"
            className="w-full h-full object-cover"
            poster={images.photography.worshipProduction}
          >
            <source src={images.media.highlightVideo} type="video/mp4" />
            Your browser does not support the video element.
          </video>
        </div>
      </div>

      {/* Modal Zoom for Images */}
      {activeItem && (
        <Dialog open={!!activeItem} onOpenChange={() => setActiveItem(null)}>
          <DialogContent className="sm:max-w-3xl p-2 bg-forest-950 border-forest-800 text-white">
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-lg bg-black">
              <Image
                src={activeItem.src}
                alt={activeItem.title}
                fill
                sizes="(max-width: 1024px) 100vw, 80vw"
                className="object-contain"
              />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold-400">
                  {activeItem.category}
                </span>
                <h4 className="font-serif text-base font-bold text-white">
                  {activeItem.title}
                </h4>
              </div>
              <span className="text-xs text-forest-300">
                TACSFON (OAUSTECH)
              </span>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
