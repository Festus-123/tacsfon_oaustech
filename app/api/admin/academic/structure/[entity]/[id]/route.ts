import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ENTITIES = ["schools", "departments", "courses", "course_scope_rules"];
const SCOPES = ["general", "school", "department"];

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Changes a course's scope (and the owner that scope needs). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  try {
    const { entity, id } = await params;
    if (entity !== "courses") {
      return NextResponse.json({ error: "Only course scope can be changed here" }, { status: 400 });
    }

    const { supabase, user } = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!SCOPES.includes(body.scope)) {
      return NextResponse.json({ error: "Invalid course scope" }, { status: 400 });
    }
    if (body.scope === "school" && !body.school_id) {
      return NextResponse.json({ error: "Please select the school" }, { status: 400 });
    }
    if (body.scope === "department" && !body.department_id) {
      return NextResponse.json({ error: "Please select the department" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("courses")
      .update({
        scope: body.scope,
        school_id: body.scope === "school" ? body.school_id : null,
        department_id: body.scope === "department" ? body.department_id : null,
      })
      .eq("id", id)
      .select("*, departments(name, school_id)")
      .single();

    if (error || !data) {
      console.error("Supabase course scope update error:", error);
      return NextResponse.json({ error: error?.message || "Course not found" }, { status: 500 });
    }

    return NextResponse.json({ success: true, record: data });
  } catch (err) {
    console.error("Error updating course scope:", err);
    return NextResponse.json({ error: "Server error updating course" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  try {
    const { entity, id } = await params;
    if (!ENTITIES.includes(entity)) {
      return NextResponse.json({ error: "Unknown structure type" }, { status: 404 });
    }

    const { supabase, user } = await requireUser();
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
