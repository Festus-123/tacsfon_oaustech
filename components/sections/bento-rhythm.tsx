import Link from "next/link";
import Image from "next/image";
import { images } from "@/data/images";
import { Clock, MapPin, Sparkles, BookOpen, Flame, Music, Moon, Send, ArrowRight } from "lucide-react";

export function BentoRhythm() {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-forest-800/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto sm:text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100/80 text-forest-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <Clock className="h-3.5 w-3.5 text-forest-700" />
            Weekly & Periodic Rhythm
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-forest-950">
            A Rhythm of Worship, Word, and Intercession
          </h2>
          <p className="mt-3 text-base text-forest-900/75 leading-relaxed">
            Our week is centered around seeking God, understanding His Word, and building one another up amid campus life.
          </p>
        </div>

        {/* Bento Grid Composition */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Bento Card 1: Sunday Service (Featured Primary Card - 7 cols) */}
          <div className="md:col-span-7 rounded-2xl border border-forest-800/20 bg-forest-900 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-md">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-forest-700/40 blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400 text-forest-950 text-xs font-bold uppercase tracking-wider shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  Primary Gathering
                </span>
                <span className="text-xs font-medium text-forest-200">
                  Every Lord&apos;s Day
                </span>
              </div>

              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Sunday Divine Worship Service
                </h3>
                <p className="mt-2 text-sm text-forest-100/85 leading-relaxed max-w-xl">
                  Gather with the student body for spirit-filled praise, heartfelt prayer, choral ministration, and practical teaching from God&apos;s Word.
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-forest-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-forest-950/60 p-3 border border-forest-800/80">
                  <p className="text-gold-400 font-semibold uppercase text-[10px] tracking-wider">
                    Service Time
                  </p>
                  <p className="font-medium text-white text-sm mt-0.5">
                    8:00 AM (Sunday School)
                  </p>
                  <p className="font-medium text-forest-200 text-xs">
                    9:00 AM (Divine Service)
                  </p>
                </div>

                <div className="rounded-xl bg-forest-950/60 p-3 border border-forest-800/80">
                  <p className="text-gold-400 font-semibold uppercase text-[10px] tracking-wider">
                    Location
                  </p>
                  <p className="font-medium text-white text-xs mt-0.5 leading-snug">
                    TACSFON Center, Methodist Primary School Classroom, Igodan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Tuesday Bible Study (5 cols) */}
          <div className="md:col-span-5 rounded-2xl border border-forest-800/15 bg-forest-50/70 p-6 sm:p-7 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-forest-800 text-white">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-forest-700 bg-forest-200/60 px-2.5 py-1 rounded-md">
                  Tuesdays • 5:30 PM
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">
                  Bible Study
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-forest-900/80 leading-relaxed">
                  Deep scriptural analysis, interactive question & answer, and practical discipleship for undergraduates.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-forest-200/70 text-xs text-forest-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gold-600" />
                Igodan Center
              </span>
              <span className="font-medium text-forest-950">Anchored by Bible Study Unit</span>
            </div>
          </div>

          {/* Bento Card 3: Friday Prayer Meeting (4 cols) */}
          <div className="md:col-span-4 rounded-2xl border border-forest-800/15 bg-white p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-gold-500 text-forest-950">
                  <Flame className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gold-700 bg-gold-100/70 px-2.5 py-1 rounded-md">
                  Fridays • 5:30 PM
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-forest-950">
                  Prayer Meeting
                </h3>
                <p className="mt-1.5 text-xs text-forest-900/80 leading-relaxed">
                  An altar of collective prayer, spiritual breakthrough, intercession for our campus, academics, and personal revival.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-forest-100 text-xs text-forest-800 space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gold-600 shrink-0" />
                <span>Igodan & Mega Campus (500lvl Mech Hall)</span>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Saturday Choir Practice (4 cols) */}
          <div className="md:col-span-4 rounded-2xl border border-forest-800/15 bg-white p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-forest-100 text-forest-900">
                  <Music className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-forest-700 bg-forest-100 px-2.5 py-1 rounded-md">
                  Saturdays • 4:00 PM
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-forest-950">
                  Choir Practice
                </h3>
                <p className="mt-1.5 text-xs text-forest-900/80 leading-relaxed">
                  Vocal rehearsals, harmonies, spiritual alignment, and ministerial preparation for the fellowship choir.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-forest-100 text-xs text-forest-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gold-600" />
                TACSFON Center
              </span>
              <span className="font-medium text-forest-900">Choir Unit</span>
            </div>
          </div>

          {/* Bento Card 5: Periodic Vigils & Evangelism (4 cols) */}
          <div className="md:col-span-4 rounded-2xl border border-forest-800/15 bg-forest-950 text-white p-6 shadow-2xs flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-forest-800 text-gold-400">
                  <Moon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gold-400 bg-forest-900 px-2.5 py-1 rounded-md">
                  Monthly & Periodic
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-white">
                  Vigils & Campus Outreach
                </h3>
                <p className="mt-1.5 text-xs text-forest-200/80 leading-relaxed">
                  Monthly all-night prayer vigils on Friday nights, alongside periodic hostel evangelism spreading Christ across OAUSTECH.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-forest-800 text-xs text-forest-300 flex items-center justify-between">
              <span>Specific dates announced in Events</span>
              <Link
                href="/events"
                className="text-gold-400 hover:text-gold-300 font-semibold inline-flex items-center gap-1"
              >
                View <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
