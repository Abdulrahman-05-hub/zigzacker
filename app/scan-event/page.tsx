import Link from "next/link";
import ParticipantEventScanner from "@/app/components/ParticipantEventScanner";

export default function ScanEventPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="inline-block text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Back to HECURA’27
        </Link>

        <header className="mt-8">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
            HECURA’27 Check-in
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Scan QR for Attendance
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            Sign in with your registered participant account, allow camera
            access, and scan the QR code displayed by the event coordinator.
          </p>
        </header>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <ParticipantEventScanner />
        </section>
      </div>
    </main>
  );
}