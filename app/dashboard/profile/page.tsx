"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { formatAge, speciesInitials } from "@/data/mock";
import type { Pet } from "@/types";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
  MapPin, Phone, Mail, Edit2, Check, X,
  Camera, PawPrint, ChevronRight,
} from "lucide-react";

const STATUS_PILL: Record<string, { bg: string; text: string }> = {
  available: { bg: "#A3B18A22", text: "#3A6020" },
  pending:   { bg: "#E0A96D22", text: "#9B6A2A" },
  adopted:   { bg: "#946D6D22", text: "#6E4F4F" },
};
const STATUS_DOT: Record<string, string> = {
  available: "#A3B18A",
  pending:   "#E0A96D",
  adopted:   "#946D6D",
};

export default function ProfilePanel() {
  const [profile,   setProfile]   = useState<any>(null);
  const [myPets,    setMyPets]    = useState<Pet[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState({
    fullName: "", streetAddress: "", city: "", postalCode: "", phone: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const user = await api.get("/profiles/me");
        setProfile(user);
        setEditForm({
          fullName:      user.full_name      || "",
          streetAddress: user.street_address || "",
          city:          user.city           || "",
          postalCode:    user.postal_code    || "",
          phone:         user.phone          || "",
        });
        const allPets = await api.get("/pets");
        setMyPets(allPets.filter((p: Pet) => p.owner_id === user.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user.id;
      if (!uid) throw new Error("Not authenticated.");

      // bucket: "avatars"  |  path: {uid}/avatar.{ext}
      // RLS policy: (storage.foldername(name))[1] = auth.uid()::text
      const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${uid}/avatar.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (upErr) throw new Error(upErr.message);

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      // Bust any CDN cache by appending a timestamp
      const bustedUrl = `${publicUrl}?t=${Date.now()}`;

      const updated = await api.patch("/profiles/me", { avatar_url: bustedUrl });
      setProfile(updated);
    } catch (err: any) {
      alert("Avatar upload failed: " + err.message);
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  // ── Edit save ──────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.patch("/profiles/me", {
        full_name:      editForm.fullName,
        street_address: editForm.streetAddress,
        city:           editForm.city,
        postal_code:    editForm.postalCode,
        phone:          editForm.phone,
      });
      setProfile(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (petId: string) => {
    const pet = myPets.find(p => p.id === petId);
    if (!pet) return;
    const nextStatus =
      pet.status === "available" ? "pending" :
      pet.status === "pending"   ? "adopted"  : "available";
    try {
      const updated = await api.patch(`/pets/${petId}`, { status: nextStatus });
      setMyPets(prev => prev.map(p => p.id === petId ? { ...p, status: updated.status } : p));
    } catch (err: any) {
      alert("Failed to change status: " + err.message);
    }
  };

  // ── loading skeleton ───────────────────────────────────────────────────────
  if (loading || !profile) {
    return (
      <div className="flex flex-col gap-5 pb-4 animate-pulse">
        <div className="h-52 rounded-3xl" style={{ backgroundColor: "#F0E8DC" }} />
        <div className="h-24 rounded-2xl" style={{ backgroundColor: "#F5EFE6" }} />
        <div className="h-40 rounded-2xl" style={{ backgroundColor: "#F5EFE6" }} />
      </div>
    );
  }

  const initial = profile.full_name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="flex flex-col gap-6 pb-6">

      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl border overflow-hidden"
        style={{ borderColor: "#D6C7B2", backgroundColor: "#FFFFFF" }}
      >
        {/* Top gradient banner */}
        <div
          className="h-24 sm:h-28 relative"
          style={{ background: "linear-gradient(135deg, #E8705A 0%, #C05040 50%, #7DC4B8 100%)" }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
        </div>

        {/* Avatar row */}
        <div className="px-5 sm:px-7 pb-5 sm:pb-6">
          <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-4">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 overflow-hidden flex items-center justify-center text-white font-black text-2xl sm:text-3xl shrink-0"
                style={{ borderColor: "#FFFFFF", backgroundColor: "#946D6D" }}
              >
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
              {/* Upload button */}
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
                style={{ backgroundColor: "#E8705A", borderColor: "#FFFFFF" }}
                aria-label="Change avatar"
              >
                {avatarUploading
                  ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  : <Camera size={12} color="#fff" />
                }
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Edit button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-stone-50 active:scale-95"
                style={{ borderColor: "#D6C7B2", color: "#3A2E2B" }}
              >
                <Edit2 size={12} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Name + email */}
          <h2 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: "#3A2E2B" }}>
            {profile.full_name}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "#9B8B84" }}>{profile.email}</p>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {profile.city && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                style={{ borderColor: "#EDE5D8", backgroundColor: "#FDFAF6", color: "#6B5651" }}>
                <MapPin size={11} style={{ color: "#E8705A" }} />
                {profile.city}{profile.postal_code ? `, ${profile.postal_code}` : ""}
              </div>
            )}
            {profile.street_address && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                style={{ borderColor: "#EDE5D8", backgroundColor: "#FDFAF6", color: "#6B5651" }}>
                <MapPin size={11} style={{ color: "#9B8B84" }} />
                {profile.street_address}
              </div>
            )}
            {profile.phone && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                style={{ borderColor: "#EDE5D8", backgroundColor: "#FDFAF6", color: "#6B5651" }}>
                <Phone size={11} style={{ color: "#7DC4B8" }} />
                {profile.phone}
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
              style={{ borderColor: "#EDE5D8", backgroundColor: "#FDFAF6", color: "#6B5651" }}>
              <Mail size={11} style={{ color: "#E0A96D" }} />
              {profile.email}
            </div>
          </div>

          {/* Stat bar */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t" style={{ borderColor: "#EDE5D8" }}>
            {[
              { value: myPets.length,                                       label: "Pets listed" },
              { value: myPets.filter(p => p.status === "adopted").length,   label: "Adopted out" },
              { value: myPets.filter(p => p.status === "available").length, label: "Available"   },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-black" style={{ color: "#E8705A" }}>{s.value}</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: "#9B8B84" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Edit form ─────────────────────────────────────────────────────── */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="rounded-3xl border p-5 sm:p-6 flex flex-col gap-4"
          style={{ borderColor: "#D6C7B2", backgroundColor: "#FFFFFF" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base" style={{ color: "#3A2E2B" }}>Edit Profile</h3>
            <button type="button" onClick={() => setIsEditing(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-stone-100"
              style={{ color: "#9B8B84" }}>
              <X size={15} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Full Name</label>
            <input type="text" required value={editForm.fullName}
              onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              style={{ borderColor: "#D6C7B2" }} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Street Address</label>
            <input type="text" required value={editForm.streetAddress}
              onChange={e => setEditForm(p => ({ ...p, streetAddress: e.target.value }))}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              style={{ borderColor: "#D6C7B2" }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>City</label>
              <input type="text" required value={editForm.city}
                onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))}
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                style={{ borderColor: "#D6C7B2" }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Postal Code</label>
              <input type="text" value={editForm.postalCode}
                onChange={e => setEditForm(p => ({ ...p, postalCode: e.target.value }))}
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                style={{ borderColor: "#D6C7B2" }} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Phone</label>
            <input type="text" value={editForm.phone}
              onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              style={{ borderColor: "#D6C7B2" }} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setIsEditing(false)}
              className="flex-1 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-stone-50"
              style={{ borderColor: "#D6C7B2", color: "#6B5651" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#E8705A" }}>
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
              ) : (
                <><Check size={14} /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── My listings tile grid ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black" style={{ color: "#3A2E2B" }}>My Listings</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "#E8705A18", color: "#E8705A" }}>
            {myPets.length} pet{myPets.length !== 1 ? "s" : ""}
          </span>
        </div>

        {myPets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 rounded-3xl border border-dashed text-center"
            style={{ borderColor: "#D6C7B2" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "#F5EFE6" }}>
              <PawPrint size={26} style={{ color: "#C0A898" }} />
            </div>
            <p className="font-bold text-sm" style={{ color: "#3A2E2B" }}>No listings yet</p>
            <p className="text-xs max-w-xs" style={{ color: "#9B8B84" }}>
              Head to My Pets to post your first listing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {myPets.map(p => {
              const sc = STATUS_PILL[p.status] ?? STATUS_PILL.available;
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border bg-white overflow-hidden group transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderColor: "#EDE5D8" }}
                >
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: "1/1", backgroundColor: "#F5EFE6" }}>
                    {p.image_urls?.[0] ? (
                      <Image src={p.image_urls[0]} alt={p.name} fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl font-black" style={{ color: "#D6C7B2" }}>
                          {speciesInitials(p.species)}
                        </span>
                      </div>
                    )}
                    {/* Status pill */}
                    <span
                      className="absolute top-2 left-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full backdrop-blur-sm"
                      style={{ backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.text}22` }}
                    >
                      {p.status}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="font-bold text-sm truncate" style={{ color: "#3A2E2B" }}>{p.name}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "#9B8B84" }}>
                      {p.breed || p.species} · {formatAge(p.age_months)}
                    </p>
                    {/* Status dot + change */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: STATUS_DOT[p.status] }} />
                        <span className="text-[10px] font-semibold capitalize" style={{ color: "#6B5651" }}>
                          {p.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleStatus(p.id)}
                        className="text-[10px] font-bold flex items-center gap-0.5 transition-opacity hover:opacity-70"
                        style={{ color: "#E8705A" }}
                      >
                        Change <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
