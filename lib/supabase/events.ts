import { createClient } from "./server";
import { initialEvents, FellowshipEvent } from "@/data/events";

export async function getPublicEvents(): Promise<FellowshipEvent[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("published", true)
      .order("event_date", { ascending: true });

    if (error || !data || data.length === 0) {
      return initialEvents.filter((e) => e.published);
    }

    return data as FellowshipEvent[];
  } catch (err) {
    console.error("Error retrieving public events, using initial seed:", err);
    return initialEvents.filter((e) => e.published);
  }
}

export async function getAdminEvents(): Promise<FellowshipEvent[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    if (error || !data) {
      return initialEvents;
    }

    return data as FellowshipEvent[];
  } catch (err) {
    console.error("Error retrieving admin events, using initial seed:", err);
    return initialEvents;
  }
}

export async function getEventById(id: string): Promise<FellowshipEvent | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      const fallback = initialEvents.find((e) => e.id === id);
      return fallback || null;
    }

    return data as FellowshipEvent;
  } catch {
    const fallback = initialEvents.find((e) => e.id === id);
    return fallback || null;
  }
}
