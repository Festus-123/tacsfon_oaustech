export interface UnitItem {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  responsibilities: string[];
  regularActivity?: string;
  iconName: string;
  image?: string;
}

export interface LeadershipRole {
  role: string;
  category: 'Executive' | 'Coordinator';
  description: string;
  holderName?: string; // intentionally optional/placeholder per specification
}

export interface ActivitySchedule {
  day: string;
  title: string;
  time: string;
  venue: string;
  description: string;
  type: 'weekly' | 'monthly' | 'annual';
}

export const fellowshipContent = {
  identity: {
    shortName: "TACSFON (OAUSTECH)",
    fullName: "The Apostolic Church Student Fellowship of Nigeria",
    chapter: "OAUSTECH Chapter, Okitipupa",
    university: "Olusegun Agagu University of Science and Technology",
    yearlyTheme: "The Davidic Generation",
    yearlyThemeSub: "A generation after God's own heart—walking in devotion, worship, courage, and obedience.",
    motto: "Let no man despise thy youth",
    mottoScripture: "1 Timothy 4:12",
    parentChurchMotto: "One Fold, One Shepherd",
    parentChurchScripture: "John 10:16",
    summary:
      "A vibrant, Christ-centered student fellowship within OAUSTECH cultivating spiritual growth, discipleship, genuine brotherhood, and kingdom service.",
  },

  venues: {
    primary: "Igodan Methodist Primary School Classroom, Igodan, Okitipupa, Ondo State",
    campus: "Mega Campus (500lvl Mech Hall), OAUSTECH",
  },

  contact: {
    email: "festusphillip19@gmail.com",
    phone: "09140809527",
    formattedPhone: "+234 914 080 9527",
    address: "Igodan Methodist Primary School, Okitipupa, Ondo State, Nigeria",
    hours: "Services held on Sundays (8:00 AM), Tuesdays (5:30 PM), & Fridays (5:30 PM)",
  },

  schedule: [
    {
      day: "Sunday",
      title: "Sunday Worship Service",
      time: "8:00 AM (Sunday School) & 9:00 AM (Service)",
      venue: "TACSFON Center, Igodan Methodist Primary School Classroom",
      description:
        "Our primary weekly gathering where students gather in reverent worship, hear sound doctrine from God's Word, pray, and fellowship with brethren.",
      type: "weekly" as const,
    },
    {
      day: "Tuesday",
      title: "Bible Study",
      time: "5:30 PM Prompt",
      venue: "TACSFON Center / Campus Fellowship Point",
      description:
        "An interactive scriptural examination designed to deepen personal understanding of the Bible, address student life questions, and build theological grounding.",
      type: "weekly" as const,
    },
    {
      day: "Friday",
      title: "Prayer Meeting",
      time: "5:30 PM Prompt",
      venue: "Igodan Center & Mega Campus (500lvl Mech Hall)",
      description:
        "A dedicated time of collective intercession, thanksgiving, spiritual empowerment, and seeking God's face for our campus, families, and academic journey.",
      type: "weekly" as const,
    },
    {
      day: "Saturday",
      title: "Choir Practice",
      time: "4:00 PM",
      venue: "TACSFON Center",
      description:
        "Vocal training, spiritual preparation, and rehearsal for the Choir Unit to minister in worship and music during fellowship services.",
      type: "weekly" as const,
    },
    {
      day: "Monthly",
      title: "All-Night Vigil",
      time: "10:00 PM – Dawn (One Friday a Month)",
      venue: "TACSFON Worship Center",
      description:
        "Extended night of fervent prayer, prophetic ministration, worship, and spiritual renewal. Held once every month.",
      type: "monthly" as const,
    },
    {
      day: "Periodic",
      title: "Evangelism & Campus Outreach",
      time: "Scheduled Periodically",
      venue: "OAUSTECH Hostels & Okitipupa Environs",
      description:
        "Sharing the love and saving gospel of Jesus Christ with fellow students across departments, halls, and local communities.",
      type: "monthly" as const,
    },
    {
      day: "Annual",
      title: "TACSFON Week & Anniversary",
      time: "Annual Fellowship Calendar",
      venue: "OAUSTECH Campus & Igodan Center",
      description:
        "A week-long celebration of God's faithfulness featuring seminars, symposiums, worship night, variety events, and thanksgiving.",
      type: "annual" as const,
    },
  ],

  units: [
    {
      id: "bible-study",
      name: "Bible Study Unit",
      shortDescription:
        "Anchoring and coordinating scriptural teaching, discipleship discussions, and biblical understanding.",
      fullDescription:
        "The Bible Study Unit is committed to feeding the fellowship with sound scriptural truth. Members facilitate Tuesday Bible studies, coordinate study guides, and foster a culture of studying the Scriptures with diligence and humility.",
      responsibilities: [
        "Coordinates weekly Tuesday Bible Study sessions",
        "Anchors participatory discipleship discussions and Q&A",
        "Develops scriptural study outlines aligned with fellowship focus",
        "Encourages believers to apply God's Word to campus challenges",
      ],
      regularActivity: "Tuesday Bible Study (5:30 PM)",
      iconName: "BookOpen",
      image: "/assets/41306521578895022.jfif",
    },
    {
      id: "prayer",
      name: "Prayer Unit",
      shortDescription:
        "Guiding the fellowship into fervent, persistent prayer, intercession, and spiritual sensitivity.",
      fullDescription:
        "The Prayer Unit stands in the gap for the fellowship, students, university administration, and our nation. They lead the Friday prayer meetings and create an atmosphere where students cultivate an enduring personal altar.",
      responsibilities: [
        "Coordinates Friday Prayer Meetings and monthly vigils",
        "Organizes intercessory prayer chains for examinations and fellowship programs",
        "Anchors devotional prayer sessions before main services",
        "Fosters spiritual vigilance and reliance on the Holy Spirit",
      ],
      regularActivity: "Friday Prayer Meeting (5:30 PM)",
      iconName: "Flame",
      image: "/assets/Screenshot_20260907_231307_Instagram.jpg",
    },
    {
      id: "choir",
      name: "Choir Unit",
      shortDescription:
        "Leading the congregation into spirit-filled praise, worship, and musical excellence.",
      fullDescription:
        "The Choir Unit ministers to God and His people through vocal and musical harmony. More than a singing group, it is an altar of reverent worship leading believers to encounter God's tangible presence.",
      responsibilities: [
        "Leads worship and praise during weekly and special services",
        "Conducts rigorous Saturday rehearsals and spiritual preparations",
        "Represents TACSFON in joint campus ministrations and church conventions",
        "Mentors members in music theory, vocal technique, and heart of worship",
      ],
      regularActivity: "Saturday Choir Practice (4:00 PM)",
      iconName: "Music",
      image: "/assets/Screenshot_20260907_231426_Instagram.jpg",
    },
    {
      id: "drama",
      name: "Drama Unit",
      shortDescription:
        "Communicating the Gospel, biblical truths, and moral messages through evocative Christian drama.",
      fullDescription:
        "The Drama Unit uses stage presentations, spoken word, and creative skits to illustrate the reality of redemption, Christian living, and God's unyielding grace to the university community.",
      responsibilities: [
        "Coordinates stage ministrations during special services and programs",
        "Writes and rehearses faith-centered scripts addressing real student struggles",
        "Collaborates with other units during outreach and TACSFON Week",
        "Nurtures members' acting, theatrical, and storytelling gifts for God's glory",
      ],
      regularActivity: "Program Rehearsals & Ministry",
      iconName: "Theater",
      image: "/assets/Screenshot_20260907_231201_Instagram.jpg",
    },
    {
      id: "evangelism",
      name: "Evangelism Unit",
      shortDescription:
        "Reaching the unsaved, sharing the Gospel across hostels, and spearheading campus outreach.",
      fullDescription:
        "The Evangelism Unit carries the heartbeat of the Great Commission. Through tract distributions, room-to-room evangelism, and open-air programs, they proclaim Christ to every corner of OAUSTECH.",
      responsibilities: [
        "Plans and anchors periodic hostel and campus evangelism outreaches",
        "Follows up on new converts and first-time attendees",
        "Distributes Christian literature, Bibles, and gospel tracts",
        "Stirs a continuous evangelical burden across the fellowship",
      ],
      regularActivity: "Periodic Campus Outreach",
      iconName: "Send",
      image: "/assets/Screenshot_20260907_231400_Instagram.jpg",
    },
    {
      id: "academic",
      name: "Academic Unit",
      shortDescription:
        "Fostering academic excellence, providing peer tutorials, and supporting students' degree journeys.",
      fullDescription:
        "Recognizing that believers must shine in character and competence, the Academic Unit organizes free tutorials, mentorship, past question reviews, and Academic Sundays to help students excel in their degree studies.",
      responsibilities: [
        "Organizes revision tutorials across faculty courses before exams",
        "Pairs junior undergraduates with accomplished senior course mentors",
        "Coordinates Academic Sunday workshops and career development sessions",
        "Provides study materials and tips for university success",
      ],
      regularActivity: "Pre-Exam Tutorials & Mentorship",
      iconName: "GraduationCap",
      image: "/assets/41306521578895022.jfif",
    },
    {
      id: "ushering",
      name: "Ushering Unit",
      shortDescription:
        "Providing warm hospitality, orderly service coordination, and a welcoming environment.",
      fullDescription:
        "The Ushering Unit serves as the welcoming smile of TACSFON. They ensure order, assist attendees with comfortable seating, distribute bulletins, and coordinate smooth transitions during all gatherings.",
      responsibilities: [
        "Welcomes members and first-time guests at the entrance with Christian warmth",
        "Manages seating arrangements and maintains quiet reverence during services",
        "Coordinates the collection and collation of offerings and tithes",
        "Ensures service logistics and sanctuary tidiness before and after meetings",
      ],
      regularActivity: "Service Coordination & Welcome",
      iconName: "HeartHandshake",
      image: "/assets/Screenshot_20260907_231228_Instagram.jpg",
    },
    {
      id: "organizing",
      name: "Organizing Unit",
      shortDescription:
        "Managing practical logistics, sound setup, transport coordination, and venue preparations.",
      fullDescription:
        "The Organizing Unit is the logistical backbone of TACSFON. From venue preparation, transport coordination for students traveling to services, to instrument safety, they ensure every event operates seamlessly.",
      responsibilities: [
        "Coordinates member transportation to and from fellowship venues",
        "Manages venue setup, seating arrangements, and post-service tear-down",
        "Maintains and safely transports fellowship instruments and assets",
        "Provides logistical oversight for major conferences and outdoor programs",
      ],
      regularActivity: "Logistics & Venue Setup",
      iconName: "Layers",
      image: "/assets/Church photography_ worship + serve team.jfif",
    },
    {
      id: "brothers",
      name: "Brothers Unit",
      shortDescription:
        "Cultivating Christian manhood, brotherhood fellowship, mutual accountability, and recreation.",
      fullDescription:
        "The Brothers Unit unites young men in TACSFON to build godly discipline, leadership, and brotherly affection. Through sports like football, campfire talks, and life sessions, brothers sharpen one another as iron sharpens iron.",
      responsibilities: [
        "Organizes brotherhood fellowship meetups, talks, and discussions",
        "Coordinates sports recreation (football matches, exercise)",
        "Builds mutual accountability and spiritual encouragement among male students",
        "Fosters mentorship on career, integrity, and future family leadership",
      ],
      regularActivity: "Brotherhood Meetings & Sports",
      iconName: "Shield",
      image: "/assets/Screenshot_20260907_231244_Instagram.jpg",
    },
    {
      id: "sisters",
      name: "Sisters Unit",
      shortDescription:
        "Fostering godly sisterhood, spiritual maturity, mutual support, and life skills for young women.",
      fullDescription:
        "The Sisters Unit creates a safe and inspiring space for female students to connect, grow in Christian character, and navigate university pressures with modesty, purity, and purpose in Christ.",
      responsibilities: [
        "Organizes sisters' fellowship meetings, discussions, and prayer circles",
        "Discusses spiritual purity, emotional well-being, and academic resilience",
        "Provides mutual support and care across hostel communities",
        "Equips sisters with practical life, leadership, and career insights",
      ],
      regularActivity: "Sisters' Fellowship Gatherings",
      iconName: "Sparkles",
      image: "/assets/Screenshot_20260907_231408_Instagram.jpg",
    },
  ],

  leadership: [
    {
      role: "President",
      category: "Executive" as const,
      description:
        "Provides overall spiritual leadership, vision execution, and organizational guidance for the fellowship across OAUSTECH.",
    },
    {
      role: "Vice President",
      category: "Executive" as const,
      description:
        "Supports the President in spiritual oversight, unit coordination, and internal administration of fellowship operations.",
    },
    {
      role: "General Secretary",
      category: "Executive" as const,
      description:
        "Directs fellowship secretarial operations, official documentation, record keeping, notices, and formal communication.",
    },
    {
      role: "Sister Coordinator",
      category: "Executive" as const,
      description:
        "Coordinates, advises, and nurtures the female students within the fellowship, spearheading sisters' programs.",
    },
    {
      role: "Bible Study Coordinator",
      category: "Coordinator" as const,
      description:
        "Coordinates Bible Study Unit curricula, weekly facilitation schedules, and scriptural discussions.",
    },
    {
      role: "Prayer Unit Coordinator",
      category: "Coordinator" as const,
      description:
        "Leads the Prayer Unit, organizing Friday gatherings, prayer rosters, and campus intercession vigils.",
    },
    {
      role: "Evangelism Coordinator",
      category: "Coordinator" as const,
      description:
        "Mobilizes the Evangelism Unit for outreach, hostel visitations, gospel tract campaigns, and soul winning.",
    },
    {
      role: "Ushering Coordinator",
      category: "Coordinator" as const,
      description:
        "Oversees sanctuary order, guest reception, ushering training, and logistical support during services.",
    },
    {
      role: "Organizing Coordinator",
      category: "Coordinator" as const,
      description:
        "Oversees transportation, audio-visual packing, equipment setup, and venue arrangements for programs.",
    },
    {
      role: "Academic Coordinator",
      category: "Coordinator" as const,
      description:
        "Organizes student tutorials, academic counseling, study groups, and exam preparation programs.",
    },
    {
      role: "Drama Coordinator 1",
      category: "Coordinator" as const,
      description:
        "Co-coordinates dramatic stage presentations, script editing, and actor preparation for fellowship services.",
    },
    {
      role: "Drama Coordinator 2",
      category: "Coordinator" as const,
      description:
        "Co-coordinates drama rehearsals, stage production, costume coordination, and ministry outreach skits.",
    },
    {
      role: "Technical Coordinator",
      category: "Coordinator" as const,
      description:
        "Manages fellowship audio-visual equipment, public address systems, sound engineering, and media gear.",
    },
    {
      role: "Brother Coordinator",
      category: "Coordinator" as const,
      description:
        "Guides the Brothers Unit, fostering male student fellowship, sports engagements, and Christian mentorship.",
    },
  ],

  aboutSections: {
    heroHeading: "A Sacred Fellowship on Campus",
    heroSubheading:
      "Nurturing faith, scholarship, and genuine Christian community at Olusegun Agagu University of Science and Technology.",
    historyPlaceholder:
      "[Official History Placeholder: TACSFON OAUSTECH was planted as a student expression of The Apostolic Church Nigeria to unite and equip Christian undergraduates in Okitipupa.]",
    apostolicConnection:
      "Connected to the deep heritage of The Apostolic Church (TAC), TACSFON embraces Pentecostal prayer, biblical sound doctrine, apostolic order, and holy living while adapting graciously to university student life.",
    jccfConnection:
      "As an active member of the Joint Campus Christian Fellowship (JCCF) at OAUSTECH, TACSFON works in brotherly love with fellow Christian bodies across the university, recognizing one Lord, one faith, and one baptism.",
    vision:
      "[Official Vision Placeholder: To raise a generation of university students grounded in sound doctrine, empowered by the Holy Spirit, and excelling in character and scholarship.]",
    mission:
      "[Official Mission Placeholder: To preach the Gospel of Christ to all students, build a supportive Christian family on campus, and equip graduates for impactful kingdom service in society.]",
    coreValues: [
      {
        title: "Sound Doctrine",
        desc: "Unwavering commitment to the biblical truth of God's Word as our supreme rule of faith and practice.",
      },
      {
        title: "Holy Spirit Empowerment",
        desc: "Dependence on the power, gifts, and guidance of the Holy Spirit for righteous living and fruitful service.",
      },
      {
        title: "Academic Diligence",
        desc: "Striving for distinction in our academic courses as an authentic testimony of Christian stewardship.",
      },
      {
        title: "Genuine Love & Brotherhood",
        desc: "Building a compassionate student community where every member is valued, cared for, and spiritually strengthened.",
      },
      {
        title: "Evangelical Zeal",
        desc: "Carrying the light of Christ into lecture halls, hostels, and surrounding communities with boldness.",
      },
    ],
  },
};
