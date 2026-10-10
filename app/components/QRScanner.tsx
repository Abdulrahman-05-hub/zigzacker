
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const lastTokenRef = useRef("");
  const [message, setMessage] = useState("Allow camera access to scan QR codes.");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let scanner: Html5Qrcode | null = null;

    async function startScanner() {
      try {
        scanner = new Html5Qrcode("hecura-qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (
              processingRef.current ||
              decodedText === lastTokenRef.current
            ) {
              return;
            }

            processingRef.current = true;
            lastTokenRef.current = decodedText;
            setMessage("Verifying QR and recording attendance...");

            try {
              const response = await fetch("/api/attendance/check-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
                body: JSON.stringify({ token: decodedText }),
              });

              const data = await response.json();

              if (!response.ok) {
                setMessage(data.error || "Attendance could not be recorded.");
              } else {
                setMessage(
                  `${data.message} Event: ${data.eventTitle}. Participant: ${data.participantId}`
                );
              }
            } catch {
              setMessage("Network error. Please try scanning again.");
            } finally {
              window.setTimeout(() => {
                processingRef.current = false;
                lastTokenRef.current = "";
              }, 1500);
            }
          },
          () => {
            // Most camera frames do not contain a QR. Ignore those frames.
          }
        );

        if (!cancelled) {
          setStarted(true);
          setMessage("Camera ready. Scan a participant's QR code.");
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? `Could not start camera: ${error.message}`
              : "Could not start camera. Check browser camera permissions."
          );
        }
      }
    }

    void startScanner();

    return () => {
      cancelled = true;
      setStarted(false);

      const activeScanner = scannerRef.current;
      scannerRef.current = null;

      if (activeScanner) {
        void activeScanner
          .stop()
          .catch(() => undefined)
          .finally(() => {
            try {
              activeScanner.clear();
            } catch {
              // Scanner may already have been cleared.
            }
          });
      }
    };
  }, []);

  return (
    <section className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white">
      <h2 className="text-xl font-bold">Attendance Scanner</h2>

      <p aria-live="polite" className="my-4 text-sm text-slate-300">
        {message}
      </p>

      <div
        id="hecura-qr-reader"
        className="overflow-hidden rounded-xl bg-black"
      />

      {started && (
        <p className="mt-3 text-xs text-slate-500">
          Keep the participant's QR code inside the camera frame.
        </p>
      )}
    </section>
  );
}
