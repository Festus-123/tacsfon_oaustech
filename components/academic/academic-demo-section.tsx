"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, FileText, ImageIcon, ShieldCheck, Sparkles, Eye } from "lucide-react";
import { DemoMaterial } from "@/data/academic";

interface DemoSectionProps {
  demos: DemoMaterial[];
}

export function AcademicDemoSection({ demos }: DemoSectionProps) {
  const [activeTab, setActiveTab] = useState<"video" | "pdf" | "image">("video");

  const videoDemo = demos.find((d) => d.type === "video");
  const pdfDemo = demos.find((d) => d.type === "pdf");
  const imageDemo = demos.find((d) => d.type === "image");

  return (
    <section id="demos" className="py-14 md:py-20 bg-stone-50/70 border-y border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider border border-blue-200/60">
            <Eye className="w-3.5 h-3.5" />
            Interactive Samples &bull; No Sign-Up Needed
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">
            Preview the quality before you subscribe.
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            Inspect our verified layout formatting, clarity, and mobile reader experience through these
            demonstration samples.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "video"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Platform Demo Video</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pdf")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "pdf"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Sample Past Questions (SAMPLE)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("image")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "image"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Curated Diagrams (SAMPLE)</span>
          </button>
        </div>

        {/* Demo Display Card */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
          {/* Sample Header Ribbon */}
          <div className="bg-amber-50 border-b border-amber-200/60 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              DEMONSTRATION SAMPLE &bull; NOT FULL MATERIAL
            </span>
            <span className="text-[11px] text-amber-700 font-mono">WATERMARK: TACSFON × FC STUDIO</span>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "video" && (
              <div className="space-y-4">
                <div className="aspect-[16/9] bg-black rounded-xl overflow-hidden relative shadow-inner">
                  <video
                    controls
                    className="w-full h-full object-contain"
                    poster="/assets/example-hero-page.webp"
                  >
                    <source
                      src={videoDemo?.file_url || "/assets/ins_link_DXCjyWIDVnm_1788818855788.mp4"}
                      type="video/mp4"
                    />
                    Your browser does not support HTML5 video.
                  </video>
                </div>
                <div className="text-xs text-stone-500 flex items-center justify-between">
                  <span>{videoDemo?.title || "Academic Hub Platform Walkthrough"}</span>
                  <span className="font-semibold text-blue-700">Official Mobile App & Web Tour</span>
                </div>
              </div>
            )}

            {activeTab === "pdf" && (
              <div className="space-y-4">
                <div className="p-6 bg-stone-50 rounded-xl border border-stone-200/80 font-serif text-stone-800 space-y-4 relative overflow-hidden">
                  {/* Subtle watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none text-4xl font-mono font-bold rotate-[-25deg]">
                    TACSFON × FC STUDIO (SAMPLE)
                  </div>

                  <div className="border-b border-stone-200 pb-3 text-center">
                    <span className="text-xs font-mono text-stone-400 block">
                      OLUSEGUN AGAGU UNIVERSITY OF SCIENCE AND TECHNOLOGY
                    </span>
                    <h3 className="font-bold text-base mt-1">CSC 308: Operating Systems Principles</h3>
                    <span className="text-xs text-stone-500">First Semester Examination &bull; Sample Past Question</span>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed font-sans">
                    <p>
                      <strong>Question 1 (a)</strong> [6 Marks] Discuss the trade-offs between preemptive and
                      non-preemptive CPU scheduling algorithms in multi-threaded microkernel architectures.
                    </p>
                    <p>
                      <strong>Question 1 (b)</strong> [8 Marks] Outline the four Coffman conditions necessary for
                      resource deadlocks to occur, illustrating each with a practical producer-consumer scenario.
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 text-center">
                  Full multi-year verified past question collections are unlocked upon semester subscription.
                </p>
              </div>
            )}

            {activeTab === "image" && (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-stone-200 aspect-[16/9] relative bg-stone-100">
                  <Image
                    src={imageDemo?.file_url || "/assets/example-hero-page.webp"}
                    alt="Sample study schematic"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-[10px] font-mono">
                    SAMPLE PREVIEW
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 text-center">
                  High-resolution schematic diagrams, formulas, and cheat sheets embedded directly in notes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
