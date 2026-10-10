import Link from "next/link";

export default function CampusMapPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Back to HECURA’27
        </Link>

        <header className="mt-8">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
            HECURA’27 Student Guide
          </p>
          <h1 className="mt-2 text-4xl font-black">Campus Map & Transport</h1>
          <p className="mt-3 text-slate-600">
            Find campus locations, event venues, and bus timing information.
          </p>
        </header>

        {/* CAMPUS MAP */}
        <section
          id="college-map"
          className="mt-10 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <h2 className="text-2xl font-black">Campus Map</h2>
          <p className="mt-2 text-slate-600">
            Use the college map to locate buildings and event venues.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {/* Replace this with your actual campus map image. */}
            <div className="flex min-h-64 items-center justify-center p-8 text-center text-slate-500">
              Add your college map image here.
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Your actual college map needs to be added to display the campus
            layout here.
          </p>
        </section>

        {/* BUS TIMINGS */}
        <section
          id="bus-timings"
          className="mt-8 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <h2 className="text-2xl font-black">Bus Timings</h2>
          <p className="mt-2 text-slate-600">
            Check transport schedules for your journey to and from campus.
          </p>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-bold text-amber-900">
              Official schedule required
            </h3>
            <p className="mt-2 text-sm leading-6 text-amber-800">
              Official bus routes, pickup locations, and departure times have
              not yet been provided. Add the confirmed college transport
              schedule here before publishing timings to students.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}