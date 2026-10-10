
import Link from "next/link";
import { createClient } from "../lib/supabase/server";

export const instant = false;

export default async function AdminPage() {
  const supabase = await createClient();

  // Step 1: Verify the signed-in user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <h1 className="text-3xl font-bold">HECURA&apos;27 Admin</h1>
        <p className="mt-4 text-slate-300">
          Please sign in with your administrator account to continue.
        </p>
        <Link className="mt-4 inline-block underline" href="/login">
          Go to login
        </Link>
      </main>
    );
  }

  // Step 2: Read the user's role from Supabase
  const { data: roleRecord, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  // Step 3: Diagnose access failures without exposing secrets
  if (roleError || roleRecord?.role !== "admin") {
    console.error("HECURA admin role check:", {
      userId: user.id,
      role: roleRecord?.role ?? null,
      error: roleError?.message ?? null,
      errorCode: roleError?.code ?? null,
    });

    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-900 bg-slate-900 p-8">
          <h1 className="text-3xl font-bold">Admin access check failed</h1>

          <p className="mt-3 text-slate-300">
            Your account is signed in, but the dashboard could not confirm
            administrator access.
          </p>

          <div className="mt-6 rounded-xl bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Signed-in account</p>
            <p className="mt-1 break-all">{user.email ?? "Email unavailable"}</p>

            <p className="mt-4 text-sm text-slate-400">
              Role returned by Supabase
            </p>
            <p className="mt-1 font-semibold">
              {roleRecord?.role ?? "No role returned"}
            </p>

            {roleError && (
              <>
                <p className="mt-4 text-sm text-slate-400">Database error</p>
                <p className="mt-1 break-words text-red-300">
                  {roleError.message}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Error code: {roleError.code}
                </p>
              </>
            )}
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Check the role-reading policy for the user_roles table in Supabase.
          </p>

          <Link
            className="mt-6 inline-block rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950"
            href="/"
          >
            Return to home
          </Link>
        </div>
      </main>
    );
  }

  // Step 4: Render the admin dashboard
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white sm:p-8">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-widest text-cyan-400">
            HECURA&apos;27
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-400">
            Manage events, coordinators, and attendance.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
        >
          View website
        </Link>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <div className="text-3xl">📅</div>
          <h2 className="mt-4 text-xl font-semibold">Events</h2>
          <p className="mt-2 text-slate-400">
            Create and manage HECURA&apos;27 events and sessions.
          </p>
          <p className="mt-4 text-sm text-cyan-400">
            Event management coming next
          </p>
        </article>

        <article className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <div className="text-3xl">👥</div>
          <h2 className="mt-4 text-xl font-semibold">Coordinators</h2>
          <p className="mt-2 text-slate-400">
            Assign coordinators to their designated events.
          </p>
          <p className="mt-4 text-sm text-cyan-400">
            Coordinator management coming next
          </p>
        </article>

        <article className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <div className="text-3xl">📊</div>
          <h2 className="mt-4 text-xl font-semibold">Attendance</h2>
          <p className="mt-2 text-slate-400">
            Review event check-ins and attendance reports.
          </p>
          <p className="mt-4 text-sm text-cyan-400">
            Attendance reports coming next
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Administrator account</h2>
        <p className="mt-2 break-all text-slate-400">
          Signed in as: {user.email ?? user.id}
        </p>
        <p className="mt-2 text-sm text-emerald-400">
          Administrator role verified
        </p>
      </section>
    </main>
  );
}
