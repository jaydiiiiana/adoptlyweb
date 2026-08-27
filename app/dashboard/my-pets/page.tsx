"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { Pet, PetSpecies, PetStatus } from "@/types";
import {
  Plus, X, PawPrint, Dog, Cat, Bird, Rabbit,
  ChevronDown, Check, Trash2, RefreshCw,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

function SpeciesIcon({ species, size = 36 }: { species: string; size?: number }) {
  const props = { size, strokeWidth: 1.2, style: { color: "#C0A898" } };
  if (species === "dog")    return <Dog    {...props} />;
  if (species === "cat")    return <Cat    {...props} />;
  if (species === "bird")   return <Bird   {...props} />;
  if (species === "rabbit") return <Rabbit {...props} />;
  return <PawPrint {...props} />;
}

function formatAge(months?: number) {
  if (months == null) return "—";
  if (months < 12) return `${months} mo`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y}y ${m}mo` : `${y}y`;
}

const STATUS_STYLE: Record<PetStatus, { bg: string; text: string; dot: string }> = {
  available: { bg: "#A3B18A18", text: "#3A6020", dot: "#A3B18A" },
  pending:   { bg: "#E0A96D18", text: "#9B6A2A", dot: "#E0A96D" },
  adopted:   { bg: "#946D6D18", text: "#6E4F4F", dot: "#946D6D" },
};

const SPECIES_OPTIONS: { value: PetSpecies; label: string }[] = [
  { value: "dog",    label: "Dog"    },
  { value: "cat",    label: "Cat"    },
  { value: "bird",   label: "Bird"   },
  { value: "rabbit", label: "Rabbit" },
  { value: "other",  label: "Other"  },
];

const STATUS_OPTIONS: { value: PetStatus; label: string; desc: string }[] = [
  { value: "available", label: "Available", desc: "Open to adopters"    },
  { value: "pending",   label: "Pending",   desc: "Adoption in progress" },
  { value: "adopted",   label: "Adopted",   desc: "Successfully rehomed" },
];

interface AddForm {
  name: string; species: PetSpecies; breed: string;
  ageMonths: string; gender: "male" | "female"; description: string;
}
const EMPTY_FORM: AddForm = {
  name: "", species: "dog", breed: "", ageMonths: "", gender: "male", description: "",
};

// ─── component ────────────────────────────────────────────────────────────────

export default function MyPetsPage() {
  const [pets,      setPets]      = useState<Pet[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [userId,    setUserId]    = useState<string | null>(null);
  const [filter,    setFilter]    = useState<PetStatus | "all">("all");

  const [showAdd,   setShowAdd]   = useState(false);
  const [addForm,   setAddForm]   = useState<AddForm>(EMPTY_FORM);
  const [addPhotos, setAddPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [adding,    setAdding]    = useState(false);
  const [addError,  setAddError]  = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const [statusPet,    setStatusPet]    = useState<Pet | null>(null);
  const [newStatus,    setNewStatus]    = useState<PetStatus>("available");
  const [savingStatus, setSavingStatus] = useState(false);
  const [deletingId,   setDeletingId]   = useState<string | null>(null);

  // scroll lock
  useEffect(() => {
    document.body.style.overflow = showAdd || !!statusPet ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showAdd, statusPet]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      setUserId(session.user.id);
      await loadPets(session.user.id);
    })();
  }, []);

  const loadPets = async (uid?: string) => {
    setLoading(true);
    try {
      const all: Pet[] = await api.get("/pets");
      const { data: { session } } = await supabase.auth.getSession();
      const id = uid ?? session?.user.id;
      setPets(all.filter(p => p.owner_id === id));
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    if (!addForm.name || !addForm.breed || !addForm.ageMonths) {
      setAddError("Name, Breed and Age are required.");
      return;
    }
    if (!userId) { setAddError("Not logged in."); return; }
    setAdding(true);
    try {
      const created = await api.post("/pets", {
        name: addForm.name.trim(), species: addForm.species,
        breed: addForm.breed.trim(), age_months: parseInt(addForm.ageMonths, 10),
        gender: addForm.gender, description: addForm.description.trim(), image_urls: [],
      });
      const imageUrls: string[] = [];
      for (const photo of addPhotos) {
        const ext  = photo.file.name.split(".").pop() ?? "jpg";
        const path = `${userId}/${created.id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("pet-images")
          .upload(path, photo.file, { contentType: photo.file.type, upsert: false });
        if (error) throw new Error(error.message);
        imageUrls.push(supabase.storage.from("pet-images").getPublicUrl(path).data.publicUrl);
      }
      const final = imageUrls.length
        ? await api.patch(`/pets/${created.id}`, { image_urls: imageUrls })
        : created;
      addPhotos.forEach(p => URL.revokeObjectURL(p.preview));
      setPets(prev => [final, ...prev]);
      setShowAdd(false); setAddForm(EMPTY_FORM); setAddPhotos([]);
    } catch (err: any) {
      setAddError(err.message ?? "Something went wrong.");
    } finally { setAdding(false); }
  };

  const closeAdd = () => {
    addPhotos.forEach(p => URL.revokeObjectURL(p.preview));
    setAddPhotos([]); setAddForm(EMPTY_FORM); setAddError(null); setShowAdd(false);
  };

  const saveStatus = async () => {
    if (!statusPet) return;
    setSavingStatus(true);
    try {
      const updated = await api.patch(`/pets/${statusPet.id}`, { status: newStatus });
      setPets(prev => prev.map(p => p.id === statusPet.id ? { ...p, ...updated } : p));
      setStatusPet(null);
    } catch (err: any) {
      alert(err.message ?? "Failed to update status.");
    } finally { setSavingStatus(false); }
  };

  const handleDelete = async (pet: Pet) => {
    if (!confirm(`Remove "${pet.name}"? This cannot be undone.`)) return;
    setDeletingId(pet.id);
    try {
      await api.post(`/pets/${pet.id}/remove`);
      setPets(prev => prev.filter(p => p.id !== pet.id));
    } catch (err: any) {
      alert(err.message ?? "Failed to remove listing.");
    } finally { setDeletingId(null); }
  };

  const displayed = filter === "all" ? pets : pets.filter(p => p.status === filter);

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black" style={{ color: "#3A2E2B" }}>My Listings</h1>
          <p className="text-sm mt-0.5" style={{ color: "#9B8B84" }}>
            {pets.length} pet{pets.length !== 1 ? "s" : ""} posted for adoption
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 hover:opacity-90 shrink-0"
          style={{ backgroundColor: "#E8705A", boxShadow: "0 2px 14px rgba(232,112,90,0.35)" }}
        >
          <Plus size={15} strokeWidth={2.5} />
          <span className="hidden sm:inline">Post a Pet</span>
          <span className="sm:hidden">Post</span>
        </button>
      </div>

      {/* ── Filter tabs ─────────────────────────────────────────────────── */}
      {pets.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {(["all", "available", "pending", "adopted"] as const).map(f => {
            const isActive = filter === f;
            const count = f === "all" ? pets.length : pets.filter(p => p.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-all"
                style={{
                  backgroundColor: isActive ? "#E8705A" : "#FFFFFF",
                  borderColor:     isActive ? "#E8705A" : "#D6C7B2",
                  color:           isActive ? "#FFFFFF"  : "#3A2E2B",
                }}
              >
                <span className="capitalize">{f === "all" ? "All" : f}</span>
                <span
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                  style={{
                    backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "#F5EFE6",
                    color: isActive ? "#fff" : "#9B8B84",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Loading skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border overflow-hidden animate-pulse" style={{ borderColor: "#EDE5D8" }}>
              <div style={{ aspectRatio: "1/1", backgroundColor: "#F5EFE6" }} />
              <div className="p-3 flex flex-col gap-2">
                <div className="h-3.5 w-3/4 rounded" style={{ backgroundColor: "#EDE5D8" }} />
                <div className="h-3 w-1/2 rounded"   style={{ backgroundColor: "#EDE5D8" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!loading && pets.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed py-20"
          style={{ borderColor: "#D6C7B2" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#F5EFE6" }}>
            <PawPrint size={28} style={{ color: "#C0A898" }} />
          </div>
          <div className="text-center px-4">
            <p className="font-bold text-base" style={{ color: "#3A2E2B" }}>No listings yet</p>
            <p className="text-sm mt-1" style={{ color: "#9B8B84" }}>Post your first pet for adoption</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: "#E8705A" }}>
            Post a Pet
          </button>
        </div>
      )}

      {/* ── Tile grid ────────────────────────────────────────────────────── */}
      {!loading && displayed.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayed.map(pet => {
            const sc         = STATUS_STYLE[pet.status];
            const isDeleting = deletingId === pet.id;
            return (
              <div
                key={pet.id}
                className="rounded-2xl border bg-white overflow-hidden group transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ borderColor: "#EDE5D8", opacity: isDeleting ? 0.4 : 1 }}
              >
                {/* Square thumbnail */}
                <div className="relative overflow-hidden" style={{ aspectRatio: "1/1", backgroundColor: "#F5EFE6" }}>
                  {pet.image_urls?.[0] ? (
                    <Image src={pet.image_urls[0]} alt={pet.name} fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <SpeciesIcon species={pet.species} size={42} />
                    </div>
                  )}
                  {/* Status badge */}
                  <span
                    className="absolute top-2 left-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full backdrop-blur-sm"
                    style={{ backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.dot}44` }}
                  >
                    {pet.status}
                  </span>
                  {/* Action overlay on hover */}
                  <div className="absolute inset-0 flex items-end justify-center gap-2 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "linear-gradient(transparent 40%, rgba(0,0,0,0.45))" }}>
                    <button
                      onClick={() => { setStatusPet(pet); setNewStatus(pet.status); }}
                      disabled={isDeleting}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-[10px] font-bold backdrop-blur-sm transition-all hover:scale-105"
                      style={{ backgroundColor: "rgba(232,112,90,0.9)" }}
                    >
                      <RefreshCw size={9} /> Status
                    </button>
                    <button
                      onClick={() => handleDelete(pet)}
                      disabled={isDeleting}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-[10px] font-bold backdrop-blur-sm transition-all hover:scale-105"
                      style={{ backgroundColor: "rgba(201,100,100,0.85)" }}
                    >
                      <Trash2 size={9} /> Remove
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-3">
                  <p className="font-bold text-sm truncate leading-tight" style={{ color: "#3A2E2B" }}>{pet.name}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: "#9B8B84" }}>
                    {pet.breed || pet.species}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }} />
                      <span className="text-[10px] font-medium capitalize" style={{ color: "#6B5651" }}>{pet.status}</span>
                    </div>
                    <span className="text-[10px]" style={{ color: "#9B8B84" }}>
                      {formatAge(pet.age_months)} · {pet.gender}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Filtered empty state ─────────────────────────────────────────── */}
      {!loading && pets.length > 0 && displayed.length === 0 && (
        <div className="text-center py-14 rounded-2xl border border-dashed" style={{ borderColor: "#D6C7B2" }}>
          <p className="text-sm font-bold" style={{ color: "#3A2E2B" }}>No {filter} pets</p>
          <button onClick={() => setFilter("all")} className="text-xs mt-1 underline" style={{ color: "#E8705A" }}>
            Show all
          </button>
        </div>
      )}

      {/* ════════════════════ ADD PET MODAL ════════════════════ */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <form
            onSubmit={handleAdd}
            className="w-full sm:max-w-lg bg-white overflow-y-auto"
            style={{ maxHeight: "92dvh", borderRadius: "24px 24px 0 0" }}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b"
              style={{ borderColor: "#EDE5D8" }}>
              <div>
                <h2 className="text-lg font-black" style={{ color: "#3A2E2B" }}>Post a Pet</h2>
                <p className="text-xs mt-0.5" style={{ color: "#9B8B84" }}>Fill in the details and add photos</p>
              </div>
              <button type="button" onClick={closeAdd}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100"
                style={{ color: "#9B8B84" }}>
                <X size={16} />
              </button>
            </div>

            <div className="px-5 sm:px-6 py-5 flex flex-col gap-5">
              {addError && (
                <div className="rounded-xl p-3 text-xs font-semibold border"
                  style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}>
                  {addError}
                </div>
              )}

              {/* Photos */}
              <div>
                <p className="text-xs font-bold mb-2.5" style={{ color: "#3A2E2B" }}>
                  Photos <span className="font-normal" style={{ color: "#9B8B84" }}>(up to 5 — first becomes the cover)</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {addPhotos.map((p, i) => (
                    <div key={p.preview} className="relative rounded-2xl overflow-hidden border-2 shrink-0"
                      style={{ width: 72, height: 72, borderColor: i === 0 ? "#E8705A" : "#D6C7B2" }}>
                      <Image src={p.preview} alt="" fill className="object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-0 inset-x-0 text-center text-white text-[8px] font-bold py-0.5"
                          style={{ backgroundColor: "rgba(232,112,90,0.85)" }}>Cover</span>
                      )}
                      <button type="button"
                        onClick={() => { URL.revokeObjectURL(p.preview); setAddPhotos(prev => prev.filter((_, j) => j !== i)); }}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: "rgba(0,0,0,0.6)", fontSize: 10 }}>
                        ×
                      </button>
                    </div>
                  ))}
                  {addPhotos.length < 5 && (
                    <button type="button" onClick={() => photoRef.current?.click()}
                      className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all hover:border-orange-400 hover:bg-orange-50 shrink-0"
                      style={{ width: 72, height: 72, borderColor: "#D6C7B2", color: "#9B8B84" }}>
                      <Plus size={20} strokeWidth={1.5} />
                      <span className="text-[9px] font-semibold">Add</span>
                    </button>
                  )}
                </div>
                <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" disabled={adding}
                  onChange={e => {
                    const files = Array.from(e.target.files ?? []);
                    setAddPhotos(prev => [...prev, ...files.map(f => ({ file: f, preview: URL.createObjectURL(f) }))].slice(0, 5));
                    e.target.value = "";
                  }} />
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Pet Name *</label>
                <input type="text" required disabled={adding} value={addForm.name}
                  onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Milo"
                  className="w-full rounded-xl border px-3.5 py-3 text-sm outline-none focus:border-orange-400 transition-colors"
                  style={{ borderColor: "#D6C7B2" }} />
              </div>

              {/* Species + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Species *</label>
                  <div className="relative">
                    <select value={addForm.species} disabled={adding}
                      onChange={e => setAddForm(p => ({ ...p, species: e.target.value as PetSpecies }))}
                      className="w-full rounded-xl border px-3.5 py-3 text-sm outline-none appearance-none pr-8"
                      style={{ borderColor: "#D6C7B2" }}>
                      {SPECIES_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9B8B84" }} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Gender *</label>
                  <div className="relative">
                    <select value={addForm.gender} disabled={adding}
                      onChange={e => setAddForm(p => ({ ...p, gender: e.target.value as "male" | "female" }))}
                      className="w-full rounded-xl border px-3.5 py-3 text-sm outline-none appearance-none pr-8"
                      style={{ borderColor: "#D6C7B2" }}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9B8B84" }} />
                  </div>
                </div>
              </div>

              {/* Breed + Age */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Breed *</label>
                  <input type="text" required disabled={adding} value={addForm.breed}
                    onChange={e => setAddForm(p => ({ ...p, breed: e.target.value }))}
                    placeholder="e.g. Shih Tzu"
                    className="w-full rounded-xl border px-3.5 py-3 text-sm outline-none focus:border-orange-400 transition-colors"
                    style={{ borderColor: "#D6C7B2" }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Age in months *</label>
                  <input type="number" min={0} required disabled={adding} value={addForm.ageMonths}
                    onChange={e => setAddForm(p => ({ ...p, ageMonths: e.target.value }))}
                    placeholder="e.g. 6"
                    className="w-full rounded-xl border px-3.5 py-3 text-sm outline-none focus:border-orange-400 transition-colors"
                    style={{ borderColor: "#D6C7B2" }} />
                </div>
              </div>

              {/* About */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>About this pet</label>
                <textarea rows={4} disabled={adding} value={addForm.description}
                  onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Personality, habits, vaccinations, spayed/neutered status…"
                  className="w-full rounded-xl border px-3.5 py-3 text-sm outline-none resize-none focus:border-orange-400 transition-colors"
                  style={{ borderColor: "#D6C7B2" }} />
              </div>

              <button type="submit" disabled={adding}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                style={{ backgroundColor: "#E8705A", boxShadow: "0 2px 16px rgba(232,112,90,0.38)" }}>
                {adding ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publishing…</>
                ) : (
                  <><Check size={15} /> Publish Listing</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ════════════════════ STATUS MODAL ════════════════════ */}
      {statusPet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="w-full sm:max-w-sm bg-white flex flex-col gap-5 p-5 sm:p-6"
            style={{ borderRadius: "24px 24px 0 0" }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black" style={{ color: "#3A2E2B" }}>Update Status</h2>
                <p className="text-xs mt-0.5" style={{ color: "#9B8B84" }}>{statusPet.name}</p>
              </div>
              <button onClick={() => setStatusPet(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100"
                style={{ color: "#9B8B84" }}>
                <X size={15} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {STATUS_OPTIONS.map(opt => {
                const isSelected = newStatus === opt.value;
                const sc = STATUS_STYLE[opt.value];
                return (
                  <button key={opt.value} type="button" onClick={() => setNewStatus(opt.value)}
                    className="flex items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.98]"
                    style={{
                      borderColor: isSelected ? "#E8705A" : "#D6C7B2",
                      backgroundColor: isSelected ? "#FEF3F0" : "#FDFAF6",
                    }}>
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: sc.dot }} />
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: "#3A2E2B" }}>{opt.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#9B8B84" }}>{opt.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "#E8705A" }}>
                        <Check size={11} color="#fff" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStatusPet(null)}
                className="flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors hover:bg-stone-50"
                style={{ borderColor: "#D6C7B2", color: "#6B5651" }}>
                Cancel
              </button>
              <button onClick={saveStatus}
                disabled={savingStatus || newStatus === statusPet.status}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#E8705A" }}>
                {savingStatus
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                  : "Save Status"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
