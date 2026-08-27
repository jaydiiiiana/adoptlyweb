"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import type { Report } from "@/types";
import { api } from "@/lib/api";

function StatusBadge({ status }: { status: string }) {
  const style = {
    pending:      { bg: "#E0A96D", text: "#fff" },
    investigating:{ bg: "#946D6D", text: "#fff" },
    resolved:     { bg: "#A3B18A", text: "#fff" },
    dismissed:    { bg: "#D6C7B2", text: "#6B5651" },
  } as Record<string, { bg: string; text: string }>;
  const s = style[status] ?? style.dismissed;
  return (
    <span
      className="inline-block text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

export default function ReportsDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.get("/reports");
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleBlockUser = async (userId: string) => {
    try {
      await api.post(`/profiles/${userId}/block`);
      alert("User account blocked successfully.");
      fetchReports();
    } catch (err) {
      alert("Failed to block user: " + (err as any).message);
    }
  };

  const handleRemovePet = async (petId: string) => {
    try {
      await api.post(`/pets/${petId}/remove`);
      alert("Pet listing flagged as removed.");
      fetchReports();
    } catch (err) {
      alert("Failed to remove listing: " + (err as any).message);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await api.patch(`/reports/${reportId}/status`, { status: "resolved" });
      alert("Report marked as resolved.");
      fetchReports();
    } catch (err) {
      alert("Failed to update report status: " + (err as any).message);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <h3 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: "#3A2E2B" }}>
          Reported Incidents Management
        </h3>
        <p className="text-sm" style={{ color: "#9B8B84" }}>
          Inspect conversations, block abusive users, and remove fake listings.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm font-semibold animate-pulse" style={{ color: "#6B5651" }}>Loading reports…</p>
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-dashed" style={{ borderColor: "#D6C7B2" }}>
          <p className="text-sm font-bold" style={{ color: "#3A2E2B" }}>No reports yet</p>
          <p className="text-xs mt-1" style={{ color: "#9B8B84" }}>Reports submitted by users will appear here.</p>
        </div>
      )}

      {/* ── Desktop table (md+) ─────────────────────────────────────────────── */}
      {!loading && reports.length > 0 && (
        <>
          {/* Hidden on small, shown on md+ */}
          <div className="hidden md:block rounded-2xl border bg-white overflow-x-auto" style={{ borderColor: "#D6C7B2" }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: "#D6C7B2", backgroundColor: "#FDF4D2" }}>
                  {["Reporter", "Reported User", "Reason", "Description", "Status", "Actions"].map((h, i) => (
                    <th key={h} className={`p-4 text-xs font-bold uppercase whitespace-nowrap ${i === 5 ? "text-right" : ""}`} style={{ color: "#3A2E2B" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const isBlocked  = r.reported_user?.is_blocked;
                  const isPetRemoved = r.pet?.is_removed;

                  return (
                    <tr key={r.id} className="border-b last:border-b-0 hover:bg-stone-50" style={{ borderColor: "#EDE5D8" }}>
                      <td className="p-4">
                        <p className="text-sm font-bold" style={{ color: "#3A2E2B" }}>{r.reporter?.full_name}</p>
                        <p className="text-xs" style={{ color: "#9B8B84" }}>{r.reporter?.email}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold" style={{ color: "#3A2E2B" }}>{r.reported_user?.full_name}</p>
                        <p className="text-xs" style={{ color: "#9B8B84" }}>
                          {r.reported_user?.email}
                          {isBlocked && <span className="ml-1.5 text-[9px] uppercase font-bold text-red-500">Blocked</span>}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold capitalize px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                          {r.reason.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 max-w-[200px]">
                        <p className="text-xs line-clamp-2" style={{ color: "#6B5651" }}>{r.description}</p>
                      </td>
                      <td className="p-4"><StatusBadge status={r.status} /></td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Link
                            href={`/admin/chats?conversationId=${r.id}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors hover:bg-stone-100 whitespace-nowrap"
                            style={{ borderColor: "#D6C7B2", color: "#3A2E2B" }}
                          >
                            Inspect Chats
                          </Link>
                          {r.pet_id && !isPetRemoved && (
                            <button
                              onClick={() => handleRemovePet(r.pet_id!)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white whitespace-nowrap"
                              style={{ backgroundColor: "#E8705A" }}
                            >
                              Remove Listing
                            </button>
                          )}
                          {!isBlocked && (
                            <button
                              onClick={() => handleBlockUser(r.reported_user_id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white whitespace-nowrap"
                              style={{ backgroundColor: "#C96464" }}
                            >
                              Block Account
                            </button>
                          )}
                          {r.status !== "resolved" && (
                            <button
                              onClick={() => handleResolveReport(r.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white whitespace-nowrap bg-emerald-600"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Mobile card list (below md) ─────────────────────────────────── */}
          <div className="flex flex-col gap-3 md:hidden">
            {reports.map((r) => {
              const isBlocked    = r.reported_user?.is_blocked;
              const isPetRemoved = r.pet?.is_removed;

              return (
                <div
                  key={r.id}
                  className="rounded-2xl border bg-white p-4 flex flex-col gap-3"
                  style={{ borderColor: "#D6C7B2" }}
                >
                  {/* Header row: reason + status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold capitalize px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                      {r.reason.replace("_", " ")}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>

                  {/* Reporter */}
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#9B8B84" }}>Reporter</p>
                    <p className="text-sm font-semibold" style={{ color: "#3A2E2B" }}>{r.reporter?.full_name}</p>
                    <p className="text-xs" style={{ color: "#9B8B84" }}>{r.reporter?.email}</p>
                  </div>

                  {/* Reported user */}
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#9B8B84" }}>Reported User</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold" style={{ color: "#3A2E2B" }}>{r.reported_user?.full_name}</p>
                      {isBlocked && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Blocked</span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: "#9B8B84" }}>{r.reported_user?.email}</p>
                  </div>

                  {/* Description */}
                  {r.description && (
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#9B8B84" }}>Description</p>
                      <p className="text-xs leading-relaxed" style={{ color: "#6B5651" }}>{r.description}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t" style={{ borderColor: "#EDE5D8" }}>
                    <Link
                      href={`/admin/chats?conversationId=${r.id}`}
                      className="flex-1 min-w-[100px] text-center px-3 py-2 rounded-xl text-xs font-bold border"
                      style={{ borderColor: "#D6C7B2", color: "#3A2E2B" }}
                    >
                      Inspect Chats
                    </Link>
                    {r.pet_id && !isPetRemoved && (
                      <button
                        onClick={() => handleRemovePet(r.pet_id!)}
                        className="flex-1 min-w-[100px] px-3 py-2 rounded-xl text-xs font-bold text-white"
                        style={{ backgroundColor: "#E8705A" }}
                      >
                        Remove Listing
                      </button>
                    )}
                    {!isBlocked && (
                      <button
                        onClick={() => handleBlockUser(r.reported_user_id)}
                        className="flex-1 min-w-[100px] px-3 py-2 rounded-xl text-xs font-bold text-white"
                        style={{ backgroundColor: "#C96464" }}
                      >
                        Block Account
                      </button>
                    )}
                    {r.status !== "resolved" && (
                      <button
                        onClick={() => handleResolveReport(r.id)}
                        className="flex-1 min-w-[100px] px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
