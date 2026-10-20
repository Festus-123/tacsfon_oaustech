import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { semesterSchema } from "@/lib/validation/schemas";

const SESSION_FORMAT = /^\d{4}\/\d{4}$/;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const sessionName = String(body.session_name || "").trim();

    if (!SESSION_FORMAT.test(sessionName)) {
      return NextResponse.json(
        { error: "Academic session must look like 2025/2026." },
        { status: 400 }
      );
    }

    // Find or create the academic session by name
    let { data: session } = await supabase
      .from("academic_sessions")
      .select("id, name")
      .eq("name", sessionName)
      .maybeSingle();

    if (!session) {
      const { data: created, error: sessionError } = await supabase
        .from("academic_sessions")
        .insert({ name: sessionName })
        .select("id, name")
        .single();

      if (sessionError || !created) {
        console.error("Supabase academic session insert error:", sessionError);
        return NextResponse.json(
          { error: sessionError?.message || "Could not create academic session" },
          { status: 500 }
        );
      }
      session = created;
    }

    const parseResult = semesterSchema.safeParse({
      academic_session_id: session.id,
      name: body.name,
      start_date: body.start_date,
      end_date: body.end_date,
      price: Number(body.price),
      status: body.status,
      description: body.description || "",
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid semester data" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("semesters")
      .insert({ ...parseResult.data, description: parseResult.data.description || null })
      .select("*")
      .single();

    if (error) {
      console.error("Supabase semester insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      semester: { ...data, academic_session_name: session.name },
    });
  } catch (err) {
    console.error("Error creating semester:", err);
    return NextResponse.json({ error: "Server error saving semester" }, { status: 500 });
  }
}
