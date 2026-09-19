import { Metadata } from "next";
import { AcademicHeader } from "@/components/academic/academic-header";
import { AcademicHero } from "@/components/academic/academic-hero";
import { AcademicCategoryCards } from "@/components/academic/academic-category-cards";
import { AcademicDemoSection } from "@/components/academic/academic-demo-section";
import { AcademicPricingCard } from "@/components/academic/academic-pricing-card";
import { AcademicFooter } from "@/components/academic/academic-footer";
import { getActiveSemester, getMaterialTypes, getDemoMaterials } from "@/lib/supabase/academic";

export const metadata: Metadata = {
  title: "Academic Hub — Verified Course Materials & Past Questions | OAUSTECH",
  description:
    "Organized academic past examination questions, laboratory manuals, lecture notes, and workbooks for OAUSTECH students. In partnership with TACSFON.",
  openGraph: {
    title: "Academic Hub — Organized OAUSTECH Academic Materials",
    description:
      "Get organized access to verified past questions, course manuals, and lecture notes for your semester.",
    url: "/academic",
  },
};

export default async function AcademicLandingPage() {
  const [activeSemester, materialTypes, demoMaterials] = await Promise.all([
    getActiveSemester(),
    getMaterialTypes(),
    getDemoMaterials(),
  ]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-stone-900 selection:bg-blue-100 selection:text-blue-900">
      <AcademicHeader activeSemester={activeSemester} />

      <main className="flex-1">
        <AcademicHero activeSemester={activeSemester} />
        <AcademicCategoryCards categories={materialTypes} />
        <AcademicDemoSection demos={demoMaterials} />
        <AcademicPricingCard activeSemester={activeSemester} />
      </main>

      <AcademicFooter />
    </div>
  );
}
