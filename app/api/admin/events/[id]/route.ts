import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validation/schemas";

export async function GET(
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

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event: data });
  } catch (err) {
    console.error("Error fetching event:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
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
    const parseResult = eventSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid event data" },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      event_date,
      event_time,
      location,
      image_url,
      external_url,
      category,
      published,
    } = parseResult.data;

    const { data, error } = await supabase
      .from("events")
      .update({
        title,
        description,
        event_date,
        event_time: event_time || null,
        location: location || null,
        image_url: image_url || null,
        external_url: external_url || null,
        category: category || null,
        published,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: data });
  } catch (err) {
    console.error("Error updating event:", err);
    return NextResponse.json({ error: "Server error updating event" }, { status: 500 });
  }
}

export async function DELETE(
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

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    return NextResponse.json({ error: "Server error deleting event" }, { status: 500 });
  }
}
