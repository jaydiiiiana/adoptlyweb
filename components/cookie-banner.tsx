"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "adoptly_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if the user hasn't already made a choice
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setVisible(true);
    } catch {
      // localStorage unavailable (private browsing edge case)
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch { /* silent */ }
    setVisible(false);
  };

  const decline = () => {
    try { localStorage.setItem(STORAGE_KEY, "declined"); } catch { /* silent */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[999] px-4 pb-4 pt-0 sm:px-6 sm:pb-6"
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <div
        className="mx-auto max-w-2xl rounded-2xl border shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ backgroundColor: "#3A2E2B", borderColor: "#4A3E3A" }}
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(232,112,90,0.15)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8705A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
            <path d="M8.5 8.5v.01M16 15.5v.01M12 12v.01" />
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: "#FDF4D2" }}>
            We use cookies
          </p>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#9B8B84" }}>
            We use essential cookies to keep you logged in, and optional analytics cookies to improve the platform.
            Read our{" "}
            <Link href="/cookies" className="underline hover:opacity-80" style={{ color: "#C0A898" }}>
              Cookie Policy
            </Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline hover:opacity-80" style={{ color: "#C0A898" }}>
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 rounded-xl text-xs font-bold border transition-colors hover:bg-white/5"
            style={{ borderColor: "#6B5651", color: "#9B8B84" }}
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#E8705A", boxShadow: "0 2px 12px rgba(232,112,90,0.35)" }}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
