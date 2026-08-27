"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  PawPrint, Flag, Users, CheckCircle,
  ArrowRight, TrendingUp,
} from "lucide-react";

interface Stats {
  petsListed: number;
  adoptions: number;
  citiesCovered: number;
}

interface RecentReport {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter?: { full_name: string };
  reported_user?: { full_name: string };
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border bg-white p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md group"
      style={{ borderColor: "#D6C7B2" }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {icon}
        </div>
        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: "#3A2E2B" }}>{value}</p>
        <p className="text-sm font-semibold mt-0.5" style={{ color: "#3A2E2B" }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "#9B8B84" }}>{sub}</p>
      </div>
    </Link>
  );
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:       { bg: "#E0A96D22", text: "#9B6A2A" },
  investigating: { bg: "#946D6D22", text: "#6E4F4F" },
  resolved:      { bg: "#A3B18A22", text: "#3A6020"  },
  dismissed:     { bg: "#D6C7B233", text: "#6B5651"  },
};

export default function AdminDashboard() {
  const [stats,         setStats]         = useState<Stats | null>(null);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [openReports,   setOpenReports]   = useState(0);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, reports] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/stats`)
            .then(r => r.json()),
          api.get("/reports"),
        ]);
        setStats(s);
        setRecentReports(reports.slice(0, 5));
        setOpenReports(reports.filter((r: RecentReport) => r.status === "pending" || r.status === "investigating").length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#E8705A" }}>Admin</p>
        <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "#3A2E2B" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#9B8B84" }}>Platform overview at a glance.</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ backgroundColor: "#F5EFE6" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<PawPrint size={18} />}
            label="Pets Listed"
            value={stats?.petsListed ?? 0}
            sub="all active listings"
            color="#E8705A"
            href="/admin/reports"
          />
          <StatCard
            icon={<CheckCircle size={18} />}
            label="Adopted"
            value={stats?.adoptions ?? 0}
            sub="successful rehomes"
            color="#A3B18A"
            href="/admin/reports"
          />
          <StatCard
            icon={<Flag size={18} />}
            label="Open Reports"
            value={openReports}
            sub="need your attention"
            color="#C96464"
            href="/admin/reports"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="Cities"
            value={stats?.citiesCovered ?? 0}
            sub="active locations"
            color="#7DC4B8"
            href="/admin/reports"
          />
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold mb-3" style={{ color: "#3A2E2B" }}>Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              label: "Review open reports",
              desc:  "Check pending incidents and take action.",
              href:  "/admin/reports",
              color: "#C96464",
            },
            {
              label: "Manage banners",
              desc:  "Create or remove explore feed banners.",
              href:  "/admin/banners",
              color: "#E8705A",
            },
          ].map(a => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center justify-between gap-4 rounded-2xl border bg-white px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-md group"
              style={{ borderColor: "#D6C7B2" }}
            >
              <div>
                <p className="text-sm font-bold" style={{ color: "#3A2E2B" }}>{a.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#9B8B84" }}>{a.desc}</p>
              </div>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5"
                style={{ backgroundColor: `${a.color}15`, color: a.color }}
              >
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent reports */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold" style={{ color: "#3A2E2B" }}>Recent Reports</h2>
          <Link href="/admin/reports" className="text-xs font-semibold hover:underline" style={{ color: "#E8705A" }}>
            View all
          </Link>
        </div>

        {loading && (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: "#F5EFE6" }} />
            ))}
          </div>
        )}

        {!loading && recentReports.length === 0 && (
          <div className="text-center py-10 rounded-2xl border border-dashed" style={{ borderColor: "#D6C7B2" }}>
            <p className="text-sm font-bold" style={{ color: "#3A2E2B" }}>No reports yet</p>
          </div>
        )}

        {!loading && recentReports.length > 0 && (
          <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#D6C7B2" }}>
            {recentReports.map((r, i) => {
              const sc = STATUS_COLORS[r.status] ?? STATUS_COLORS.dismissed;
              return (
                <div
                  key={r.id}
                  className={`flex items-center justify-between gap-4 px-4 py-3 ${i < recentReports.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "#EDE5D8" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#3A2E2B" }}>
                      {r.reporter?.full_name ?? "Unknown"} reported {r.reported_user?.full_name ?? "Unknown"}
                    </p>
                    <p className="text-xs truncate mt-0.5 capitalize" style={{ color: "#9B8B84" }}>
                      {r.reason.replace(/_/g, " ")} · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0"
                    style={{ backgroundColor: sc.bg, color: sc.text }}
                  >
                    {r.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
