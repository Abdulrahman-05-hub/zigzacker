"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type Props = {
  eventId: string;
  eventTitle: string;
};

export default function CoordinatorEventQR({
  eventId,
  eventTitle,
}: Props) {
  const [token, setToken] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stopped = false;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let countdownTimer: ReturnType<typeof setInterval> | undefined;

    async function refreshToken() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/attendance/event-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ eventId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not generate QR.");
        }

        if (stopped) return;

        setToken(data.token);
        setSecondsLeft(10);
        setLoading(false);

        // Refresh before expiry to give students time to scan.
        refreshTimer = setTimeout(refreshToken, 8000);
      } catch (err) {
        if (stopped) return;

        setToken("");
        setLoading(false);
        setError(
          err instanceof Error ? err.message : "Could not generate QR."
        );

        // Retry after a short delay if the network temporarily fails.
        refreshTimer = setTimeout(refreshToken, 3000);
      }
    }

    void refreshToken();

    countdownTimer = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      stopped = true;
      if (refreshTimer) clearTimeout(refreshTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [eventId]);

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border p-6 text-center shadow-sm">
      <h2 className="text-xl font-bold">{eventTitle}</h2>
      <p className="mt-2 text-sm text-gray-500">
        HECURA’27 attendance check-in
      </p>

      <div className="mx-auto my-6 flex min-h-64 w-64 items-center justify-center rounded-xl bg-white p-3">
        {token ? (
          <QRCodeCanvas
            value={token}
            size={232}
            level="H"
            marginSize={2}
          />
        ) : (
          <p className="px-4 text-sm text-gray-600">
            {loading ? "Generating secure QR…" : "QR unavailable"}
          </p>
        )}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : (
        <p className="text-sm">
          {loading
            ? "Please wait…"
            : `Refreshes automatically · ${secondsLeft}s remaining`}
        </p>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Ask registered participants to sign in and scan the current QR.
      </p>
    </section>
  );
}