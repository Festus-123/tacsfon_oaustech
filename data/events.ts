export interface FellowshipEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time?: string;
  location?: string;
  image_url?: string;
  external_url?: string;
  category?: string;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export const initialEvents: FellowshipEvent[] = [
  {
    id: "evt-sunday-service",
    title: "Worship With Us This Sunday",
    description:
      "Join the TACSFON family for a transformative atmosphere of passionate praise, reverent worship, and life-changing biblical exposition. Come along with your friends and coursemates!",
    event_date: "2026-09-13",
    event_time: "Sunday School @ 8:00 AM | Main Service @ 9:00 AM",
    location: "TACSFON Center, Methodist Primary School Classroom, Igodan, Okitipupa",
    image_url: "/assets/sunday-service.jpg",
    category: "Sunday Service",
    published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "evt-friday-prayer",
    title: "Friday Campus Prayer Meeting",
    description:
      "A charged atmosphere of intercession, petition, and spiritual refreshing. We are gathering across centers to stand in prayer for our university, families, and academic success.",
    event_date: "2026-09-18",
    event_time: "5:30 PM Prompt",
    location: "TACSFON Worship Center (Igodan) & Mega Campus (500lvl Mech Hall)",
    image_url: "/assets/prayer-meeting.jpg",
    category: "Prayer",
    published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "evt-tuesday-bible-study",
    title: "Rooted in the Word Tuesday Bible Study",
    description:
      "A foundational study session breaking down biblical truths, verse by verse. Open for questions, practical student applications, and spiritual discipleship.",
    event_date: "2026-09-15",
    event_time: "5:30 PM Prompt",
    location: "TACSFON Fellowship Center, Igodan",
    image_url: "/assets/bible study.jpg",
    category: "Bible Study",
    published: true,
    created_at: new Date().toISOString(),
  },
];
