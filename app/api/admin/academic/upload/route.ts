import { NextResponse } from "next/server";
import { isAcademicHubUnlocked } from "@/lib/security/academic-hub-key";
import { sendSortingRequestToNebula, RawUploadedFile } from "@/lib/nebula/client";
import { getNebulaSortingContext } from "@/lib/nebula/context";
import { createClient } from "@/lib/supabase/server";

// Nebula analyses pages synchronously and can take minutes for larger batches
export const maxDuration = 300;

const MAX_TOTAL_BYTES = 100 * 1024 * 1024; // 100 MB per sorting request
const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp", "docx"];
const ACADEMIC_BUCKET = "academic-materials";
const INGESTION_PREFIX = "ingestion";

// Raw files are uploaded by the browser straight to Supabase Storage (Vercel caps
// function request bodies at 4.5 MB), so this route only receives their paths.
interface IngestedFileRef {
  path: string;
  name: string;
  type?: string;
}

/**
 * Checks the file's leading bytes against its extension so a renamed file
 * cannot slip through on extension/MIME alone.
 */
function matchesFileSignature(bytes: Uint8Array, ext: string): boolean {
  const startsWith = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);

  switch (ext) {
    case "pdf":
      return startsWith([0x25, 0x50, 0x44, 0x46]); // %PDF
    case "jpg":
    case "jpeg":
      return startsWith([0xff, 0xd8, 0xff]);
    case "png":
      return startsWith([0x89, 0x50, 0x4e, 0x47]);
    case "webp":
      return startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8); // RIFF....WEBP
    case "docx":
      return startsWith([0x50, 0x4b, 0x03, 0x04]); // ZIP container
    default:
      return false;
  }
}

export async function POST(req: Request) {
  try {
    // 1. Security Gate Check
    const unlocked = await isAcademicHubUnlocked();
    if (!unlocked) {
      return NextResponse.json(
        {
          success: false,
          error: "Academic Hub security gate locked. Please enter master security key first.",
        },
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

    // 2. Parse ingestion manifest
    const body = await req.json().catch(() => null);
    const requestId: unknown = body?.request_id;
    // Material type chosen for the whole upload; empty means Nebula auto-detects it per document
    const chosenMaterialType = typeof body?.material_type === "string" ? body.material_type.trim() : "";
    const refs: IngestedFileRef[] = Array.isArray(body?.files) ? body.files : [];

    if (typeof requestId !== "string" || !/^[a-zA-Z0-9-]{8,64}$/.test(requestId)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid sorting request ID." },
        { status: 400 }
      );
    }

    if (refs.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files received for sorting." },
        { status: 400 }
      );
    }

    // 3. Validate paths and extensions before downloading anything
    const expectedPrefix = `${INGESTION_PREFIX}/${requestId}/`;
    for (const ref of refs) {
      if (
        typeof ref?.path !== "string" ||
        typeof ref?.name !== "string" ||
        !ref.path.startsWith(expectedPrefix) ||
        ref.path.includes("..")
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid file reference in sorting request." },
          { status: 400 }
        );
      }

      const ext = ref.name.split(".").pop()?.toLowerCase();
      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${ref.name}" has unsupported format .${ext}. Only PDF, JPG, JPEG, PNG, WebP, and DOCX are allowed.`,
          },
          { status: 400 }
        );
      }
    }

    // 4. Download from storage, verify actual size and file signature
    let totalSize = 0;
    const rawFiles: RawUploadedFile[] = [];

    for (const ref of refs) {
      const { data: blob, error: downloadError } = await supabase.storage
        .from(ACADEMIC_BUCKET)
        .download(ref.path);

      if (downloadError || !blob) {
        console.error(`Failed to read ingested file ${ref.path}:`, downloadError);
        return NextResponse.json(
          {
            success: false,
            error: `Could not read uploaded file "${ref.name}" from storage. Please re-upload and try again.`,
          },
          { status: 502 }
        );
      }

      totalSize += blob.size;
      if (totalSize > MAX_TOTAL_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: "Total upload size exceeds 100 MB. Please select fewer documents.",
          },
          { status: 413 }
        );
      }

      const bytes = new Uint8Array(await blob.arrayBuffer());
      const ext = ref.name.split(".").pop()!.toLowerCase();

      if (!matchesFileSignature(bytes, ext)) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${ref.name}" does not look like a real .${ext} file. It may be corrupted or renamed.`,
          },
          { status: 400 }
        );
      }

      rawFiles.push({
        // The storage path doubles as the file ID so approval can locate the source file
        id: ref.path,
        name: ref.name,
        size: blob.size,
        type: ref.type || blob.type || "application/octet-stream",
        bytes,
      });
    }

    // 5. Gather Dynamic Academic Hub Context
    const context = await getNebulaSortingContext();

    if (chosenMaterialType && !context.materialTypes.some((t) => t.name === chosenMaterialType)) {
      return NextResponse.json(
        { success: false, error: `Unknown material type "${chosenMaterialType}".` },
        { status: 400 }
      );
    }

    // 6. Dispatch to Nebula AI
    const result = await sendSortingRequestToNebula(rawFiles, context, requestId, {
      materialType: chosenMaterialType || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Nebula analyzed ${rawFiles.length} document(s). Review ready.`,
      result,
    });
  } catch (err) {
    console.error("Document ingestion error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process raw document sorting request.",
      },
      { status: 500 }
    );
  }
}
