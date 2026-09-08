import Link from "next/link";
import Image from "next/image";
import { fellowshipContent } from "@/data/content";
import { socialLinks } from "@/data/social";
import { images } from "@/data/images";
import { ContactForm } from "@/components/forms/contact-form";
import { DonationModal } from "@/components/donation/donation-modal";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Heart,
  Lock,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-forest-950 text-forest-50 border-t border-forest-900 mt-auto">
      {/* Top Banner: Fellowship Identity & Theme */}
      <div className="border-b border-forest-800/60 bg-forest-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white p-0.5">
              <Image
                src={images.logos.tacsfon}
                alt="TACSFON Emblem"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                Current Yearly Theme
              </p>
              <p className="font-serif text-lg font-bold text-white tracking-wide">
                "{fellowshipContent.identity.yearlyTheme}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-forest-200/80 italic font-serif">
              "{fellowshipContent.identity.motto}" — {fellowshipContent.identity.mottoScripture}
            </span>
            <DonationModal
              trigger={
                <button className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gold-500 text-forest-950 hover:bg-gold-400 transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                  <Heart className="h-3.5 w-3.5 fill-forest-950/20" />
                  Give Seed
                </button>
              }
            />
          </div>
        </div>
      </div>

      {/* Main Footer Body with Bento Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Left Column: Organization & Schedule (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white p-0.5">
                  <Image
                    src={images.logos.tacsfon}
                    alt="TACSFON OAUSTECH Logo"
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white leading-tight">
                    {fellowshipContent.identity.shortName}
                  </h3>
                  <p className="text-xs text-forest-300">
                    {fellowshipContent.identity.fullName}
                  </p>
                </div>
              </div>

              <p className="text-sm text-forest-200/80 leading-relaxed max-w-md pt-1">
                {fellowshipContent.identity.summary} Operating as a student fellowship within Olusegun Agagu University of Science and Technology (OAUSTECH) and affiliated with The Apostolic Church Nigeria and JCCF.
              </p>
            </div>

            {/* Venues and Contact Details */}
            <div className="space-y-2.5 text-xs text-forest-200/90 pt-2 border-t border-forest-800/60">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
                <span>{fellowshipContent.venues.primary}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-gold-400 shrink-0" />
                <a
                  href={`mailto:${fellowshipContent.contact.email}`}
                  className="hover:text-gold-300 transition-colors"
                >
                  {fellowshipContent.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-gold-400 shrink-0" />
                <a
                  href={`tel:${fellowshipContent.contact.phone}`}
                  className="hover:text-gold-300 transition-colors"
                >
                  {fellowshipContent.contact.formattedPhone}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
                <span>Sundays: 8:00 AM | Tuesdays & Fridays: 5:30 PM</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-400 mb-2.5">
                Connect Across Social Media
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-forest-900/90 hover:bg-forest-800 border border-forest-700/50 text-xs text-forest-100 hover:text-gold-300 transition-all"
                  >
                    {s.icon === "instagram" && <Instagram className="h-3.5 w-3.5 text-pink-400" />}
                    {s.icon === "facebook" && <Facebook className="h-3.5 w-3.5 text-blue-400" />}
                    {s.icon === "x" && <Twitter className="h-3.5 w-3.5 text-cyan-400" />}
                    {s.icon === "tiktok" && (
                      <span className="font-bold text-xs text-emerald-400">TT</span>
                    )}
                    <span>{s.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-serif text-sm font-bold text-gold-400 uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-forest-200/80 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-forest-200/80 hover:text-white transition-colors">
                  About TACSFON
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-forest-200/80 hover:text-white transition-colors">
                  Events & Programs
                </Link>
              </li>
              <li>
                <Link href="/units" className="text-forest-200/80 hover:text-white transition-colors">
                  Fellowship Units
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-forest-200/80 hover:text-white transition-colors">
                  Fellowship Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-forest-200/80 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs text-forest-400 hover:text-gold-400 transition-colors"
                >
                  <Lock className="h-3 w-3" />
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Column: Compact Contact Form (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-forest-900/60 p-6 border border-forest-800/80 shadow-lg">
            <div className="mb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">
                Reach Out to Us
              </span>
              <h4 className="font-serif text-lg font-bold text-white">
                Send a Message or Prayer Request
              </h4>
              <p className="text-xs text-forest-200/70 pt-0.5">
                Have questions or need spiritual counsel? Our fellowship team is here for you.
              </p>
            </div>

            <ContactForm isCompact={true} />
          </div>
        </div>

        {/* Bottom Bar: Copyright and Badges */}
        <div className="mt-12 pt-6 border-t border-forest-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-forest-300">
          <p>
            © {new Date().getFullYear()} TACSFON (OAUSTECH Chapter). All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-[11px] text-forest-300">
            <span>The Apostolic Church Nigeria</span>
            <span>•</span>
            <span>JCCF OAUSTECH</span>
            <span>•</span>
            <span>1 Timothy 4:12</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
