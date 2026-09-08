import Image from "next/image";
import { UnitItem } from "@/data/content";
import {
  BookOpen,
  Flame,
  Music,
  Theater,
  GraduationCap,
  HeartHandshake,
  Send,
  Layers,
  Shield,
  Sparkles,
} from "lucide-react";

interface UnitCardProps {
  unit: UnitItem;
  featured?: boolean;
}

export function UnitCard({ unit, featured = false }: UnitCardProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "BookOpen":
        return <BookOpen className="h-5 w-5" />;
      case "Flame":
        return <Flame className="h-5 w-5" />;
      case "Music":
        return <Music className="h-5 w-5" />;
      case "Theater":
        return <Theater className="h-5 w-5" />;
      case "GraduationCap":
        return <GraduationCap className="h-5 w-5" />;
      case "HeartHandshake":
        return <HeartHandshake className="h-5 w-5" />;
      case "Send":
        return <Send className="h-5 w-5" />;
      case "Layers":
        return <Layers className="h-5 w-5" />;
      case "Shield":
        return <Shield className="h-5 w-5" />;
      case "Sparkles":
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <div
      className={`rounded-2xl border border-forest-800/15 bg-white p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden relative ${
        featured ? "md:col-span-2 bg-gradient-to-br from-white to-forest-50/50" : ""
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center group-hover:bg-forest-800 group-hover:text-white transition-colors">
            {getIcon(unit.iconName)}
          </div>
          {unit.regularActivity && (
            <span className="text-[11px] font-semibold tracking-wide text-forest-700 bg-forest-50 px-2.5 py-1 rounded-md border border-forest-100">
              {unit.regularActivity}
            </span>
          )}
        </div>

        <h3 className="font-serif text-xl font-bold text-forest-950 mb-2 group-hover:text-forest-700 transition-colors">
          {unit.name}
        </h3>

        <p className="text-sm text-forest-900/80 leading-relaxed">
          {unit.shortDescription}
        </p>

        {unit.responsibilities && unit.responsibilities.length > 0 && (
          <ul className="mt-4 space-y-1.5 pt-3 border-t border-forest-100 text-xs text-forest-800">
            {unit.responsibilities.slice(0, 2).map((resp, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-gold-600 font-bold">•</span>
                <span className="line-clamp-1">{resp}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {unit.image && (
        <div className="mt-5 relative aspect-16/9 w-full rounded-xl overflow-hidden border border-forest-100">
          <Image
            src={unit.image}
            alt={unit.name}
            fill
            sizes="(max-width: 768px) 100vw, 30vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
    </div>
  );
}
