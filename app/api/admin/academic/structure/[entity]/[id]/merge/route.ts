import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Merges a duplicate school or department (e.g. a typo created during upload review)
 * into another one: everything that pointed at it is repointed, then it is deleted.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  try {
    const { entity, id } = await params;
    if (entity !== "schools" && entity !== "departments") {
      return NextResponse.json({ error: "Only schools and departments can be merged" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { into_id: intoId } = await request.json();
    if (!intoId || intoId === id) {
      return NextResponse.json({ error: "Choose a different record to merge into" }, { status: 400 });
    }

    const { data: target } = await supabase.from(entity).select("*").eq("id", intoId).maybeSingle();
    if (!target) {
      return NextResponse.json({ error: "Merge target not found" }, { status: 404 });
    }

    const steps: PromiseLike<{ error: { message: string } | null }>[] = [];

    if (entity === "departments") {
      steps.push(
        supabase.from("courses").update({ department_id: intoId }).eq("department_id", id),
        supabase
          .from("materials")
          .update({ department_id: intoId, school_id: target.school_id })
          .eq("department_id", id),
        supabase.from("course_scope_rules").update({ department_id: intoId }).eq("department_id", id)
      );

      // Rules that list the old department under a general course
      const { data: listingRules } = await supabase
        .from("course_scope_rules")
        .select("id, listed_under_department_ids")
        .contains("listed_under_department_ids", [id]);
      for (const rule of listingRules || []) {
        const ids = Array.from(
          new Set((rule.listed_under_department_ids as string[]).map((d) => (d === id ? intoId : d)))
        );
        steps.push(
          supabase.from("course_scope_rules").update({ listed_under_department_ids: ids }).eq("id", rule.id)
        );
      }
    } else {
      steps.push(
        supabase.from("departments").update({ school_id: intoId }).eq("school_id", id),
        supabase.from("courses").update({ school_id: intoId }).eq("school_id", id),
        supabase.from("materials").update({ school_id: intoId }).eq("school_id", id),
        supabase.from("course_scope_rules").update({ school_id: intoId }).eq("school_id", id)
      );
    }

    for (const step of steps) {
      const { error } = await step;
      if (error) {
        console.error(`Merge step failed (${entity} ${id} -> ${intoId}):`, error);
        return NextResponse.json({ error: `Merge failed: ${error.message}` }, { status: 500 });
      }
    }

    const { error: deleteError } = await supabase.from(entity).delete().eq("id", id);
    if (deleteError) {
      return NextResponse.json({ error: `Merged, but could not delete the old record: ${deleteError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, into: target });
  } catch (err) {
    console.error("Error merging academic structure records:", err);
    return NextResponse.json({ error: "Server error merging records" }, { status: 500 });
  }
}
