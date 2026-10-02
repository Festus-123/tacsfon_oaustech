import type { Metadata } from "next";
import { fellowshipContent } from "@/data/content";
import { socialLinks } from "@/data/social";
import { ContactForm } from "@/components/forms/contact-form";
import { DonationModal } from "@/components/donation/donation-modal";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Heart,
  MessageSquare,
} from "lucide-react";

import { SiX, SiFacebook, SiInstagram, SiTiktok } from "react-icons/si";


export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with TACSFON (OAUSTECH Chapter). Send an inquiry, prayer request, or connect with fellowship leadership in Okitipupa, Ondo State.",
};

export default function ContactPage() {
  const { contact, venues } = fellowshipContent;

  return (
    <div className="py-12 md:py-20">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-forest-800/15 bg-forest-100/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-forest-800 mb-4">
            <MessageSquare className="h-3.5 w-3.5 text-gold-600" />
            Connect & Fellowship
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-forest-950">
            Get in Touch With Us
          </h1>
          <p className="mt-4 text-base sm:text-lg text-forest-900/80 leading-relaxed">
            Have questions about fellowship meetings, looking for pastoral guidance, or desiring to partner with our student ministry in OAUSTECH? We would love to hear from you.
          </p>
        </div>
      </section>

      {/* Main Grid: Contact Info + Contact Form */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Info & Meeting Venues (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Card */}
            <div className="rounded-2xl border border-forest-800/15 bg-white p-7 shadow-2xs space-y-5">
              <h2 className="font-serif text-xl font-bold text-forest-950">
                Direct Contact Information
              </h2>

              <div className="space-y-4 text-sm text-forest-900">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-forest-100 text-forest-800 shrink-0 mt-0.5">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-forest-600 uppercase font-semibold">
                      Email Address
                    </p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="font-medium text-forest-950 hover:text-forest-700 transition-colors"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-forest-100 text-forest-800 shrink-0 mt-0.5">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-forest-600 uppercase font-semibold">
                      Phone Line
                    </p>
                    <a
                      href={`tel:${contact.phone}`}
                      className="font-medium text-forest-950 hover:text-forest-700 transition-colors"
                    >
                      {contact.formattedPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-forest-100 text-forest-800 shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-forest-600 uppercase font-semibold">
                      Primary Sanctuary
                    </p>
                    <p className="font-medium text-forest-950 text-xs sm:text-sm">
                      {venues.primary}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-forest-100 text-forest-800 shrink-0 mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-forest-600 uppercase font-semibold">
                      Service Timings
                    </p>
                    <p className="font-medium text-forest-950 text-xs sm:text-sm">
                      {contact.hours}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Channels Card */}
            <div className="rounded-2xl border border-forest-800/15 bg-white p-7 shadow-2xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-forest-950">
                Follow Fellowship Channels
              </h3>
              <p className="text-xs text-forest-800 leading-relaxed">
                Stay updated with weekly flyers, testimonies, teachings, and video reels across social media.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-forest-100 hover:bg-forest-50 hover:border-forest-200 text-xs text-forest-900 transition-all font-medium"
                  >
                    {s.icon === "instagram" && <SiInstagram className="h-4 w-4 text-pink-500" />}
                    {s.icon === "facebook" && <SiFacebook className="h-4 w-4 text-blue-600" />}
                    {s.icon === "x" && <SiX className="h-4 w-4 text-slate-800" />}
                    {s.icon === "tiktok" && <SiTiktok className="h-4 w-4 text-rose-500" />}
                    <span>{s.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Support CTA Card */}
            <div className="rounded-2xl bg-forest-900 text-white p-6 shadow-md border border-forest-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gold-400 uppercase font-semibold">
                  Partner in Ministry
                </p>
                <p className="font-serif text-base font-bold text-white mt-0.5">
                  Support Our Building & Mission
                </p>
              </div>
              <DonationModal
                trigger={
                  <button className="px-4 py-2 rounded-full text-xs font-semibold bg-gold-500 text-forest-950 hover:bg-gold-400 transition-colors inline-flex items-center gap-1.5 shrink-0">
                    <Heart className="h-3.5 w-3.5 fill-forest-950/20" />
                    Donate
                  </button>
                }
              />
            </div>
          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-forest-950 text-white p-8 sm:p-10 shadow-xl border border-forest-900">
            <div className="mb-6 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                Send Us a Note
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Contact Form & Prayer Requests
              </h2>
              <p className="text-xs sm:text-sm text-forest-200/80 leading-relaxed">
                Fill out the details below. Our leadership team will review and respond promptly.
              </p>
            </div>

            <ContactForm isCompact={false} />
          </div>
        </div>
      </section>
    </div>
  );
}
