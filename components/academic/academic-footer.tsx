import Link from "next/link";
import { BookOpen, Mail, Phone, ShieldCheck } from "lucide-react";
import { academicSupport } from "@/data/academic";

export function AcademicFooter() {
  return (
    <footer className="bg-stone-100/90 border-t border-stone-200/80 text-stone-600 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-stone-900 text-base">Academic Hub</span>
          </div>
          <p className="text-stone-500 text-xs max-w-md leading-relaxed">
            A specialized academic resource platform providing organized, verified past questions,
            instructional manuals, and course workbooks for OAUSTECH students.
          </p>
          <div className="text-[11px] text-stone-400">
            In collaborative partnership with TACSFON (OAUSTECH).
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Material Types</h4>
          <ul className="space-y-1.5 text-stone-500">
            <li>
              <Link href="/academic/materials?type=past_questions" className="hover:text-blue-600">
                Past Questions
              </Link>
            </li>
            <li>
              <Link href="/academic/materials?type=manuals" className="hover:text-blue-600">
                Manuals & Lecture Notes
              </Link>
            </li>
            <li>
              <Link href="/academic/materials?type=workbooks" className="hover:text-blue-600">
                Workbooks
              </Link>
            </li>
            <li>
              <Link href="/academic/materials?type=materials" className="hover:text-blue-600">
                Course Materials
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Information */}
        <div className="space-y-2">
          <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Academic Support</h4>
          <div className="space-y-2 text-stone-600">
            <a
              href={`mailto:${academicSupport.email}`}
              className="flex items-center gap-2 hover:text-blue-600 transition"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{academicSupport.email}</span>
            </a>
            <a
              href={`tel:${academicSupport.phone}`}
              className="flex items-center gap-2 hover:text-blue-600 transition"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{academicSupport.phone}</span>
            </a>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              <span>Verified student study system</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-400 text-[11px]">
        <p>&copy; {new Date().getFullYear()} Academic Hub &bull; All materials protected.</p>
        <div className="flex items-center gap-4">
          <Link href="/academic#demos" className="hover:text-stone-600">
            Demo Samples
          </Link>
          <Link href="/academic/subscribe" className="hover:text-stone-600">
            Semester Subscription
          </Link>
          <Link href="/" className="hover:text-stone-600">
            TACSFON Fellowship
          </Link>
        </div>
      </div>
    </footer>
  );
}
