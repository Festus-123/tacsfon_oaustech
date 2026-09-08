import type { Metadata } from "next";
import Image from "next/image";
import { fellowshipContent } from "@/data/content";
import { images } from "@/data/images";
import {
  Shield,
  Heart,
  BookOpen,
  Sparkles,
  Users,
  Building,
  GraduationCap,
  Flame,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About TACSFON (OAUSTECH)",
  description:
    "Learn about the history, purpose, core values, leadership, and apostolic heritage of The Apostolic Church Student Fellowship of Nigeria, OAUSTECH Chapter.",
};

export default function AboutPage() {
  const { identity, aboutSections, leadership } = fellowshipContent;

  const executives = leadership.filter((l) => l.category === "Executive");
  const coordinators = leadership.filter((l) => l.category === "Coordinator");

  return (
    <div className="py-12 md:py-20">
      {/* Header Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-forest-800/15 bg-forest-100/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-forest-800 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-gold-600" />
            Our Identity & Calling
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-forest-950 leading-tight">
            {aboutSections.heroHeading}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-forest-900/80 leading-relaxed">
            {aboutSections.heroSubheading}
          </p>
        </div>
      </section>

      {/* Bento Grid: Story, Heritage & Purpose */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Who We Are (7 cols) */}
          <div className="md:col-span-7 rounded-3xl border border-forest-800/15 bg-white p-8 shadow-2xs flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">
                Who We Are
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950">
                A Home for Every Student
              </h2>
              <p className="text-sm sm:text-base text-forest-900/85 leading-relaxed">
                TACSFON (OAUSTECH) is a student-led Christian fellowship at the Olusegun Agagu University of Science and Technology, Okitipupa, Ondo State. It exists as a vibrant spiritual family where students encounter the living God, develop a vibrant prayer life, grow in the Word, and form friendships anchored in Christ.
              </p>
              <p className="text-sm text-forest-900/80 leading-relaxed">
                While rooted in the doctrine and heritage of The Apostolic Church, TACSFON welcomes students from all backgrounds who desire to seek Jesus Christ and flourish in their academic and spiritual pursuits.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-forest-100 flex items-center gap-4">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border border-forest-200 shrink-0 bg-white p-1">
                <Image
                  src={images.logos.tac}
                  alt="The Apostolic Church Emblem"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-forest-950">
                  {identity.parentChurchMotto}
                </p>
                <p className="text-[11px] text-forest-600">
                  {identity.parentChurchScripture} — The Apostolic Church Nigeria
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Visual Emblem Card (5 cols) */}
          <div className="md:col-span-5 rounded-3xl border border-forest-800/15 bg-forest-900 text-white p-8 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
                Theme of the Season
              </span>
              <h3 className="font-serif text-2xl font-bold text-white">
                "{identity.yearlyTheme}"
              </h3>
              <p className="text-sm text-forest-200/85 leading-relaxed">
                {identity.yearlyThemeSub}
              </p>
              <div className="p-3.5 rounded-xl bg-forest-950/70 border border-forest-800 text-xs text-forest-200 italic font-serif mt-4">
                "Let no man despise thy youth; but be thou an example of the believers, in word, in conversation, in charity, in spirit, in faith, in purity." — 1 Tim 4:12
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-6 border-t border-forest-800 flex items-center justify-between text-xs text-forest-300">
              <span>Fellowship Chapter: OAUSTECH</span>
              <span className="font-medium text-gold-300">Okitipupa, Ondo State</span>
            </div>
          </div>

          {/* Card 3: Apostolic Connection (6 cols) */}
          <div className="md:col-span-6 rounded-3xl border border-forest-800/15 bg-forest-50/70 p-8 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-forest-800">
              <Building className="h-5 w-5 text-forest-700" />
              <h3 className="font-serif text-xl font-bold text-forest-950">
                Heritage & Apostolic Connection
              </h3>
            </div>
            <p className="text-sm text-forest-900/80 leading-relaxed">
              {aboutSections.apostolicConnection}
            </p>
            <p className="text-xs text-forest-600 italic">
              Fellowship with us in reverent apostolic order, sound biblical principles, and heartfelt worship.
            </p>
          </div>

          {/* Card 4: JCCF Partnership (6 cols) */}
          <div className="md:col-span-6 rounded-3xl border border-forest-800/15 bg-forest-50/70 p-8 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-forest-800">
              <Heart className="h-5 w-5 text-gold-600" />
              <h3 className="font-serif text-xl font-bold text-forest-950">
                Joint Campus Christian Fellowship (JCCF)
              </h3>
            </div>
            <p className="text-sm text-forest-900/80 leading-relaxed">
              {aboutSections.jccfConnection}
            </p>
            <p className="text-xs text-forest-600 italic">
              We stand together in prayer and brotherly unity with other Christian campus bodies.
            </p>
          </div>
        </div>
      </section>

      {/* Vision, Mission & Core Values */}
      <section className="bg-canvas-subtle py-16 md:py-24 border-y border-forest-800/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto sm:text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-800">
              Foundations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest-950 mt-1">
              Vision, Mission & Core Values
            </h2>
            <p className="text-sm text-forest-800/80 mt-2">
              The foundational pillars that guide our gatherings, discipleship, and fellowship operations.
            </p>
          </div>

          {/* Vision & Mission Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="rounded-2xl bg-white p-7 border border-forest-800/15 shadow-2xs">
              <div className="flex items-center gap-2 text-forest-800 mb-3">
                <Sparkles className="h-5 w-5 text-gold-600" />
                <h3 className="font-serif text-xl font-bold text-forest-950">
                  Our Vision
                </h3>
              </div>
              <p className="text-sm text-forest-900/85 leading-relaxed">
                {aboutSections.vision}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 border border-forest-800/15 shadow-2xs">
              <div className="flex items-center gap-2 text-forest-800 mb-3">
                <Shield className="h-5 w-5 text-forest-700" />
                <h3 className="font-serif text-xl font-bold text-forest-950">
                  Our Mission
                </h3>
              </div>
              <p className="text-sm text-forest-900/85 leading-relaxed">
                {aboutSections.mission}
              </p>
            </div>
          </div>

          {/* Core Values Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {aboutSections.coreValues.map((val, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-white p-5 border border-forest-800/10 shadow-2xs"
              >
                <span className="text-xs font-bold text-gold-600 tracking-wider uppercase">
                  0{idx + 1}
                </span>
                <h4 className="font-serif text-base font-bold text-forest-950 mt-1 mb-1.5">
                  {val.title}
                </h4>
                <p className="text-xs text-forest-900/80 leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership & Coordination Structure */}
      <section className="py-16 md:py-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="h-3.5 w-3.5" />
            Servant Leadership
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest-950">
            Fellowship Leadership Structure
          </h2>
          <p className="mt-2 text-sm text-forest-900/80 leading-relaxed">
            Leadership in TACSFON (OAUSTECH) is an avenue for sacrificial service, mutual accountability, and spiritual coordination.
          </p>
        </div>

        {/* Executive Leadership Group */}
        <div className="mb-14">
          <h3 className="font-serif text-xl font-bold text-forest-900 mb-6 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gold-500" />
            Executive Leadership
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {executives.map((exec, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-forest-800/15 bg-white p-5 shadow-2xs hover:shadow-md transition-shadow"
              >
                <div className="h-8 w-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-xs mb-3">
                  {exec.role[0]}
                </div>
                <h4 className="font-serif text-base font-bold text-forest-950">
                  {exec.role}
                </h4>
                <p className="text-xs text-forest-900/75 mt-2 leading-relaxed">
                  {exec.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Unit Coordinators Group */}
        <div>
          <h3 className="font-serif text-xl font-bold text-forest-900 mb-6 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-forest-700" />
            Unit Coordinators
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coordinators.map((coord, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-forest-800/10 bg-white p-5 shadow-2xs"
              >
                <h4 className="font-serif text-sm font-bold text-forest-950">
                  {coord.role}
                </h4>
                <p className="text-xs text-forest-900/75 mt-1.5 leading-relaxed">
                  {coord.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
