import { NextResponse } from "next/server";
import { isAcademicHubUnlocked } from "@/lib/security/academic-hub-key";
import {
  reevaluateIsolatedGroup,
  reprocessGroupWithNebula,
  NebulaDocumentGroup,
  NebulaClassification,
  NebulaSortResult,
  RawUploadedFile,
} from "@/lib/nebula/client";
import { getNebulaSortingContext } from "@/lib/nebula/context";
import { createClient } from "@/lib/supabase/server";

// Re-analysis by Nebula is synchronous, like the first sorting request
export const maxDuration = 300;

const ACADEMIC_BUCKET = "academic-materials";
const INGESTION_PREFIX = "ingestion/";

export async function POST(req: Request) {
  try {
    const unlocked = await isAcademicHubUnlocked();
    if (!unlocked) {
      return NextResponse.json(
        { success: false, error: "Academic Hub security gate locked" },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Admin session expired. Please log in again." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const group: NebulaDocumentGroup = body.group;
    const corrections: Partial<NebulaClassification> = body.corrections;

    if (!group || !corrections) {
      return NextResponse.json(
        { success: false, error: "Missing group or correction data" },
        { status: 400 }
      );
    }

    const context = await getNebulaSortingContext();

    // Re-send the group's raw files (in their original order) from ingestion storage
    const files: RawUploadedFile[] = [];
    for (const [index, path] of group.source_file_ids.entries()) {
      if (!path.startsWith(INGESTION_PREFIX) || path.includes("..")) continue;
      const { data: blob, error } = await supabase.storage.from(ACADEMIC_BUCKET).download(path);
      if (error || !blob) {
        console.error(`Failed to read ingested file ${path} for reprocessing:`, error);
        continue;
      }
      files.push({
        id: path,
        name: group.original_filenames[index] || path.split("/").pop() || "file",
        size: blob.size,
        type: blob.type || group.mime_type || "application/octet-stream",
        bytes: new Uint8Array(await blob.arrayBuffer()),
      });
    }

    let result: NebulaSortResult | null = null;
    let notice: string | undefined;

    if (files.length === group.source_file_ids.length && files.length > 0) {
      const outcome = await reprocessGroupWithNebula(files, context, group, corrections);
      result = outcome.result;
      notice = outcome.notice;
    } else {
      notice = "The original files are no longer in ingestion storage, so Nebula could not re-read them.";
    }

    if (!result) {
      // Nebula unavailable: apply the administrator's corrections locally
      const updated = await reevaluateIsolatedGroup(group, corrections, context);
      result = {
        request_id: group.group_id,
        approved: [updated],
        isolated: [],
        rejected: [],
        source: "fallback",
        notice: `${notice} Your corrections were applied without Nebula re-reading the document.`,
      };
    }

    return NextResponse.json({
      success: true,
      result,
      message:
        result.source === "nebula"
          ? "Nebula re-analyzed the document with your information."
          : "Document updated with administrator metadata.",
    });
  } catch (err) {
    console.error("Resubmit error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to re-evaluate document with Nebula." },
      { status: 500 }
    );
  }
}
