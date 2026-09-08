import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validation/schemas";
import { initialEvents, FellowshipEvent } from "@/data/events";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    if (error) {
      console.warn("Supabase fetch error, returning seed list:", error.message);
      return NextResponse.json({ events: initialEvents, source: "seed" });
    }

    return NextResponse.json({ events: data || initialEvents, source: "database" });
  } catch (err: unknown) {
    console.error("Admin events GET error:", err);
    return NextResponse.json({ error: "Server error fetching events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
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
      .insert([
        {
          title,
          description,
          event_date,
          event_time: event_time || null,
          location: location || null,
          image_url: image_url || null,
          external_url: external_url || null,
          category: category || null,
          published,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase event insert error:", error);
      return NextResponse.json(
        {
          error:
            "Could not save to Supabase database. Please ensure the events table is created by running supabase/schema.sql in the Supabase SQL Editor.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, event: data }, { status: 201 });
  } catch (err: unknown) {
    console.error("Admin event create error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
