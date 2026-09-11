"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { images } from "@/data/images";
import { fellowshipContent } from "@/data/content";
import { DonationModal } from "@/components/donation/donation-modal";
import { Menu, X, Heart } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Events", href: "/events" },
    { name: "Units", href: "/units" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-forest-800/10 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 rounded-lg p-1"
        >
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-forest-800/15 shadow-2xs group-hover:scale-105 transition-transform bg-white">
            <Image
              src={images.logos.tacsfon}
              alt="TACSFON OAUSTECH Logo"
              fill
              sizes="44px"
              className="object-contain p-0.5"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg leading-tight tracking-tight text-forest-950 group-hover:text-forest-700 transition-colors">
              TACSFON
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-gold-600">
              {fellowshipContent.identity.chapter.split(",")[0]}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  active
                    ? "bg-forest-800 text-white shadow-2xs font-semibold"
                    : "text-forest-900/80 hover:text-forest-950 hover:bg-forest-50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Area: Donate */}
        <div className="hidden sm:flex items-center gap-3">
          <DonationModal
            trigger={
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-forest-800 text-white hover:bg-forest-900 transition-all border border-forest-700/60 shadow-2xs active:scale-[0.98] cursor-pointer">
                <Heart className="h-3.5 w-3.5 text-gold-400 fill-gold-400/30" />
                <span>Give / Support</span>
              </button>
            }
          />
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <DonationModal
            trigger={
              <button
                className="p-2 rounded-lg bg-forest-50 text-forest-900 hover:bg-forest-100 transition-colors"
                aria-label="Give or Support"
              >
                <Heart className="h-4 w-4 text-forest-800 fill-forest-800/30" />
              </button>
            }
          />

          <button
            type="button"
            className="p-2 rounded-lg text-forest-900 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-forest-950" />
            ) : (
              <Menu className="h-6 w-6 text-forest-950" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-forest-800/10 bg-white/98 px-4 py-5 shadow-xl transition-all">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-forest-800 text-white font-semibold"
                      : "text-forest-900 hover:bg-forest-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-forest-100">
              <DonationModal
                trigger={
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold bg-gold-500 text-forest-950 shadow-2xs hover:bg-gold-400 transition-colors"
                  >
                    <Heart className="h-4 w-4 text-forest-950 fill-forest-950/20" />
                    Support Fellowship Work
                  </button>
                }
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
