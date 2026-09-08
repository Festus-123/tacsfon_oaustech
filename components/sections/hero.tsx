"use client";

import Link from "next/link";
import Image from "next/image";
import { images } from "@/data/images";
import { fellowshipContent } from "@/data/content";
import { DonationModal } from "@/components/donation/donation-modal";
import { ArrowRight, Calendar, Sparkles, MapPin } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-forest-50/60 via-canvas to-canvas pt-8 pb-16 md:pt-14 md:pb-24 border-b border-forest-800/10">
      {/* Subtle organic background decoration */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-forest-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-96 w-96 rounded-full bg-gold-100/30 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Editorial Headline & Copy (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Theme Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-50/90 px-3.5 py-1.5 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-gold-600" />
              <span className="text-xs font-semibold tracking-wide text-forest-950 uppercase">
                Current Yearly Theme:
              </span>
              <span className="font-serif text-xs font-bold text-gold-700">
                "{fellowshipContent.identity.yearlyTheme}"
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-forest-950 leading-[1.12]">
              A Spiritual Family for Every Student on Campus.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-forest-900/80 leading-relaxed max-w-2xl">
              Welcome to <strong className="font-semibold text-forest-950">{fellowshipContent.identity.fullName}</strong> at OAUSTECH. We are a student-led fellowship walking in the footsteps of Christ through earnest prayer, biblical truth, joyous worship, and mutual brotherhood.
            </p>

            {/* Quick Meeting Schedule & Venue Pill */}
            <div className="rounded-xl border border-forest-800/15 bg-white/90 p-3.5 shadow-2xs text-xs text-forest-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 max-w-xl">
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-gold-600 shrink-0" />
                <span>TACSFON Center, Igodan Methodist Primary School Classroom</span>
              </div>
              <span className="inline-flex items-center gap-1 font-semibold text-forest-800 bg-forest-100/70 px-2.5 py-1 rounded-md shrink-0">
                <Calendar className="h-3 w-3" />
                Sun 8am & 9am
              </span>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-full bg-forest-800 px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-forest-900 transition-all active:scale-[0.98]"
              >
                <span>Explore Events</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <DonationModal
                trigger={
                  <button className="inline-flex items-center gap-2 rounded-full border border-forest-800/20 bg-white px-5 py-3 text-sm font-semibold text-forest-900 hover:bg-forest-50 hover:border-forest-800/40 transition-all active:scale-[0.98] cursor-pointer">
                    <span>Partner & Support</span>
                  </button>
                }
              />

              <Link
                href="/units"
                className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-forest-900 hover:text-forest-700 underline-offset-4 hover:underline"
              >
                <span>Find Your Unit</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Editorial Visual Composition (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Photo Card */}
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl border border-forest-800/20 shadow-xl bg-forest-100">
                <Image
                  src={images.photography.heroStudents}
                  alt="Students engaged during fellowship study"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/20 to-transparent" />

                {/* Overlay Caption at bottom of photo */}
                <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-300">
                      Discipleship & Fellowship
                    </span>
                  </div>
                  <p className="font-serif text-lg font-bold text-white leading-snug">
                    "Let no man despise thy youth..."
                  </p>
                  <p className="text-xs text-forest-100/80">
                    1 Timothy 4:12 — Grounded in faith, word & purity.
                  </p>
                </div>
              </div>

              {/* Floating Fellowship Emblem Card */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 rounded-xl border border-forest-800/15 bg-white p-3 shadow-lg flex items-center gap-3 max-w-[240px]">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-forest-50 p-1 border border-forest-800/10">
                  <Image
                    src={images.logos.tacsfon}
                    alt="TACSFON Badge"
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                    OAUSTECH
                  </p>
                  <p className="text-xs font-semibold text-forest-950 leading-tight">
                    United in Christ & Fellowship
                  </p>
                </div>
              </div>

              {/* Top Accent Badge */}
              <div className="absolute -top-3 -right-3 rounded-lg border border-gold-400/40 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-xs text-[11px] font-medium text-forest-900 hidden sm:flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span>Sunday Worship: 8:00 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
