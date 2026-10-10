
"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function AttendanceQRPage() {
  const [eventId, setEventId] = useState("");
  const [running, setRunning] = useState(false);
  const [token, setToken] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [status, setStatus] = useState("Enter your event UUID to begin.");
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!running || !eventId.trim()) return;

    let stopped = false;
    let busy = false;

    const refreshToken = async () => {
      if (busy || stopped) return;
      busy = true;

      try {
        const response = await fetch("/api/attendance/issue-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ eventId: eventId.trim() }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not generate QR.");
        }

        if (stopped) return;

        setToken(data.token);
        setExpiresAt(data.expiresAt);
        setStatus("QR refreshed. Show this code to the event coordinator.");
      } catch (error) {
        if (!stopped) {
          setToken("");
          setStatus(
            error instanceof Error
              ? error.message
              : "Could not refresh the QR."
          );
        }
      } finally {
        busy = false;
      }
    };

    void refreshToken();

    // Refresh before the 10-second expiry.
    const interval = window.setInterval(() => {
      void refreshToken();
    }, 8000);

    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [running, eventId]);

  useEffect(() => {
    if (!running) {
      setSecondsLeft(0);
      return;
    }

    const updateCountdown = () => {
      setSecondsLeft(
        Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
      );
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 250);

    return () => window.clearInterval(interval);
  }, [running, expiresAt]);

  const start = () => {
    if (!eventId.trim()) {
      setStatus("Enter the event UUID first.");
      return;
    }

    setToken("");
    setRunning(true);
    setStatus("Generating your personal QR...");
  };

  const stop = () => {
    setRunning(false);
    setToken("");
    setExpiresAt(0);
    setStatus("QR generation stopped.");
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl">
        <p className="text-sm font-semibold tracking-widest text-blue-400">
          HECURA&apos;27
        </p>

        <h1 className="mt-2 text-2xl font-bold">
          Participant Attendance QR
        </h1>

        <p className="mt-3 text-sm text-slate-400">
          Your QR refreshes automatically. Each token is valid for only
          10 seconds.
        </p>

        <div className="mt-6 text-left">
          <label
            htmlFor="eventId"
            className="mb-2 block text-sm font-medium"
          >
            Event UUID
          </label>

          <input
            id="eventId"
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            disabled={running}
            placeholder="Paste your event UUID"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
          />
        </div>

        {!running ? (
          <button
            onClick={start}
            className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500"
          >
            Start QR
          </button>
        ) : (
          <button
            onClick={stop}
            className="mt-4 w-full rounded-xl border border-slate-700 px-4 py-3 font-semibold hover:bg-slate-800"
          >
            Stop QR
          </button>
        )}

        <div
          aria-live="polite"
          className="mt-5 rounded-xl bg-slate-950 p-4 text-sm text-slate-300"
        >
          {status}
        </div>

        {running && token && secondsLeft > 0 && (
          <div className="mt-6">
            <div className="inline-block rounded-2xl bg-white p-4">
              <QRCodeCanvas
                value={token}
                size={260}
                level="M"
                includeMargin
              />
            </div>

            <p className="mt-4 text-sm text-emerald-300">
              Token expires in {secondsLeft} seconds
            </p>

            <p className="mt-2 break-all text-xs text-slate-500">
              Event: {eventId}
            </p>
          </div>
        )}

        {running && !token && (
          <p className="mt-6 text-sm text-amber-300">
            Waiting for a valid token...
          </p>
        )}
      </div>
    </main>
  );
}
