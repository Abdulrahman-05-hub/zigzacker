import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { randomUUID } from "crypto";
import { createClient } from "@/app/lib/supabase/server";
import { createAdminClient } from "@/app/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    // Verify the currently signed-in user.
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in first." },
        { status: 401 }
      );
    }

    // Validate the requested event ID.
    let body: { eventId?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const eventId = body?.eventId;

    if (typeof eventId !== "string" || !eventId.trim()) {
      return NextResponse.json(
        { error: "A valid event ID is required." },
        { status: 400 }
      );
    }

    // Verify the user's role using their authenticated session.
    const { data: roleRow, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError) {
      console.error("Coordinator role lookup failed:", roleError);

      return NextResponse.json(
        { error: "Could not verify your role." },
        { status: 500 }
      );
    }

    const isAdmin = roleRow?.role === "admin";
    const isCoordinator = roleRow?.role === "coordinator";

    if (!isAdmin && !isCoordinator) {
      return NextResponse.json(
        {
          error: "Only coordinators and admins can generate event QR codes.",
        },
        { status: 403 }
      );
    }

    // Use the server-only admin client for assignment and event lookups.
    const adminClient = createAdminClient();

    const {
      data: assignment,
      error: assignmentError,
    } = await adminClient
      .from("event_coordinators")
      .select("event_id")
      .eq("event_id", eventId)
      .eq("coordinator_id", user.id)
      .maybeSingle();

    if (assignmentError) {
      console.error("Event assignment lookup failed:", assignmentError);

      return NextResponse.json(
        { error: "Could not verify event assignment. Please try again." },
        { status: 500 }
      );
    }

    if (!assignment) {
      return NextResponse.json(
        { error: "You are not assigned to this event." },
        { status: 403 }
      );
    }

    // Confirm the assigned event exists.
    const { data: event, error: eventError } = await adminClient
      .from("events")
      .select("id, title")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError) {
      console.error("Event lookup failed:", eventError);

      return NextResponse.json(
        { error: "Could not load the event." },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    // Create a short-lived attendance token.
    const secret = process.env.ATTENDANCE_TOKEN_SECRET;

    if (!secret) {
      console.error("ATTENDANCE_TOKEN_SECRET is not configured.");

      return NextResponse.json(
        { error: "Attendance token signing is not configured." },
        { status: 500 }
      );
    }

    const now = Math.floor(Date.now() / 1000);

    const token = await new SignJWT({
      purpose: "hecura-event-checkin",
      eventId: event.id,
      jti: randomUUID(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("hecura27")
      .setAudience("hecura27-attendance")
      .setIssuedAt(now)
      .setExpirationTime(now + 10)
      .sign(new TextEncoder().encode(secret));

    return NextResponse.json(
      {
        token,
        event: {
          id: event.id,
          title: event.title,
        },
        expiresAt: now + 10,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Event QR token error:", error);

    return NextResponse.json(
      { error: "Could not generate the event QR code." },
      { status: 500 }
    );
  }
}