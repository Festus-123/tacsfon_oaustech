import Link from "next/link";
import { FileText, BookOpen, Layers, Archive, ArrowRight } from "lucide-react";
import { MaterialType } from "@/data/academic";

interface CategoryCardsProps {
  categories: MaterialType[];
}

export function AcademicCategoryCards({ categories }: CategoryCardsProps) {
  const iconMap: Record<string, any> = {
    past_questions: FileText,
    manuals: BookOpen,
    workbooks: Layers,
    materials: Archive,
  };

  return (
    <section className="py-12 md:py-16 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block mb-1">
            Curated Academic Categories
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">
            Everything structured for seamless study.
          </h2>
          <p className="text-stone-600 text-sm mt-2 leading-relaxed">
            Materials are categorized by type, school, department, and course level to help you quickly
            find exactly what you need before tests and examinations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = iconMap[cat.slug] || FileText;
            return (
              <Link
                key={cat.id}
                href={`/academic/materials?type=${cat.slug}`}
                className="group bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-stone-900 text-lg group-hover:text-blue-700 transition">
                    {cat.name}
                  </h3>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-blue-700 group-hover:translate-x-0.5 transition-transform">
                  <span>Explore items</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
