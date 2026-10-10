
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { SignJWT } from "jose";
import { createClient } from "@/app/lib/supabase/server";



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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return json({ error: "Please sign in first." }, 401);
    }

    const body = await request.json().catch(() => null);
    const eventId = body?.eventId;

    if (typeof eventId !== "string" || !UUID.test(eventId)) {
      return json({ error: "A valid event ID is required." }, 400);
    }

    // Confirm the participant profile exists.
    const { data: participant, error: participantError } =
      await supabase
        .from("participants")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    if (participantError) {
      console.error("Participant lookup failed:", participantError.message);
      return json(
        { error: "Could not verify your participant profile." },
        500
      );
    }

    if (!participant) {
      return json(
        { error: "Create your participant profile before generating a QR code." },
        403
      );
    }

    // The event must exist and currently be in progress.
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, starts_at, ends_at")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError) {
      console.error("Event lookup failed:", eventError.message);
      return json({ error: "Could not verify the event." }, 500);
    }

    if (!event) {
      return json({ error: "Event not found or unavailable." }, 404);
    }

    if (!event.starts_at || !event.ends_at) {
      return json(
        { error: "The event does not have a complete schedule." },
        400
      );
    }

    const now = Date.now();
    const starts = new Date(event.starts_at).getTime();
    const ends = new Date(event.ends_at).getTime();

    if (
      !Number.isFinite(starts) ||
      !Number.isFinite(ends) ||
      now < starts ||
      now >= ends
    ) {
      return json(
        { error: "QR codes are available only while the event is in progress." },
        403
      );
    }

    const secret = process.env.ATTENDANCE_TOKEN_SECRET;

    if (!secret || secret.length < 32) {
      console.error("Attendance signing secret is missing or too short.");
      return json({ error: "Attendance service is not configured." }, 500);
    }

    const issuedAt = Math.floor(Date.now() / 1000);

    const token = await new SignJWT({
      eventId: event.id,
      purpose: "hecura-attendance",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(user.id)
      .setJti(randomUUID())
      .setIssuer("hecura27")
      .setAudience("hecura-attendance")
      .setIssuedAt(issuedAt)
      .setExpirationTime(issuedAt + 10)
      .sign(new TextEncoder().encode(secret));

    return json({
      token,
      expiresAt: (issuedAt + 10) * 1000,
    });
  } catch (error) {
    console.error("Token issuance failed:", error);
    return json({ error: "Could not generate the attendance QR." }, 500);
  }
}
