"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Trash2, X, Clock, Link as LinkIcon, Palette } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  bg_color: string;
  expires_at: string;
  created_at: string;
}

const PRESET_COLORS = [
  { label: "Rose",    hex: "#E8705A" },
  { label: "Mint",    hex: "#7DC4B8" },
  { label: "Amber",   hex: "#E0A96D" },
  { label: "Green",   hex: "#A3B18A" },
  { label: "Earth",   hex: "#6B5651" },
  { label: "Indigo",  hex: "#5B6FA6" },
];

function daysLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
}

export default function BannersAdminPage() {
  const [banners,    setBanners]    = useState<Banner[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title:       "",
    description: "",
    image_url:   "",
    link_url:    "",
    bg_color:    "#E8705A",
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await api.get("/banners/all");
      setBanners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/banners", {
        title:       form.title.trim(),
        description: form.description.trim() || undefined,
        image_url:   form.image_url.trim()   || undefined,
        link_url:    form.link_url.trim()    || undefined,
        bg_color:    form.bg_color,
      });
      setForm({ title: "", description: "", image_url: "", link_url: "", bg_color: "#E8705A" });
      setShowForm(false);
      fetchBanners();
    } catch (err: any) {
      alert("Failed to create banner: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete banner "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/banners/${id}`);
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "#3A2E2B" }}>Banner Management</h1>
          <p className="text-sm mt-0.5" style={{ color: "#9B8B84" }}>
            Banners appear on the explore feed and auto-delete after 7 days.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0 transition-all active:scale-95 hover:opacity-90"
          style={{ backgroundColor: "#E8705A" }}
        >
          <Plus size={14} strokeWidth={2.5} />
          New Banner
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border p-5 sm:p-6 flex flex-col gap-4"
          style={{ borderColor: "#D6C7B2", backgroundColor: "#FFFFFF" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base" style={{ color: "#3A2E2B" }}>Create Banner</h2>
            <button type="button" onClick={() => setShowForm(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-stone-100"
              style={{ color: "#9B8B84" }}>
              <X size={14} />
            </button>
          </div>

          {/* Live preview */}
          <div
            className="rounded-2xl p-4 flex flex-col gap-1 relative overflow-hidden"
            style={{ backgroundColor: form.bg_color, minHeight: 72 }}
          >
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
            <p className="text-white font-black text-base relative z-10">{form.title || "Banner title"}</p>
            {form.description && (
              <p className="text-white/80 text-xs relative z-10">{form.description}</p>
            )}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Title *</label>
            <input
              type="text" required disabled={submitting}
              placeholder="e.g. Adopt a friend today!"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              style={{ borderColor: "#D6C7B2" }}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Description <span className="font-normal" style={{ color: "#9B8B84" }}>(optional)</span></label>
            <input
              type="text" disabled={submitting}
              placeholder="Short subtitle shown under the title"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              style={{ borderColor: "#D6C7B2" }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Image URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold flex items-center gap-1" style={{ color: "#3A2E2B" }}>
                Image URL <span className="font-normal" style={{ color: "#9B8B84" }}>(optional)</span>
              </label>
              <input
                type="url" disabled={submitting}
                placeholder="https://…/image.jpg"
                value={form.image_url}
                onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                style={{ borderColor: "#D6C7B2" }}
              />
            </div>

            {/* Link URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold flex items-center gap-1" style={{ color: "#3A2E2B" }}>
                Link URL <span className="font-normal" style={{ color: "#9B8B84" }}>(optional)</span>
              </label>
              <input
                type="url" disabled={submitting}
                placeholder="https://…"
                value={form.link_url}
                onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))}
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                style={{ borderColor: "#D6C7B2" }}
              />
            </div>
          </div>

          {/* Background colour */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold flex items-center gap-1" style={{ color: "#3A2E2B" }}>
              <Palette size={11} /> Background Colour
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, bg_color: c.hex }))}
                  className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: form.bg_color === c.hex ? "#3A2E2B" : "transparent",
                    boxShadow: form.bg_color === c.hex ? "0 0 0 2px #fff inset" : "none",
                  }}
                  title={c.label}
                />
              ))}
              {/* Custom hex input */}
              <div className="flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5" style={{ borderColor: "#D6C7B2" }}>
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: form.bg_color }} />
                <input
                  type="text"
                  value={form.bg_color}
                  onChange={e => setForm(p => ({ ...p, bg_color: e.target.value }))}
                  className="w-20 text-xs outline-none bg-transparent"
                  style={{ color: "#3A2E2B" }}
                  placeholder="#E8705A"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors hover:bg-stone-50"
              style={{ borderColor: "#D6C7B2", color: "#6B5651" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#E8705A" }}>
              {submitting ? "Creating…" : "Create Banner"}
            </button>
          </div>
        </form>
      )}

      {/* Banner list */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2].map(i => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ backgroundColor: "#F5EFE6" }} />
          ))}
        </div>
      )}

      {!loading && banners.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-dashed" style={{ borderColor: "#D6C7B2" }}>
          <p className="text-sm font-bold" style={{ color: "#3A2E2B" }}>No banners yet</p>
          <p className="text-xs mt-1" style={{ color: "#9B8B84" }}>Create one to show it on the explore feed.</p>
        </div>
      )}

      {!loading && banners.length > 0 && (
        <div className="flex flex-col gap-3">
          {banners.map(b => {
            const days = daysLeft(b.expires_at);
            const expired = days <= 0;
            const isDeleting = deletingId === b.id;
            return (
              <div
                key={b.id}
                className="rounded-2xl border overflow-hidden flex flex-col sm:flex-row transition-opacity"
                style={{ borderColor: "#D6C7B2", opacity: isDeleting ? 0.4 : 1 }}
              >
                {/* Colour swatch */}
                <div
                  className="w-full h-2 sm:w-2 sm:h-auto shrink-0"
                  style={{ backgroundColor: b.bg_color }}
                />

                <div className="flex flex-1 items-start sm:items-center gap-4 px-4 py-4 bg-white">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "#3A2E2B" }}>{b.title}</p>
                    {b.description && (
                      <p className="text-xs truncate mt-0.5" style={{ color: "#9B8B84" }}>{b.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {/* Expiry */}
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: expired ? "#C9646422" : days <= 1 ? "#E0A96D22" : "#A3B18A22",
                          color:           expired ? "#8B2020"  : days <= 1 ? "#9B6A2A"  : "#3A6020",
                        }}
                      >
                        <Clock size={9} />
                        {expired ? "Expired" : days === 1 ? "Expires today" : `${days}d left`}
                      </span>
                      {b.link_url && (
                        <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: "#9B8B84" }}>
                          <LinkIcon size={9} />
                          <span className="truncate max-w-[140px]">{b.link_url}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(b.id, b.title)}
                    disabled={isDeleting}
                    className="w-8 h-8 rounded-xl flex items-center justify-center border transition-colors hover:bg-red-50 disabled:opacity-40 shrink-0"
                    style={{ borderColor: "#EDE5D8", color: "#C96464" }}
                    aria-label="Delete banner"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
