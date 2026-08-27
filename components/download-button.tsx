"use client";

import { useEffect, useState } from "react";

type Variant = "nav" | "hero" | "banner";

interface DownloadButtonProps {
  variant?: Variant;
}

/**
 * DownloadButton
 *
 * Checks whether the APK/IPA is available at /downloads/adoptly.apk.
 * - If the file exists → renders a real <a download> link.
 * - If not yet uploaded → renders a "Coming soon" badge (no dead link).
 *
 * To activate the download:
 *   1. Build the Expo app: `npx eas build --platform android`
 *   2. Place the .apk in:  web/public/downloads/adoptly.apk
 *   The button will go live automatically on next page load.
 */
export function DownloadButton({ variant = "hero" }: DownloadButtonProps) {
  const APK_PATH = "/downloads/adoptly.apk";

  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    // HEAD request — cheap, no body download
    fetch(APK_PATH, { method: "HEAD" })
      .then((res) => setAvailable(res.ok))
      .catch(() => setAvailable(false));
  }, []);

  // ── Variant styles ────────────────────────────────────────────────────────
  const styles: Record<Variant, { link: string; badge: string }> = {
    nav: {
      link: [
        "inline-flex items-center gap-2 rounded-full px-4 py-2",
        "bg-[#946D6D] text-white text-sm font-medium",
        "hover:bg-[#6E4F4F] transition-colors",
      ].join(" "),
      badge: [
        "inline-flex items-center gap-2 rounded-full px-4 py-2",
        "bg-[#D6C7B2]/60 text-[#6B5651] text-sm font-medium cursor-default",
      ].join(" "),
    },
    hero: {
      link: [
        "inline-flex items-center gap-3 rounded-full px-7 py-3.5",
        "bg-[#946D6D] text-white text-base font-semibold shadow-md",
        "hover:bg-[#6E4F4F] active:scale-95 transition-all",
      ].join(" "),
      badge: [
        "inline-flex items-center gap-3 rounded-full px-7 py-3.5",
        "bg-[#D6C7B2]/60 text-[#6B5651] text-base font-semibold cursor-default",
      ].join(" "),
    },
    banner: {
      link: [
        "inline-flex items-center gap-3 rounded-full px-8 py-4",
        "bg-white text-[#946D6D] text-base font-semibold shadow-lg",
        "hover:bg-[#FDF4D2] active:scale-95 transition-all",
      ].join(" "),
      badge: [
        "inline-flex items-center gap-3 rounded-full px-8 py-4",
        "bg-white/30 text-white text-base font-semibold cursor-default",
      ].join(" "),
    },
  };

  const s = styles[variant];

  // Loading skeleton — matches whichever variant
  if (available === null) {
    return (
      <span
        className={`${s.badge} animate-pulse opacity-60`}
        aria-label="Checking download availability"
      >
        <DownloadIcon />
        Checking…
      </span>
    );
  }

  // File is present — real download link
  if (available) {
    return (
      <a
        href={APK_PATH}
        download="adoptly.apk"
        className={s.link}
        aria-label="Download Adoptly for Android"
      >
        <DownloadIcon />
        Download the App
      </a>
    );
  }

  // File not yet uploaded — coming soon state
  return (
    <span className={s.badge} title="APK not yet available — drop it in web/public/downloads/">
      <ClockIcon />
      {variant === "nav" ? "App coming soon" : "Download coming soon"}
    </span>
  );
}

// ── Inline SVG icons (no extra dependency) ───────────────────────────────────

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
