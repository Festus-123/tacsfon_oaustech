import { BookOpen } from "lucide-react";

export function ScriptureSection() {
  return (
    <section className="py-20 bg-forest-950 text-white relative overflow-hidden border-b border-forest-900">
      {/* Subtle organic light behind quote */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-forest-800/40 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-forest-900 text-gold-400 border border-forest-800">
          <BookOpen className="h-6 w-6" />
        </div>

        <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal leading-relaxed text-forest-50 italic">
          "Let no man despise thy youth; but be thou an example of the believers, in word, in conversation, in charity, in spirit, in faith, in purity."
        </blockquote>

        <div className="pt-2">
          <cite className="not-italic text-sm font-semibold tracking-widest uppercase text-gold-400">
            1 Timothy 4:12 (KJV)
          </cite>
          <p className="text-xs text-forest-300 mt-1">
            The foundational anchor of The Apostolic Church Student Fellowship
          </p>
        </div>
      </div>
    </section>
  );
}
