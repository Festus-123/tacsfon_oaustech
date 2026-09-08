import Link from "next/link";
import { DonationModal } from "@/components/donation/donation-modal";
import { MapPin, Heart, ArrowRight } from "lucide-react";

export function HomeCta() {
  return (
    <section className="py-16 md:py-20 bg-forest-50/50 border-b border-forest-800/10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-forest-900 text-white p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-xl border border-forest-800">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Welcome Home
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              You Are Always Welcome in the Fellowship.
            </h2>
            <p className="text-sm sm:text-base text-forest-100/85 leading-relaxed">
              Whether you are an incoming fresher, returning undergraduate, or visiting brethren in Okitipupa, there is a place for you to worship, pray, and grow with us.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-forest-950 shadow-xs hover:bg-gold-400 transition-all active:scale-[0.98]"
              >
                <span>Connect With Us</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <DonationModal
                trigger={
                  <button className="inline-flex items-center gap-2 rounded-full border border-forest-700 bg-forest-950/60 px-5 py-3 text-sm font-semibold text-forest-100 hover:bg-forest-950 hover:text-white transition-all active:scale-[0.98] cursor-pointer">
                    <Heart className="h-4 w-4 text-gold-400" />
                    <span>Support the Fellowship</span>
                  </button>
                }
              />
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-forest-800/40 blur-2xl pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
