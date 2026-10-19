import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ENTITIES = ["schools", "departments", "courses"];

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  try {
    const { entity, id } = await params;
    if (!ENTITIES.includes(entity)) {
      return NextResponse.json({ error: "Unknown structure type" }, { status: 404 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Departments and courses under a deleted school/department are removed by
    // ON DELETE CASCADE; published materials referencing them block the delete.
    const { data, error } = await supabase.from(entity).delete().eq("id", id).select("id");

    if (error) {
      console.error(`Supabase delete error (${entity}):`, error);
      if (error.code === "23503") {
        return NextResponse.json(
          {
            error:
              "Cannot delete: published Academic Hub materials still reference this record. Remove those materials first.",
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting academic structure record:", err);
    return NextResponse.json({ error: "Server error deleting record" }, { status: 500 });
  }
}
