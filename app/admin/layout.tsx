"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Menu, X, LayoutDashboard, Flag, Megaphone } from "lucide-react";
import { api } from "@/lib/api";

const NAV = [
  { label: "Dashboard",          href: "/admin/dashboard", icon: <LayoutDashboard size={16} /> },
  { label: "Incidents",          href: "/admin/reports",   icon: <Flag            size={16} /> },
  { label: "Banners",            href: "/admin/banners",   icon: <Megaphone       size={16} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [admin,    setAdmin]    = useState<{ full_name: string; email: string } | null>(null);

  // Load admin profile
  useEffect(() => {
    api.get("/profiles/me")
      .then(u => setAdmin({ full_name: u.full_name, email: u.email }))
      .catch(() => {});
  }, []);

  // Close drawer on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handleLogout = () => router.push("/login");

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="flex flex-col gap-8">
        {/* Logo brand */}
        <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <Image src="/logo.jpg" alt="Adoptly" width={34} height={34} className="rounded-xl object-cover" style={{ width: 34, height: 34 }} priority />
          <span style={{ color: "#E8705A" }} className="text-lg font-bold tracking-tight">
            Adoptly Admin
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {NAV.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:translate-x-0.5"
                style={{
                  backgroundColor: isActive ? "#E8705A" : "transparent",
                  color:           isActive ? "#FFFFFF"  : "#3A2E2B",
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t pt-4" style={{ borderColor: "#D6C7B2" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: "#946D6D" }}
          >
            {admin?.full_name?.charAt(0).toUpperCase() ?? "A"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate" style={{ color: "#3A2E2B" }}>
              {admin?.full_name ?? "Admin"}
            </p>
            <p className="text-xs truncate" style={{ color: "#9B8B84" }}>
              {admin?.email ?? ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-center py-2.5 rounded-xl text-xs font-bold border transition-colors hover:bg-red-50"
          style={{ borderColor: "#C96464", color: "#C96464" }}
        >
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden" style={{ backgroundColor: "#FDF4D2" }}>

      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex w-60 h-full flex-col p-5 border-r shrink-0"
        style={{ borderColor: "#D6C7B2", backgroundColor: "#FDF4D2" }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay drawer ─────────────────────────────────────────── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setMenuOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 w-72 h-full p-5 shadow-2xl"
            style={{ backgroundColor: "#FDF4D2" }}
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Mobile top bar */}
        <header
          className="md:hidden h-14 shrink-0 flex items-center justify-between px-4 border-b z-30"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#D6C7B2" }}
        >
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Adoptly" width={28} height={28} className="rounded-xl object-cover" style={{ width: 28, height: 28 }} />
            <span className="text-base font-bold tracking-tight" style={{ color: "#E8705A" }}>Admin</span>
          </Link>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: menuOpen ? "#E8705A22" : "#F5EFE6", color: "#3A2E2B" }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
