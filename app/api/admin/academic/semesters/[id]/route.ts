import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STATUSES = ["DRAFT", "ACTIVE", "CLOSED", "EXPIRED"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid semester status" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("semesters")
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, status")
      .single();

    if (error || !data) {
      console.error("Supabase semester update error:", error);
      return NextResponse.json({ error: error?.message || "Semester not found" }, { status: 500 });
    }

    return NextResponse.json({ success: true, semester: data });
  } catch (err) {
    console.error("Error updating semester:", err);
    return NextResponse.json({ error: "Server error updating semester" }, { status: 500 });
  }
}
