import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin Portal | TACSFON OAUSTECH",
    template: "%s | TACSFON Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans">
      {children}
    </div>
  );
}
