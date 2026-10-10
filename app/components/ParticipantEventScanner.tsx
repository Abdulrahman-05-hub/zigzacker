"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function ParticipantEventScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  const [message, setMessage] = useState("Starting camera...");
  const [status, setStatus] = useState<"ready" | "success" | "error">("ready");

  useEffect(() => {
    let cancelled = false;
    let scanner: Html5Qrcode | null = null;
    let startPromise: Promise<void> | null = null;

    async function startScanner() {
      try {
        scanner = new Html5Qrcode("hecura-qr-reader");
        scannerRef.current = scanner;

        startPromise = scanner
          .start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 240, height: 240 } },
            async (decodedText) => {
              if (cancelled || processingRef.current) return;

              processingRef.current = true;
              setMessage(
                "Checking registration and recording attendance..."
              );

              try {
                if (scanner?.isScanning) {
                  await scanner.stop();
                }

                if (cancelled) return;

                const response = await fetch("/api/attendance/check-in", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  cache: "no-store",
                  body: JSON.stringify({ token: decodedText }),
                });

                const data = await response.json();

                if (cancelled) return;

                if (!response.ok) {
                  setStatus("error");
                  setMessage(data.error || "Check-in failed.");
                  return;
                }

                setStatus("success");
                setMessage(
                  `${data.message || "Attendance recorded"}${
                    data.event ? ` — ${data.event}` : ""
                  }`
                );
              } catch (error) {
                console.error("Check-in failed:", error);

                if (!cancelled) {
                  setStatus("error");
                  setMessage("Check-in failed. Please try again.");
                }
              }
            },
            () => {
              // No QR detected in this frame; continue scanning.
            }
          )
          .then(() => undefined);

        await startPromise;

        if (!cancelled) {
          setMessage(
            "Camera ready. Scan the coordinator's current QR code."
          );
        }
      } catch (error) {
        console.error("Camera startup failed:", error);

        if (!cancelled) {
          setStatus("error");
          setMessage(
            "Camera could not start. Check camera permission and use HTTPS on your phone."
          );
        }
      }
    }

    void startScanner();

    return () => {
      cancelled = true;

      void (async () => {
        if (startPromise) {
          try {
            await startPromise;
          } catch {
            // Camera startup may have failed.
          }
        }

        if (!scanner) return;

        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }
        } catch (error) {
          console.warn("Camera cleanup failed:", error);
        }

        try {
          await scanner.clear();
        } catch {
          // The scanner may already have been cleared.
        }

        if (scannerRef.current === scanner) {
          scannerRef.current = null;
        }
      })();
    };
  }, []);

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold">
        HECURA’27 — Scan Event QR
      </h1>

      <div
        id="hecura-qr-reader"
        className="mt-6 w-full overflow-hidden rounded-xl"
      />

      <p
        role="status"
        aria-live="polite"
        className={`mt-4 ${
          status === "success"
            ? "text-green-700"
            : status === "error"
              ? "text-red-600"
              : "text-gray-600"
        }`}
      >
        {message}
      </p>
    </main>
  );
}