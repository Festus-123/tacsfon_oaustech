import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { schoolSchema, departmentSchema, courseSchema } from "@/lib/validation/schemas";

const ENTITIES = {
  schools: { schema: schoolSchema, select: "*", label: "School / faculty" },
  departments: { schema: departmentSchema, select: "*, schools(name)", label: "Department" },
  courses: { schema: courseSchema, select: "*, departments(name)", label: "Course" },
} as const;

type EntityKey = keyof typeof ENTITIES;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    if (!(entity in ENTITIES)) {
      return NextResponse.json({ error: "Unknown structure type" }, { status: 404 });
    }
    const config = ENTITIES[entity as EntityKey];

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = config.schema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const record: Record<string, unknown> & { code: string } = { ...parseResult.data };
    if (entity === "schools") {
      record.code = record.code.toLowerCase().replace(/\s+/g, "-");
    } else {
      record.code = record.code.toUpperCase();
    }

    const { data, error } = await supabase
      .from(entity)
      .insert(record)
      .select(config.select)
      .single();

    if (error) {
      console.error(`Supabase insert error (${entity}):`, error);
      if (error.code === "23505") {
        return NextResponse.json(
          { error: `${config.label} with code "${record.code}" already exists.` },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, record: data });
  } catch (err) {
    console.error("Error creating academic structure record:", err);
    return NextResponse.json({ error: "Server error saving record" }, { status: 500 });
  }
}
