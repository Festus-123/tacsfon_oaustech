import type { Metadata } from "next";
import { fellowshipContent } from "@/data/content";
import { UnitCard } from "@/components/units/unit-card";
import { Users, Sparkles, Heart } from "lucide-react";
import { DonationModal } from "@/components/donation/donation-modal";

export const metadata: Metadata = {
  title: "Fellowship Units",
  description:
    "Explore the 10 service units within TACSFON (OAUSTECH): Bible Study, Prayer, Choir, Drama, Organizing, Academic, Ushering, Evangelism, Brothers, and Sisters.",
};

export default function UnitsPage() {
  const { units } = fellowshipContent;

  return (
    <div className="py-12 md:py-20">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-forest-800/15 bg-forest-100/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-forest-800 mb-4">
            <Users className="h-3.5 w-3.5 text-gold-600" />
            Areas of Service & Growth
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-forest-950">
            Fellowship Units
          </h1>
          <p className="mt-4 text-base sm:text-lg text-forest-900/80 leading-relaxed">
            In TACSFON (OAUSTECH), service is an expression of worship. Our units provide student members with practical opportunities to grow, exercise spiritual gifts, build genuine friendships, and lead.
          </p>
        </div>
      </section>

      {/* Bento Grid Layout of Units */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {units.map((unit, idx) => (
            <UnitCard key={unit.id} unit={unit} featured={idx === 0 || idx === 3} />
          ))}
        </div>
      </section>

      {/* How to Join / Get Involved Callout */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-forest-800/15 bg-forest-50/80 p-8 sm:p-12 text-center space-y-4">
          <span className="p-3 rounded-full bg-forest-100 text-forest-800 inline-block">
            <Sparkles className="h-6 w-6 text-gold-600" />
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950">
            Desiring to Serve in a Unit?
          </h2>
          <p className="text-sm sm:text-base text-forest-900/80 max-w-xl mx-auto leading-relaxed">
            Participation is open to all who desire to honor God with their time, talents, and gifts. Simply approach any unit coordinator after Sunday service or Friday prayer meeting, or reach out to us.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <DonationModal
              trigger={
                <button className="px-5 py-2.5 rounded-full bg-forest-800 text-white text-xs font-semibold hover:bg-forest-900 transition-colors inline-flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 text-gold-400" />
                  Support Unit Ministrations
                </button>
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
