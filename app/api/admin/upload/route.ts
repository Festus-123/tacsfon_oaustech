import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 5MB size limit" },
        { status: 400 }
      );
    }

    // Validate mime type
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/jfif",
    ];
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    const bucketName = (
      process.env.SUPABASE_STORAGE_BUCKET_NAME || "event_bucket"
    ).trim();

    // Generate safe unique filename
    const fileExt = file.name.split(".").pop() || "jpg";
    const cleanFileName = `flyer-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(cleanFileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        {
          error: `Storage upload failed: ${uploadError.message}. Ensure the '${bucketName}' bucket exists and is set to public.`,
        },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(cleanFileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: uploadData.path,
    });
  } catch (err) {
    console.error("Flyer upload exception:", err);
    return NextResponse.json(
      { error: "Server error occurred while uploading flyer" },
      { status: 500 }
    );
  }
}
