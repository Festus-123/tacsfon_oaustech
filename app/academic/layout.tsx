import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Academic Hub | TACSFON (OAUSTECH)",
    template: "%s | Academic Hub",
  },
};

export default function AcademicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-stone-900 selection:bg-blue-100 selection:text-blue-900">
      {children}
    </div>
  );
}
