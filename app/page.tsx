"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const events = [
  {
    title: "Tech Symposium",
    category: "Technical",
    description: "Showcase your technical knowledge and innovative ideas.",
    venue: "Main Auditorium",
    date: "15",
    month: "OCT",
    time: "10:00 AM",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Coding Challenge",
    category: "Competition",
    description: "Solve problems, write code, and challenge yourself.",
    venue: "Computer Lab",
    date: "18",
    month: "OCT",
    time: "9:00 AM",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Project Expo",
    category: "Innovation",
    description: "Present your projects and share creative solutions.",
    venue: "Seminar Hall",
    date: "22",
    month: "OCT",
    time: "11:00 AM",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Tech Talk",
    category: "Knowledge",
    description: "Learn about emerging technologies and new ideas.",
    venue: "Lecture Hall",
    date: "25",
    month: "OCT",
    time: "2:00 PM",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=85",
  },
];

const quickLinks = [
  {
    icon: "▦",
    title: "Explore Events",
    description: "Discover technical events and competitions.",
    target: "Events",
    color: "blue",
  },
  {
    icon: "▧",
    title: "Live Attendance",
    description: "Scan the event QR code to check in.",
    target: "Live Attendance",
    color: "green",
  },
  {
    icon: "♙",
    title: "My Participation",
    description: "View your bookings and attendance.",
    target: "My Bookings",
    color: "purple",
  },
  {
    icon: "⌖",
    title: "Campus Map",
    description: "Explore buildings and find event venues.",
    target: "Campus Map",
    color: "orange",
  },
];

const sessions = [
  {
    title: "Technical Sessions",
    description: "Technical activities and learning experiences.",
    icon: "💻",
  },
  {
    title: "Innovation Sessions",
    description: "Explore creativity, projects, and new technologies.",
    icon: "💡",
  },
  {
    title: "Interactive Sessions",
    description: "Collaborative and engaging activities.",
    icon: "🤝",
  },
  {
    title: "Session Schedule",
    description: "Session timings and venues will be announced soon.",
    icon: "🗓️",
  },
];

export default function Home() {
  const router = useRouter();

  const [activePage, setActivePage] = useState("Home");
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  function navigate(page: string) {
    setProfileOpen(false);

    if (page === "Campus Map") {
      router.push("/campus-map#college-map");
      return;
    }

    if (page === "Transport" || page === "Bus Timings") {
      router.push("/campus-map#bus-timings");
      return;
    }

    if (page === "Login" || page === "Sign in") {
      router.push("/login");
      return;
    }

    if (page === "Admin") {
      router.push("/admin");
      return;
    }

    // All attendance buttons open the dedicated participant scanner.
    if (page === "Live Attendance" || page === "Scan QR for Attendance") {
      router.push("/scan-event");
      return;
    }

    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filteredEvents = events.filter((event) =>
    `${event.title} ${event.category} ${event.description} ${event.venue}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[76px] max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <button
            onClick={() => navigate("Home")}
            className="flex shrink-0 items-center gap-3 text-left"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-xl font-black text-white">
              H
            </span>
            <span>
              <span className="block text-xl font-black tracking-tight">
                HECURA<span className="text-blue-700">&apos;27</span>
              </span>
              <span className="hidden text-xs text-slate-500 sm:block">
                Department of CSE
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {["Home", "Events", "Campus Map", "Transport"].map((item) => (
              <button
                key={item}
                onClick={() => navigate(item)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  activePage === item
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {searchOpen && activePage === "Home" && (
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                aria-label="Search events"
                className="w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:w-44"
              />
            )}

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Toggle event search"
              className="rounded-xl p-2 text-xl hover:bg-slate-100"
            >
              ⌕
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                className="flex items-center gap-2 rounded-full border border-slate-200 p-1.5 pr-2 hover:bg-slate-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-lg">
                  👤
                </span>
                <span className="hidden text-sm font-bold sm:block">
                  Profile
                </span>
                <span className="text-xs">⌄</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-14 z-50 w-64 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
                  <div className="border-b border-slate-100 px-3 py-3">
                    <p className="font-bold">Participant Profile</p>
                    <p className="mt-1 text-xs text-slate-500">HECURA&apos;27</p>
                  </div>

                  {[
                    ["♙", "My Profile"],
                    ["▤", "My Bookings"],
                    ["☑", "My Attendance"],
                    ["⚙", "Settings"],
                  ].map(([icon, label]) => (
                    <button
                      key={label}
                      onClick={() => navigate(label)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-blue-50 hover:text-blue-700"
                    >
                      <span>{icon}</span>
                      {label}
                    </button>
                  ))}

                  <div className="my-2 border-t border-slate-100" />

                  <button
                    onClick={() => navigate("Login")}
                    className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    ↪ Sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HOME PAGE */}
      {activePage === "Home" && (
        <>
          {/* HERO */}
          <section className="relative isolate overflow-hidden bg-[#080d20] text-white">
            <div
              className="absolute inset-0 -z-20 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://chunocollege.s3.ap-south-1.amazonaws.com/btech/CIET-campus.png')",
              }}
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#080d20]/95 via-[#080d20]/85 to-blue-950/45" />

            <div className="mx-auto flex min-h-[450px] max-w-[1500px] items-center px-6 py-16 sm:px-10 lg:px-14">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                  Department of Computer Science and Engineering
                </span>

                <h1 className="mt-7 text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-8xl">
                  HECURA
                  <span className="text-cyan-400">&apos;27</span>
                </h1>

                <p className="mt-4 text-xl font-semibold text-slate-200 sm:text-2xl">
                  Innovate. Connect. Create.
                </p>

                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  Explore technical events, showcase your talent, compete with
                  brilliant minds, and be part of HECURA&apos;27.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("Events")}
                    className="rounded-xl bg-cyan-400 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Explore Events <span className="ml-2">→</span>
                  </button>

                  <button
                    onClick={() => navigate("Live Attendance")}
                    className="rounded-xl border border-white/40 bg-white/5 px-6 py-3.5 font-bold text-white transition hover:bg-white/15"
                  >
                    ▦ &nbsp; Scan QR for Attendance
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("Bus Timings")}
                    className="rounded-xl bg-emerald-500 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-400"
                  >
                    🚌 &nbsp; Bus Timings
                  </button>

                  <button
                    onClick={() => navigate("Campus Map")}
                    className="rounded-xl border border-cyan-300 bg-cyan-300/10 px-6 py-3.5 font-bold text-cyan-200 transition hover:bg-cyan-300/20"
                  >
                    🗺️ &nbsp; Campus Map
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* QUICK LINKS */}
          <section className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 px-5 py-8 sm:grid-cols-2 lg:px-10 xl:grid-cols-4">
            {quickLinks.map((item) => (
              <button
                key={item.title}
                onClick={() => navigate(item.target)}
                className={`group flex min-h-32 items-center gap-4 rounded-2xl border border-transparent p-5 text-left transition hover:-translate-y-1 hover:border-slate-200 hover:shadow-lg ${
                  item.color === "blue"
                    ? "bg-blue-50"
                    : item.color === "green"
                      ? "bg-emerald-50"
                      : item.color === "purple"
                        ? "bg-violet-50"
                        : "bg-amber-50"
                }`}
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl text-white ${
                    item.color === "blue"
                      ? "bg-blue-600"
                      : item.color === "green"
                        ? "bg-emerald-600"
                        : item.color === "purple"
                          ? "bg-violet-600"
                          : "bg-amber-500"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex-1">
                  <span className="block font-extrabold">{item.title}</span>
                  <span className="mt-2 block text-sm leading-5 text-slate-600">
                    {item.description}
                  </span>
                </span>
                <span className="text-xl text-slate-400 transition group-hover:translate-x-1">
                  →
                </span>
              </button>
            ))}
          </section>

          {/* SESSIONS */}
          <section
            id="sessions"
            className="mx-auto max-w-[1500px] px-5 pb-12 lg:px-10"
          >
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
                Explore HECURA&apos;27
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Event Sessions
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Session descriptions, schedules, and venues will be announced
                soon.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {sessions.map((session) => (
                <article
                  key={session.title}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="text-3xl">{session.icon}</div>
                  <h3 className="mt-5 text-xl font-extrabold">
                    {session.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {session.description}
                  </p>
                  <span className="mt-5 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    Details coming soon
                  </span>
                </article>
              ))}
            </div>
          </section>

          {/* EVENTS */}
          <section className="mx-auto max-w-[1500px] px-5 pb-12 lg:px-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
                  Be part of it
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  HECURA&apos;27 Events
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Discover the events and activities organized by the CSE
                  Department.
                </p>
              </div>

              <button
                onClick={() => navigate("Events")}
                className="rounded-xl px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
              >
                View All Events →
              </button>
            </div>

            {searchOpen && (
              <p className="mb-4 text-sm text-slate-500">
                {filteredEvents.length} event(s) found
              </p>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {filteredEvents.map((event) => (
                <article
                  key={event.title}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 rounded-xl bg-white px-3 py-2 text-center shadow">
                      <span className="block text-xl font-black leading-5">
                        {event.date}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {event.month}
                      </span>
                    </div>
                    <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white">
                      {event.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-extrabold">{event.title}</h3>
                    <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                      {event.description}
                    </p>
                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                      <p>⌖ &nbsp; {event.venue}</p>
                      <p>◷ &nbsp; {event.time}</p>
                    </div>
                    <button
                      onClick={() => navigate("Events")}
                      className="mt-5 w-full rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-700 hover:text-white"
                    >
                      Event Details →
                    </button>
                  </div>
                </article>
              ))}

              {filteredEvents.length === 0 && (
                <p className="col-span-full rounded-2xl bg-white p-8 text-center text-slate-500">
                  No events match your search.
                </p>
              )}
            </div>

            <p className="mt-5 text-xs text-slate-400">
              Event names, dates, and venues shown here are sample content.
              Replace them with the official HECURA&apos;27 schedule.
            </p>
          </section>

          {/* ATTENDANCE BANNER */}
          <section className="mx-5 mb-12 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-800 to-indigo-900 px-6 py-9 text-white sm:mx-10 sm:px-10 sm:py-12">
            <div className="mx-auto flex max-w-[1300px] flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
                  HECURA&apos;27 Check-in
                </p>
                <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                  Ready to mark your attendance?
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                  Open the scanner and scan the QR code displayed by the event
                  coordinator at your session.
                </p>
              </div>

              <button
                onClick={() => navigate("Live Attendance")}
                className="shrink-0 rounded-xl bg-cyan-400 px-6 py-4 font-extrabold text-slate-950 transition hover:bg-cyan-300"
              >
                Open QR Scanner →
              </button>
            </div>
          </section>
        </>
      )}

      {/* EVENTS LIST */}
      {activePage === "Events" && (
        <section className="mx-auto min-h-[65vh] max-w-[1500px] px-5 py-12 lg:px-10">
          <button
            onClick={() => navigate("Home")}
            className="mb-6 text-sm font-bold text-blue-700"
          >
            ← Back to Home
          </button>

          <h1 className="text-3xl font-black">HECURA&apos;27 Events</h1>
          <p className="mt-2 text-slate-500">
            Explore the activities organized by the CSE Department.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {events.map((event) => (
              <article
                key={event.title}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-44 w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    {event.category}
                  </p>
                  <h2 className="mt-2 text-xl font-extrabold">{event.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {event.description}
                  </p>
                  <p className="mt-4 text-sm">⌖ {event.venue}</p>
                  <p className="mt-2 text-sm">◷ {event.time}</p>
                  <button
                    onClick={() => navigate("Live Attendance")}
                    className="mt-5 w-full rounded-xl bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800"
                  >
                    Scan Attendance QR
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* OTHER PAGE PLACEHOLDERS */}
      {activePage !== "Home" && activePage !== "Events" && (
        <section className="mx-auto min-h-[65vh] max-w-4xl px-5 py-12">
          <button
            onClick={() => navigate("Home")}
            className="mb-6 text-sm font-bold text-blue-700"
          >
            ← Back to Home
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
              HECURA&apos;27
            </p>
            <h1 className="mt-3 text-3xl font-black">{activePage}</h1>
            <p className="mt-3 leading-7 text-slate-500">
              This section is part of the HECURA&apos;27 portal. Its
              functionality will be connected in the next development step.
            </p>
            <button
              onClick={() => navigate("Events")}
              className="mt-6 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
            >
              Browse Events →
            </button>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-3 px-5 py-6 text-sm text-slate-500 sm:flex-row lg:px-10">
          <div>
            <p className="font-black text-slate-900">
              HECURA<span className="text-blue-700">&apos;27</span>
            </p>
            <p className="mt-1">
              Department of Computer Science and Engineering
            </p>
          </div>
          <p className="self-center">Innovate. Connect. Create.</p>
        </div>
      </footer>
    </main>
  );
}