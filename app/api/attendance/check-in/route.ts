
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createClient } from "@/app/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";



const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify the coordinator's authenticated session.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return json({ error: "Coordinator sign-in required." }, 401);
    }

    const body = await request.json().catch(() => null);
    const token = body?.token;

    if (typeof token !== "string" || token.length > 4096) {
      return json({ error: "A valid QR token is required." }, 400);
    }

    // Verify signature, algorithm, issuer, audience, and expiration.
    const secret = process.env.ATTENDANCE_TOKEN_SECRET;

    if (!secret || secret.length < 32) {
      return json({ error: "Attendance service is not configured." }, 500);
    }

    let payload;

    try {
      const verified = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
        {
          algorithms: ["HS256"],
          issuer: "hecura27",
          audience: "hecura-attendance",
        }
      );

      payload = verified.payload;
    } catch {
      return json(
        { error: "QR expired or invalid. Ask the participant to refresh it." },
        401
      );
    }

    const participantId = payload.sub;
    const eventId = payload.eventId;

    if (
      payload.purpose !== "hecura-attendance" ||
      typeof participantId !== "string" ||
      !UUID.test(participantId) ||
      typeof eventId !== "string" ||
      !UUID.test(eventId) ||
      typeof payload.jti !== "string"
    ) {
      return json({ error: "Invalid attendance QR." }, 401);
    }

    // Verify the scanner's role.
    const { data: roleRecord, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError) {
      console.error("Scanner role lookup failed:", roleError.message);
      return json({ error: "Could not verify scanner permissions." }, 500);
    }

    const role =
      typeof roleRecord?.role === "string"
        ? roleRecord.role.trim().toLowerCase()
        : "";

    if (role !== "coordinator" && role !== "admin") {
      return json({ error: "Not authorized to record attendance." }, 403);
    }

    // Coordinators may scan only their assigned events.
    if (role === "coordinator") {
      const { data: assignment, error: assignmentError } = await supabase
        .from("event_coordinators")
        .select("event_id")
        .eq("coordinator_id", user.id)
        .eq("event_id", eventId)
        .maybeSingle();

      if (assignmentError) {
        console.error("Assignment check failed:", assignmentError.message);
        return json({ error: "Could not verify event assignment." }, 500);
      }

      if (!assignment) {
        return json(
          { error: "You are not assigned to this event." },
          403
        );
      }
    }

    // Use a server-only privileged client for the final write.
    // Never expose this key to the browser.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.error("Server-side attendance database credentials are missing.");
      return json({ error: "Attendance database is not configured." }, 500);
    }

    const adminDb = createSupabaseClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Recheck the event schedule and participant profile server-side.
    const [eventResult, participantResult] = await Promise.all([
      adminDb
        .from("events")
        .select("id, title, starts_at, ends_at")
        .eq("id", eventId)
        .maybeSingle(),

      adminDb
        .from("participants")
        .select("id")
        .eq("id", participantId)
        .maybeSingle(),
    ]);

    if (eventResult.error || participantResult.error) {
      console.error(
        "Final attendance validation failed:",
        eventResult.error?.message,
        participantResult.error?.message
      );
      return json({ error: "Could not validate attendance details." }, 500);
    }

    const event = eventResult.data;

    if (!event || !participantResult.data) {
      return json({ error: "Event or participant not found." }, 404);
    }

    const now = Date.now();
    const starts = event.starts_at
      ? new Date(event.starts_at).getTime()
      : NaN;
    const ends = event.ends_at
      ? new Date(event.ends_at).getTime()
      : NaN;

    if (
      !Number.isFinite(starts) ||
      !Number.isFinite(ends) ||
      now < starts ||
      now >= ends
    ) {
      return json({ error: "The event is not currently in progress." }, 403);
    }

    // Recheck token expiry immediately before writing.
    if (
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return json({ error: "QR expired. Scan the refreshed QR." }, 401);
    }

    const { data: inserted, error: insertError } = await adminDb
      .from("attendance")
      .insert({
        participant_id: participantId,
        event_id: eventId,
      })
      .select("id, participant_id, event_id, checked_in_at")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return json(
          { error: "This participant is already checked in for this event." },
          409
        );
      }

      console.error("Attendance insert failed:", insertError.message);
      return json({ error: "Could not save attendance." }, 500);
    }

    return json({
      success: true,
      message: "Attendance recorded successfully.",
      eventTitle: event.title,
      checkedInAt: inserted.checked_in_at,
      participantId: inserted.participant_id,
    });
  } catch (error) {
    console.error("Check-in failed:", error);
    return json({ error: "Unexpected attendance error." }, 500);
  }
}
