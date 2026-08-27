"use client";

import Image from "next/image";

interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: number;         // pixel size, default 40
  className?: string;
  bgColor?: string;
}

/**
 * Renders a user's profile photo if available, otherwise falls back to
 * a coloured circle with their first initial.
 */
export function UserAvatar({
  name,
  avatarUrl,
  size = 40,
  className = "",
  bgColor = "#946D6D",
}: UserAvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase() ?? "?";

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: bgColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    fontWeight: 700,
    color: "#FFFFFF",
    fontSize: size < 36 ? 11 : size < 48 ? 14 : 18,
    flexShrink: 0,
  };

  return (
    <div style={baseStyle} className={className} aria-label={name ?? "User"}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name ?? "User"}
          fill
          className="object-cover"
          sizes={`${size}px`}
          // Strip the cache-busting query string for Next.js Image optimisation
          unoptimized={avatarUrl.includes("supabase.co")}
        />
      ) : (
        initial
      )}
    </div>
  );
}
