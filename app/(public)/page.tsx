import { getPublicEvents } from "@/lib/supabase/events";
import { Hero } from "@/components/sections/hero";
import { BentoRhythm } from "@/components/sections/bento-rhythm";
import { HighlightedEvents } from "@/components/sections/highlighted-events";
import { UnitsPreview } from "@/components/sections/units-preview";
import { ScriptureSection } from "@/components/sections/scripture-section";
import { HomeCta } from "@/components/sections/home-cta";

export default async function HomePage() {
  const events = await getPublicEvents();

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <BentoRhythm />
      <HighlightedEvents events={events} />
      <UnitsPreview />
      <ScriptureSection />
      <HomeCta />
    </div>
  );
}
