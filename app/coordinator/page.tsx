
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/app/lib/supabase/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import CoordinatorEventQR from "@/app/components/CoordinatorEventQR";

export const instant = false;

type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
};

type AttendanceRecord = {
  id: string;
  event_id: string;
  participant_id: string;
  checked_in_at: string;
};

function formatDate(value: string | null): string {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export default async function CoordinatorPage() {
  await connection();

  // Authenticate using the current user's Supabase session.
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Verify the user's role before using the privileged client.
  const { data: roleRecord, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleError) {
    console.error("Role lookup failed:", roleError);

    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-700 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold">
            Unable to verify access
          </h1>
          <p className="mt-3 text-slate-300">
            Supabase could not verify your account role.
          </p>
          <p className="mt-4 break-words text-sm text-amber-300">
            {roleError.message}
          </p>
        </div>
      </main>
    );
  }

  const actualRole =
    typeof roleRecord?.role === "string"
      ? roleRecord.role.trim().toLowerCase()
      : "";

  if (actualRole !== "admin" && actualRole !== "coordinator") {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-900 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold">Access denied</h1>
          <p className="mt-3 text-slate-300">
            Your account does not have an admin or coordinator role.
          </p>
          <p className="mt-3 break-all text-sm text-slate-400">
            Signed in as: {user.email ?? user.id}
          </p>
        </div>
      </main>
    );
  }

  // Use the privileged client only on the server, after authentication
  // and role validation. Never expose its key to client components.
  const adminClient = createAdminClient();

  // Load events assigned to this exact authenticated user.
  const {
    data: assignments,
    error: assignmentError,
  } = await adminClient
    .from("event_coordinators")
    .select("event_id")
    .eq("coordinator_id", user.id);

  let events: EventRecord[] = [];
  let attendanceRows: AttendanceRecord[] = [];
  const dataErrors: string[] = [];

  if (assignmentError) {
    console.error("Assignment lookup failed:", assignmentError);
    dataErrors.push(`Event assignments: ${assignmentError.message}`);
  } else {
    const eventIds = [
      ...new Set((assignments ?? []).map((item) => item.event_id)),
    ];

    if (eventIds.length > 0) {
      const [eventsResult, attendanceResult] = await Promise.all([
        adminClient
          .from("events")
          .select("id, title, description, starts_at, ends_at")
          .in("id", eventIds)
          .order("starts_at", { ascending: true }),

        adminClient
          .from("attendance")
          .select("id, event_id, participant_id, checked_in_at")
          .in("event_id", eventIds)
          .order("checked_in_at", { ascending: false })
          .limit(100),
      ]);

      if (eventsResult.error) {
        console.error("Events lookup failed:", eventsResult.error);
        dataErrors.push(`Event details: ${eventsResult.error.message}`);
      } else {
        events = (eventsResult.data ?? []) as EventRecord[];
      }

      if (attendanceResult.error) {
        console.error("Attendance lookup failed:", attendanceResult.error);
        dataErrors.push(
          `Attendance records: ${attendanceResult.error.message}`
        );
      } else {
        attendanceRows =
          (attendanceResult.data ?? []) as AttendanceRecord[];
      }
    }
  }

  const totalCheckIns = attendanceRows.length;

  return (
    <main className="min-h-screen bg-[#0b1120] text-slate-100">
      <header className="border-b border-slate-800 bg-[#111a2e]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-sm font-semibold tracking-widest text-blue-400">
              HECURA&apos;27
            </p>
            <h1 className="mt-1 text-2xl font-bold">
              Coordinator Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Signed in as {user.email ?? "User"}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
              Role: {actualRole}
            </p>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-5 py-8">
        {dataErrors.length > 0 && (
          <div
            role="alert"
            className="break-words rounded-xl border border-amber-700 bg-amber-950/40 p-4 text-amber-200"
          >
            <h2 className="font-semibold">
              Some dashboard information could not be loaded
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {dataErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-[#111a2e] p-5">
            <p className="text-sm text-slate-400">Assigned events</p>
            <p className="mt-3 text-3xl font-bold">{events.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111a2e] p-5">
            <p className="text-sm text-slate-400">
              Recent check-ins loaded
            </p>
            <p className="mt-3 text-3xl font-bold">{totalCheckIns}</p>
            <p className="mt-2 text-xs text-slate-500">
              Up to 100 recent records
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold">My Events</h2>
          <p className="mt-1 text-sm text-slate-400">
            Events assigned to your account. Display the event QR for
            registered participants to scan.
          </p>

          {events.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-[#111a2e] p-8">
              <h3 className="font-semibold">No events available</h3>
              <p className="mt-2 text-sm text-slate-400">
                No events were returned for your account. Check the
                event assignment and database configuration.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              {events.map((event) => {
                const count = attendanceRows.filter(
                  (row) => row.event_id === event.id
                ).length;

                return (
                  <article
                    key={event.id}
                    className="min-w-0 rounded-2xl border border-slate-800 bg-[#111a2e] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold">{event.title}</h3>
                      <span className="shrink-0 rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
                        Assigned
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-400">
                      {event.description || "No description provided."}
                    </p>

                    <div className="mt-4 space-y-2 text-sm">
                      <p>
                        <span className="text-slate-500">Starts: </span>
                        {formatDate(event.starts_at)}
                      </p>
                      <p>
                        <span className="text-slate-500">Ends: </span>
                        {formatDate(event.ends_at)}
                      </p>
                      <p>
                        <span className="text-slate-500">
                          Recent check-ins:{" "}
                        </span>
                        {count}
                      </p>
                    </div>

                    <div className="mt-6 border-t border-slate-700 pt-5">
                      <CoordinatorEventQR
                        eventId={event.id}
                        eventTitle={event.title}
                      />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={`/coordinator/events/${event.id}`}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
                      >
                        Open event
                      </Link>

                      <Link
                        href={`/coordinator/events/${event.id}#attendance`}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
                      >
                        View attendance
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section
          id="attendance"
          className="rounded-2xl border border-slate-800 bg-[#111a2e] p-5"
        >
          <h2 className="text-xl font-bold">Recent Attendance</h2>
          <p className="mt-1 text-sm text-slate-400">
            Check-ins for your assigned events.
          </p>

          {attendanceRows.length === 0 ? (
            <p className="mt-5 text-sm text-slate-400">
              No attendance records are available yet.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="px-3 py-3">Event</th>
                    <th className="px-3 py-3">Participant ID</th>
                    <th className="px-3 py-3">Checked in at</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map((row) => {
                    const event = events.find(
                      (item) => item.id === row.event_id
                    );

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-slate-800"
                      >
                        <td className="px-3 py-3">
                          {event?.title ?? "Event"}
                        </td>
                        <td className="break-all px-3 py-3 font-mono text-xs">
                          {row.participant_id}
                        </td>
                        <td className="px-3 py-3">
                          {formatDate(row.checked_in_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
