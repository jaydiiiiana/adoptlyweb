"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { Pet, Conversation } from "@/types";
import { UserAvatar } from "@/components/user-avatar";
import { SocketProvider } from "@/lib/socket";
import {
  MessageCircle, Bell, Compass, Heart, PawPrint,
  User, LogOut, Dog, Cat, Bird, Rabbit, Menu, X,
} from "lucide-react";

// ─── Top-bar icon button ───────────────────────────────────────────────────

function IconBtn({
  children,
  badge,
  onClick,
  active,
  href,
}: {
  children: React.ReactNode;
  badge?: number;
  onClick?: () => void;
  active?: boolean;
  href?: string;
}) {
  const cls =
    "relative w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80 shrink-0";
  const style = { backgroundColor: active ? "#E8705A22" : "#F5EFE6" };

  const inner = (
    <>
      <span style={{ color: active ? "#E8705A" : "#3A2E2B" }}>{children}</span>
      {badge != null && badge > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1"
          style={{ backgroundColor: "#E8705A" }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={cls} style={style} onClick={onClick}>
      {inner}
    </button>
  );
}

// ─── SVG icons ────────────────────────────────────────────────────────────

function SpeciesThumb({ species }: { species: string }) {
  const props = { size: 18, strokeWidth: 1.5, style: { color: "#C0A898" } };
  if (species === "dog")    return <Dog    {...props} />;
  if (species === "cat")    return <Cat    {...props} />;
  if (species === "bird")   return <Bird   {...props} />;
  if (species === "rabbit") return <Rabbit {...props} />;
  return <PawPrint {...props} />;
}

// ─── Layout ───────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const [user, setUser]           = useState<{ id: string; full_name: string; email: string; avatar_url?: string } | null>(null);
  const [unreadCount, setUnread]  = useState(0);
  const [newPets, setNewPets]     = useState<Pet[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef    = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ── load user + unread count + latest pets ──────────────────────────────

  useEffect(() => {
    const init = async () => {
      try {
        const { api: a } = await import("@/lib/api");
        const me = await a.get("/profiles/me");
        setUser(me);
        const convs: Conversation[] = await a.get("/conversations");
        const total = convs.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);
        setUnread(total);
        const pets: Pet[] = await a.get("/pets?status=available");
        setNewPets(pets.slice(0, 10));
      } catch (err) {
        console.error("Layout init failed:", err);
      }
    };
    init();
  }, []);

  // Unread count is now kept in sync via socket events in the messages page

  // Close notification panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  const handleLogout = () => router.push("/login");

  const isMessages = pathname === "/dashboard/messages";

  const navItems = [
    { name: "Explore",   path: "/dashboard",           icon: <Compass       size={20} />, iconSm: <Compass      size={22} /> },
    { name: "My Pets",   path: "/dashboard/my-pets",   icon: <PawPrint      size={20} />, iconSm: <PawPrint     size={22} /> },
    { name: "Favorites", path: "/dashboard/favorites", icon: <Heart         size={20} />, iconSm: <Heart        size={22} /> },
    { name: "Messages",  path: "/dashboard/messages",  icon: <MessageCircle size={20} />, iconSm: <MessageCircle size={22} /> },
  ];

  function formatAge(months?: number) {
    if (!months && months !== 0) return "";
    if (months < 12) return `${months}mo`;
    const y = Math.floor(months / 12);
    const m = months % 12;
    return m > 0 ? `${y}y ${m}mo` : `${y}y`;
  }

  return (
    <SocketProvider>
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden" style={{ backgroundColor: "#FDF4D2" }}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header
        className="h-14 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b z-30"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#D6C7B2" }}
      >
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.jpg" alt="Adoptly" width={30} height={30} className="rounded-xl object-cover" style={{ width: 30, height: 30 }} />
          <span className="text-lg font-bold tracking-tight" style={{ color: "#E8705A" }}>Adoptly</span>
        </Link>

        {/* Right-side action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Chat shortcut with unread badge */}
          <IconBtn href="/dashboard/messages" badge={unreadCount} active={isMessages}>
            <MessageCircle size={18} />
          </IconBtn>

          {/* Notifications bell */}
          <div className="relative" ref={notifRef}>
            <IconBtn badge={newPets.length} onClick={() => setShowNotif((v) => !v)} active={showNotif}>
              <Bell size={18} />
            </IconBtn>

            {/* Dropdown panel — clamp to viewport on mobile */}
            {showNotif && (
              <div
                className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-xs sm:w-80 rounded-2xl border shadow-xl overflow-hidden z-50"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#D6C7B2" }}
              >
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#F0E8DC" }}>
                  <p className="text-sm font-bold" style={{ color: "#3A2E2B" }}>Latest Pets Available</p>
                  <Link
                    href="/dashboard"
                    onClick={() => setShowNotif(false)}
                    className="text-xs font-semibold"
                    style={{ color: "#E8705A" }}
                  >
                    See all
                  </Link>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: "#F0E8DC" }}>
                  {newPets.length === 0 && (
                    <p className="p-4 text-xs text-center" style={{ color: "#9B8B84" }}>No new listings</p>
                  )}
                  {newPets.map((pet) => (
                    <Link
                      key={pet.id}
                      href="/dashboard"
                      onClick={() => setShowNotif(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: "#F5EFE6" }}
                      >
                        {pet.image_urls?.[0] ? (
                          <Image src={pet.image_urls[0]} alt={pet.name} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <SpeciesThumb species={pet.species} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#3A2E2B" }}>{pet.name}</p>
                        <p className="text-xs truncate" style={{ color: "#9B8B84" }}>
                          {pet.breed}{pet.age_months != null ? ` · ${formatAge(pet.age_months)}` : ""}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: "#A3B18A33", color: "#3A6020" }}>
                        Available
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User avatar — hidden on smallest screens to save space */}

          {/* Mobile hamburger — only on small screens where sidebar is hidden */}
          <button
            onClick={() => setShowMobileMenu(v => !v)}
            className="md:hidden relative w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: showMobileMenu ? "#E8705A22" : "#F5EFE6", color: "#3A2E2B" }}
            aria-label="Menu"
          >
            {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* ── Body: sidebar + content ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Mobile slide-down menu overlay ────────────────────────────── */}
        {showMobileMenu && (
          <div
            className="absolute inset-0 z-40 md:hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setShowMobileMenu(false)}
          >
            <div
              className="absolute top-0 right-0 w-64 h-full flex flex-col justify-between py-6 px-4 shadow-2xl"
              style={{ backgroundColor: "#FDF4D2" }}
              onClick={e => e.stopPropagation()}
            >
              <nav className="flex flex-col gap-1 mt-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  const isMsgs   = item.path === "/dashboard/messages";
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className="px-4 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 justify-between"
                      style={{
                        backgroundColor: isActive ? "#E8705A" : "transparent",
                        color: isActive ? "#FFFFFF" : "#3A2E2B",
                      }}
                    >
                      <span className="flex items-center gap-3 flex-1">{item.icon}{item.name}</span>
                      {isMsgs && unreadCount > 0 && (
                        <span
                          className="min-w-[20px] h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1"
                          style={{ backgroundColor: isActive ? "rgba(255,255,255,0.35)" : "#E8705A" }}
                        >
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex flex-col gap-3 border-t pt-4" style={{ borderColor: "#D6C7B2" }}>
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={user?.full_name}
                    avatarUrl={user?.avatar_url}
                    size={36}
                    bgColor="#946D6D"
                  />
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate" style={{ color: "#3A2E2B" }}>{user?.full_name ?? "Loading…"}</p>
                    <p className="text-xs truncate" style={{ color: "#6B5651" }}>{user?.email ?? ""}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-colors hover:bg-red-50"
                  style={{ borderColor: "#C96464", color: "#C96464" }}
                >
                  <LogOut size={13} /> Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Desktop sidebar ───────────────────────────────────────────── */}
        <aside
          className="hidden md:flex w-56 h-full flex-col justify-between py-6 px-4 border-r shrink-0"
          style={{ borderColor: "#D6C7B2", backgroundColor: "#FDF4D2" }}
        >
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const isMsgs   = item.path === "/dashboard/messages";
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className="px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:translate-x-1 flex items-center gap-2.5 justify-between"
                  style={{
                    backgroundColor: isActive ? "#E8705A" : "transparent",
                    color: isActive ? "#FFFFFF" : "#3A2E2B",
                  }}
                >
                  <span className="flex items-center gap-2.5 flex-1">{item.icon}{item.name}</span>
                  {isMsgs && unreadCount > 0 && (
                    <span
                      className="min-w-[20px] h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1"
                      style={{ backgroundColor: isActive ? "rgba(255,255,255,0.35)" : "#E8705A" }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User footer — click avatar to open dropdown */}
          <div className="border-t pt-4 relative" style={{ borderColor: "#D6C7B2" }} ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors hover:bg-black/5 active:bg-black/8"
            >
              <UserAvatar
                name={user?.full_name}
                avatarUrl={user?.avatar_url}
                size={36}
                bgColor="#946D6D"
              />
              <p className="text-sm font-bold truncate flex-1 text-left" style={{ color: "#3A2E2B" }}>
                {user?.full_name ?? "Loading…"}
              </p>
              {/* chevron */}
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#9B8B84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="shrink-0 transition-transform duration-200"
                style={{ transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div
                className="absolute bottom-full mb-2 left-0 right-0 rounded-2xl border shadow-xl overflow-hidden z-50"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#D6C7B2" }}
              >
                {/* User info */}
                <div className="px-4 py-3 border-b" style={{ borderColor: "#F0E8DC" }}>
                  <p className="text-sm font-bold truncate" style={{ color: "#3A2E2B" }}>{user?.full_name}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: "#9B8B84" }}>{user?.email}</p>
                </div>
                {/* Actions */}
                <Link
                  href="/dashboard/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors hover:bg-orange-50"
                  style={{ color: "#3A2E2B" }}
                >
                  <User size={14} />
                  View Profile
                </Link>
                <button
                  onClick={() => { setShowUserMenu(false); handleLogout(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium border-t transition-colors hover:bg-red-50"
                  style={{ borderColor: "#F0E8DC", color: "#C96464" }}
                >
                  <LogOut size={14} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom tab bar ─────────────────────────────────────────── */}
      <nav
        className="md:hidden shrink-0 flex items-stretch border-t z-30 safe-area-pb"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#D6C7B2" }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const isMsgs   = item.path === "/dashboard/messages";
          return (
            <Link
              key={item.name}
              href={item.path}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-opacity active:opacity-60 relative"
              style={{ color: isActive ? "#E8705A" : "#9B8B84" }}
            >
              <span className="relative">
                {item.iconSm}
                {isMsgs && unreadCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5"
                    style={{ backgroundColor: "#E8705A" }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-semibold">{item.name}</span>
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ backgroundColor: "#E8705A" }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
    </SocketProvider>
  );
}
