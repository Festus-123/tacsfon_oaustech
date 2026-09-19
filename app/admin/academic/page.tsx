import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  BookOpen,
  Calendar,
  Building,
  GraduationCap,
  Layers,
  Upload,
  CreditCard,
  CheckCircle2,
  Users,
  ArrowRight,
} from "lucide-react";
import {
  getActiveSemester,
  getSchools,
  getDepartments,
  getCourses,
  getPublishedMaterials,
} from "@/lib/supabase/academic";

export const metadata: Metadata = {
  title: "Academic Hub Management | TACSFON Admin",
  description: "Manage academic sessions, semesters, structure, and materials.",
};

export default async function AdminAcademicOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [activeSemester, schools, departments, courses, materials] = await Promise.all([
    getActiveSemester(),
    getSchools(),
    getDepartments(),
    getCourses(),
    getPublishedMaterials(),
  ]);

  const cards = [
    {
      title: "Semesters & Access Periods",
      description: "Configure semester dates, active session, and Paystack subscription price.",
      href: "/admin/academic/semesters",
      icon: Calendar,
      stat: activeSemester?.name || "No active semester",
      subStat: activeSemester?.price ? `₦${activeSemester.price.toLocaleString()}` : "Price not set",
      badge: activeSemester?.status || "INACTIVE",
    },
    {
      title: "Academic Structure",
      description: "Manage university schools/faculties, academic departments, and course codes.",
      href: "/admin/academic/structure",
      icon: Building,
      stat: `${courses.length} Courses`,
      subStat: `${schools.length} Schools &bull; ${departments.length} Departments`,
      badge: "Configurable",
    },
    {
      title: "Materials & Upload Review",
      description: "Upload normalized files, review parsed metadata, and publish protected items.",
      href: "/admin/academic/materials",
      icon: Upload,
      stat: `${materials.length} Materials`,
      subStat: "Past Questions & Manuals",
      badge: "Live Catalog",
    },
    {
      title: "Subscriptions & Entitlements",
      description: "Track student Paystack subscription records and active reading entitlements.",
      href: "/admin/academic/payments",
      icon: CreditCard,
      stat: "Paystack Gateway",
      subStat: "Automated & Idempotent",
      badge: "Active",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col">
      <AdminNav userEmail={user.email} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                Academic Hub
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">
              Academic Platform Dashboard
            </h1>
            <p className="text-stone-600 text-sm mt-1">
              Manage student study materials, academic structure, semester billing, and entitlements.
            </p>
          </div>

          <Link
            href="/academic"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-2xs transition"
          >
            <span>Preview Academic Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Overview Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                href={card.href}
                className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 uppercase">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-stone-900 text-lg group-hover:text-blue-700 transition">
                    {card.title}
                  </h3>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-stone-900 text-sm block">{card.stat}</span>
                    <span
                      className="text-stone-400 text-[11px]"
                      dangerouslySetInnerHTML={{ __html: card.subStat }}
                    />
                  </div>
                  <div className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
