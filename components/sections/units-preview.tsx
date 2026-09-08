"use client"

import Link from "next/link";
import { fellowshipContent } from "@/data/content";
import { UnitCard } from "@/components/units/unit-card";
import { ArrowRight, Users } from "lucide-react";

export function UnitsPreview() {
  // Select key representative units for homepage preview
  const previewUnits = fellowshipContent.units.slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-white border-b border-forest-800/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Users className="h-3.5 w-3.5" />
              Areas of Service
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-forest-950">
              Fellowship Units
            </h2>
            <p className="mt-2 text-sm sm:text-base text-forest-900/75 max-w-2xl leading-relaxed">
              Every unit is an avenue to grow, exercise spiritual gifts, develop leadership, and serve Christ and brethren during university years.
            </p>
          </div>

          <Link
            href="/units"
            className="inline-flex items-center gap-2 text-sm font-semibold text-forest-800 hover:text-forest-950 transition-colors"
          >
            <span>Explore All 10 Units</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {previewUnits.map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      </div>
    </section>
  );
}
