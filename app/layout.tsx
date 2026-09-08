import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "sonner";

const serifFont = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tacsfon-oaustech.org"),
  title: {
    default: "TACSFON (OAUSTECH) — The Apostolic Church Student Fellowship of Nigeria",
    template: "%s | TACSFON (OAUSTECH)",
  },
  description:
    "Official digital home of The Apostolic Church Student Fellowship of Nigeria (OAUSTECH Chapter), Okitipupa, Ondo State. A Christ-centered community walking in faith, prayer, and brotherhood under the theme 'The Davidic Generation'.",
  keywords: [
    "TACSFON",
    "OAUSTECH",
    "The Apostolic Church",
    "The Apostolic Church Student Fellowship of Nigeria",
    "Okitipupa",
    "Ondo State",
    "Christian student fellowship",
    "The Davidic Generation",
    "JCCF OAUSTECH",
  ],
  authors: [{ name: "TACSFON OAUSTECH Chapter" }],
  creator: "TACSFON (OAUSTECH)",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://tacsfon-oaustech.org",
    title: "TACSFON (OAUSTECH) — The Davidic Generation",
    description:
      "A spiritual family for university students at OAUSTECH. Worship, prayer, Bible study, and Christian community.",
    siteName: "TACSFON OAUSTECH",
    images: [
      {
        url: "/assets/Dofoto_20250506_103614466.png",
        width: 800,
        height: 800,
        alt: "TACSFON OAUSTECH Fellowship",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TACSFON (OAUSTECH) — The Davidic Generation",
    description:
      "Official digital home of The Apostolic Church Student Fellowship of Nigeria, OAUSTECH Chapter, Okitipupa.",
    images: ["/assets/Dofoto_20250506_103614466.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serifFont.variable} ${sansFont.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
