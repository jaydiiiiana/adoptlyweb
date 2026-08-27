"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { formatAge, speciesInitials } from "@/data/mock";
import type { Pet, PetSpecies } from "@/types";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { sortPetsByProximity } from "@/lib/proximity";
import { UserAvatar } from "@/components/user-avatar";
import {
  Search, MapPin, Plus, X, ChevronDown, PawPrint,
  MessageCircle, Flag, Settings, ZoomIn, Check,
  Dog, Cat, Bird, Rabbit, Loader2,
} from "lucide-react";

// ─── Admin Banners ────────────────────────────────────────────────────────────
interface AdBanner {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  bg_color: string;
  expires_at: string;
}

function AdminBanners() {
  const [banners,   setBanners]   = useState<AdBanner[]>([]);
  const [current,   setCurrent]   = useState(0);
  const [paused,    setPaused]    = useState(false);
  const [lightbox,  setLightbox]  = useState(false);
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

  useEffect(() => {
    fetch(`${API}/banners`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: AdBanner[]) => {
        const active = data.filter(
          (b) => b.image_url && new Date(b.expires_at) > new Date(),
        );
        setBanners(active);
      })
      .catch(() => {});
  }, [API]);

  // Auto-advance every 3 s (paused when lightbox is open too)
  useEffect(() => {
    if (banners.length <= 1 || paused || lightbox) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length, paused, lightbox]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  // Banner tapped — link → open URL, no link → open lightbox
  const handleBannerTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (banner.link_url) {
      fetch(`${API}/banners/${banner.id}/click`, { method: "POST" }).catch(() => {});
      window.open(banner.link_url, "_blank", "noopener,noreferrer");
    } else {
      setLightbox(true);
    }
  };

  return (
    <>
      {/* ── Carousel ── */}
      <div
        className="relative w-full overflow-hidden rounded-xl cursor-pointer"
        style={{ aspectRatio: "21/6" }}
        onClick={handleBannerTap}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        role="button"
        tabIndex={0}
        aria-label={banner.link_url ? `Open ${banner.title}` : `View ${banner.title} full screen`}
        onKeyDown={(e) => { if (e.key === "Enter") handleBannerTap(e as unknown as React.MouseEvent); }}
      >
        {/* Slides */}
        {banners.map((b, i) => (
          <div
            key={b.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            <Image
              src={b.image_url}
              alt={b.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 800px"
              priority={i === 0}
            />
          </div>
        ))}

        {/* Gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.52) 0%, transparent 55%)", zIndex: 2 }}
        />

        {/* Text */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{ zIndex: 3 }}>
          <p className="text-white font-semibold text-xs leading-snug drop-shadow line-clamp-1">
            {banner.title}
          </p>
          {banner.description && (
            <p className="hidden sm:block text-white/70 text-[10px] mt-0.5 line-clamp-1 drop-shadow">
              {banner.description}
            </p>
          )}
        </div>

        {/* Dot indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-2 right-3 flex items-center gap-1" style={{ zIndex: 3 }}>
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className="rounded-full transition-all"
                style={{
                  width:  i === current ? 16 : 5,
                  height: 5,
                  backgroundColor: i === current ? "#fff" : "rgba(255,255,255,0.45)",
                }}
                aria-label={`Go to banner ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Action hint pill */}
        <div
          className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0,0,0,0.48)", color: "#fff", zIndex: 3 }}
        >
          {banner.link_url ? (
            <>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Open
            </>
          ) : (
            <>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
              View
            </>
          )}
        </div>
      </div>

      {/* ── Lightbox (photo-only banners) ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image
              src={banner.image_url}
              alt={banner.title}
              fill
              className="object-contain"
              sizes="100vw"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {/* Title */}
          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-1 px-4">
            <p className="text-white font-semibold text-sm text-center drop-shadow">{banner.title}</p>
            {banner.description && (
              <p className="text-white/70 text-xs text-center">{banner.description}</p>
            )}
          </div>
          {/* Close button */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  available: { bg: "#A3B18A", text: "#fff" },
  pending:   { bg: "#E0A96D", text: "#fff" },
  adopted:   { bg: "#6B5651", text: "#fff" },
};

function SpeciesIcon({ species, size = 18 }: { species: string; size?: number }) {
  const props = { size, strokeWidth: 1.5 };
  if (species === "dog")    return <Dog    {...props} />;
  if (species === "cat")    return <Cat    {...props} />;
  if (species === "bird")   return <Bird   {...props} />;
  if (species === "rabbit") return <Rabbit {...props} />;
  return <PawPrint {...props} />;
}

const SPECIES_TABS = [
  { value: "all",    label: "All"     },
  { value: "dog",    label: "Dogs"    },
  { value: "cat",    label: "Cats"    },
  { value: "bird",   label: "Birds"   },
  { value: "rabbit", label: "Rabbits" },
  { value: "other",  label: "Other"   },
] as const;

// ─── component ────────────────────────────────────────────────────────────────

export default function ExploreFeed() {
  const [pets, setPets]           = useState<Pet[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<PetSpecies | "all">("all");
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [myId, setMyId]           = useState("");
  const [myCity, setMyCity]       = useState("");
  const [searchMode, setSearchMode] = useState<"name" | "city">("name");
  const [showAdd, setShowAdd]     = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [addForm, setAddForm] = useState({
    name: "", species: "dog" as PetSpecies, breed: "",
    ageMonths: "", gender: "male" as "male" | "female", description: "",
  });
  const [addPhotos, setAddPhotos] = useState<{ file: File; preview: string }[]>([]);
  const photoRef = useRef<HTMLInputElement>(null);

  const [reportReason, setReportReason] = useState("scam");
  const [reportDesc, setReportDesc]     = useState("");

  // ── data ────────────────────────────────────────────────────────────────────

  const fetchPets = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (selectedSpecies !== "all") p.set("species", selectedSpecies);
      if (search.trim())             p.set("search", search.trim());
      if (locationSearch.trim())     p.set("city", locationSearch.trim());
      const data: Pet[] = await api.get(`/pets?${p.toString()}`);
      const visible = data.filter(pet => pet.status !== "adopted");
      setPets(sortPetsByProximity(visible, myCity));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [selectedSpecies, search, locationSearch, myCity]);

  useEffect(() => { fetchPets(); }, [fetchPets]);

  useEffect(() => {
    api.get("/profiles/me")
      .then(u => { setMyId(u.id); setMyCity(u.city ?? ""); })
      .catch(() => {});
  }, []);

  // Lock body scroll when a modal is open
  useEffect(() => {
    const open = !!(selectedPet || showAdd || showReport || lightboxUrl);
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedPet, showAdd, showReport, lightboxUrl]);

  // ── handlers ────────────────────────────────────────────────────────────────

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.breed || !addForm.ageMonths) return;
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user.id;
      if (!uid) throw new Error("Not authenticated.");
      const newPet = await api.post("/pets", {
        name: addForm.name, species: addForm.species, breed: addForm.breed,
        age_months: parseInt(addForm.ageMonths), gender: addForm.gender,
        description: addForm.description, image_urls: [],
      });
      const urls: string[] = [];
      for (const photo of addPhotos) {
        const ext  = photo.file.name.split(".").pop() ?? "jpg";
        const path = `${uid}/${newPet.id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("pet-images")
          .upload(path, photo.file, { contentType: photo.file.type, upsert: false });
        if (error) throw new Error(error.message);
        urls.push(supabase.storage.from("pet-images").getPublicUrl(path).data.publicUrl);
      }
      const final = urls.length ? await api.patch(`/pets/${newPet.id}`, { image_urls: urls }) : newPet;
      addPhotos.forEach(p => URL.revokeObjectURL(p.preview));
      setPets(prev => [final, ...prev]);
      setShowAdd(false);
      setAddForm({ name: "", species: "dog", breed: "", ageMonths: "", gender: "male", description: "" });
      setAddPhotos([]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to post listing.");
    } finally { setSubmitting(false); }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;
    setSubmitting(true);
    try {
      await api.post("/reports", {
        reported_user_id: selectedPet.owner_id, pet_id: selectedPet.id,
        reason: reportReason, description: reportDesc,
      });
      setShowReport(false);
      setReportDesc("");
      alert("Report submitted.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to submit report.");
    } finally { setSubmitting(false); }
  };

  const handleChat = async () => {
    if (!selectedPet) return;
    setSubmitting(true);
    try {
      const conv = await api.post("/conversations", { pet_id: selectedPet.id });
      window.location.href = `/dashboard/messages?conversationId=${conv.id}`;
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Could not start chat.");
      setSubmitting(false);
    }
  };

  const closeAdd = () => {
    addPhotos.forEach(p => URL.revokeObjectURL(p.preview));
    setAddPhotos([]);
    setAddForm({ name: "", species: "dog", breed: "", ageMonths: "", gender: "male", description: "" });
    setShowAdd(false);
  };

  // ── derived ──────────────────────────────────────────────────────────────────

  const featuredPet = pets.find(p => p.status === "available");
  const gridPets    = pets;

  const sectionHeading = locationSearch.trim()
    ? `Pets in "${locationSearch.trim()}"`
    : myCity ? `Nearest to ${myCity}` : "Discover Companions";

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 sm:gap-6 pb-4">

      {/* ── Top action bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center">

        {/* Search bar */}
        <div
          className="flex flex-1 items-center rounded-2xl border overflow-hidden bg-white transition-all focus-within:shadow-md focus-within:border-orange-300"
          style={{ borderColor: "#D6C7B2" }}
        >
          {/* Mode pill */}
          <button
            type="button"
            onClick={() => { setSearchMode(m => m === "name" ? "city" : "name"); setSearch(""); setLocationSearch(""); }}
            className="flex items-center gap-1 pl-3 pr-2 py-3 text-xs font-semibold border-r shrink-0 transition-colors hover:bg-orange-50"
            style={{ borderColor: "#EDE5D8", color: searchMode === "city" ? "#E8705A" : "#9B8B84" }}
          >
            {searchMode === "name" ? <><Search size={13} /><span className="hidden xs:inline">Name</span></> : <><MapPin size={13} /><span className="hidden xs:inline">City</span></>}
            <ChevronDown size={9} />
          </button>

          <input
            type="text"
            value={searchMode === "name" ? search : locationSearch}
            onChange={e => searchMode === "name" ? setSearch(e.target.value) : setLocationSearch(e.target.value)}
            placeholder={searchMode === "name" ? "Search name or breed…" : myCity ? `City (yours: ${myCity})` : "Search by city…"}
            className="flex-1 px-3 py-3 text-sm outline-none bg-transparent min-w-0"
            style={{ color: "#3A2E2B" }}
          />
          {(searchMode === "name" ? search : locationSearch) && (
            <button
              onClick={() => searchMode === "name" ? setSearch("") : setLocationSearch("")}
              className="px-3 flex items-center text-stone-400 hover:text-stone-600 shrink-0"
            ><X size={14} /></button>
          )}
        </div>

        {/* Post a pet CTA */}
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 rounded-2xl px-4 sm:px-5 py-3 text-sm font-bold text-white shrink-0 transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#E8705A" }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Post a Pet
        </button>
      </div>

      {/* Location sort hint */}
      {myCity && !locationSearch && (
        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#7A9A5A" }}>
          <MapPin size={11} />
          Sorted by proximity to <strong>{myCity}</strong>
        </div>
      )}

      {/* ── Admin Banners — below search, above species tabs ──────────────────── */}
      <AdminBanners />

      {/* ── Species filter tabs ───────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:-mx-0 sm:px-0 scrollbar-none">
        {SPECIES_TABS.map(tab => {
          const active = selectedSpecies === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setSelectedSpecies(tab.value)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold shrink-0 border transition-all active:scale-95"
              style={{
                backgroundColor: active ? "#E8705A" : "#FFFFFF",
                borderColor:     active ? "#E8705A" : "#D6C7B2",
                color:           active ? "#FFFFFF"  : "#3A2E2B",
              }}
            >
              <SpeciesIcon species={tab.value} size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Featured banner ──────────────────────────────────────────────────── */}
      {featuredPet && selectedSpecies === "all" && !search && !locationSearch && (
        <div
          onClick={() => setSelectedPet(featuredPet)}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer group"
          style={{ minHeight: 180 }}
        >
          <div className="absolute inset-0">
            {featuredPet.image_urls?.[0]
              ? <Image src={featuredPet.image_urls[0]} alt={featuredPet.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#EDE5D8" }}>{speciesInitials(featuredPet.species)}</div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>

          <div className="relative p-4 sm:p-6 flex flex-col justify-end" style={{ minHeight: 180 }}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Featured · Available Now</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{featuredPet.name}</h2>
            <p className="text-sm text-white/80 mt-1">{featuredPet.breed} · {formatAge(featuredPet.age_months)}</p>
            {featuredPet.owner?.city && (
              <p className="flex items-center gap-1 text-xs text-white/60 mt-1"><MapPin size={11} />{featuredPet.owner.city}</p>
            )}
            <span className="mt-3 self-start text-xs font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
              View Details →
            </span>
          </div>
        </div>
      )}

      {/* ── Grid ─────────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base font-bold" style={{ color: "#3A2E2B" }}>{sectionHeading}</h2>
          {loading
            ? <span className="text-xs animate-pulse" style={{ color: "#9B8B84" }}>Loading…</span>
            : <span className="text-xs" style={{ color: "#9B8B84" }}>{gridPets.length} listing{gridPets.length !== 1 ? "s" : ""}</span>
          }
        </div>

        {!loading && gridPets.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#F5EFE6" }}>
              <PawPrint size={28} style={{ color: "#C0A898" }} />
            </div>
            <p className="font-semibold text-sm" style={{ color: "#3A2E2B" }}>No pets found</p>
            <p className="text-xs" style={{ color: "#9B8B84" }}>
              {locationSearch ? `No listings in "${locationSearch}" yet.` : "Try a different filter or be the first to post!"}
            </p>
            {locationSearch && (
              <button onClick={() => setLocationSearch("")} className="text-xs font-bold underline mt-1" style={{ color: "#E8705A" }}>
                Show all locations
              </button>
            )}
          </div>
        )}

        {/* Responsive grid: 2 cols on mobile, more on wider screens */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {gridPets.map(pet => {
            const sc = STATUS_STYLE[pet.status] ?? STATUS_STYLE.available;
            const nearYou = myCity && pet.owner?.city?.toLowerCase().includes(myCity.toLowerCase().split(" ")[0]);
            return (
              <div
                key={pet.id}
                onClick={() => setSelectedPet(pet)}
                className="rounded-2xl overflow-hidden bg-white border cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.97]"
                style={{ borderColor: "#EDE5D8" }}
              >
                {/* Photo */}
                <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
                  {pet.image_urls?.[0]
                    ? <Image src={pet.image_urls[0]} alt={pet.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#F5EFE6", color: "#C0A898" }}>
                        <SpeciesIcon species={pet.species} size={36} />
                      </div>
                  }
                  <span
                    className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: sc.bg, color: sc.text }}
                  >{pet.status}</span>
                  {nearYou && (
                    <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: "#E8705A" }}>
                      Near you
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5 sm:p-3">
                  <p className="font-bold text-sm truncate leading-tight" style={{ color: "#3A2E2B" }}>{pet.name}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: "#9B8B84" }}>{pet.breed || pet.species}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] font-medium" style={{ color: "#9B8B84" }}>{formatAge(pet.age_months)}</span>
                    {pet.owner?.city && (
                      <span className="flex items-center gap-0.5 text-[10px] truncate max-w-[60%]" style={{ color: "#C0A898" }}>
                        <MapPin size={9} className="shrink-0" />{pet.owner.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Pet detail drawer/modal ───────────────────────────────────────────── */}
      {selectedPet && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedPet(null); }}
        >
          <div
            className="relative w-full sm:max-w-lg bg-white overflow-y-auto"
            style={{
              maxHeight: "92dvh",
              borderRadius: "24px 24px 0 0",
            }}
          >
            {/* Hero image */}
            <div
              className="relative w-full cursor-zoom-in"
              style={{ aspectRatio: "4/3" }}
              onClick={() => selectedPet.image_urls?.[0] && setLightboxUrl(selectedPet.image_urls[0])}
            >
              {selectedPet.image_urls?.[0]
                ? <Image src={selectedPet.image_urls[0]} alt={selectedPet.name} fill className="object-cover" />
                : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#F5EFE6", color: "#C0A898" }}>
                    <SpeciesIcon species={selectedPet.species} size={72} />
                  </div>
              }
              {/* Multiple photos strip */}
              {selectedPet.image_urls?.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-2 overflow-x-auto">
                  {selectedPet.image_urls.map((url, i) => (
                    <button
                      key={i}
                      onClick={e => { e.stopPropagation(); setLightboxUrl(url); }}
                      className="w-8 h-8 rounded-lg overflow-hidden border-2 shrink-0 transition-all hover:scale-110"
                      style={{ borderColor: "rgba(255,255,255,0.8)" }}
                    >
                      <Image src={url} alt={`Photo ${i+1}`} width={32} height={32} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              )}
              {selectedPet.image_urls?.[0] && (
                <span className="absolute top-3 right-12 flex items-center gap-1 text-[10px] font-semibold text-white/70 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  <ZoomIn size={10} /> Tap to enlarge
                </span>
              )}
              <button
                onClick={() => setSelectedPet(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/70 transition-colors"
                aria-label="Close"
              ><X size={16} /></button>
              <span
                className="absolute top-3 left-3 text-xs font-bold uppercase px-3 py-1 rounded-full"
                style={{ backgroundColor: STATUS_STYLE[selectedPet.status]?.bg ?? "#6B5651", color: "#fff" }}
              >{selectedPet.status}</span>
            </div>

            {/* Details */}
            <div className="p-4 sm:p-5 flex flex-col gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: "#3A2E2B" }}>{selectedPet.name}</h2>
                <p className="text-sm mt-1" style={{ color: "#9B8B84" }}>
                  {[selectedPet.breed, selectedPet.gender?.toUpperCase(), formatAge(selectedPet.age_months)].filter(Boolean).join(" · ")}
                </p>
              </div>

              {/* Stat pills */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Species",  val: selectedPet.species   },
                  { label: "Age",      val: formatAge(selectedPet.age_months) || "—" },
                  { label: "Gender",   val: selectedPet.gender ?? "—" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-2.5 text-center border" style={{ borderColor: "#EDE5D8", backgroundColor: "#FDFAF6" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#9B8B84" }}>{s.label}</p>
                    <p className="text-sm font-bold capitalize mt-0.5" style={{ color: "#3A2E2B" }}>{s.val}</p>
                  </div>
                ))}
              </div>

              {selectedPet.description && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "#9B8B84" }}>About</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#3A2E2B" }}>{selectedPet.description}</p>
                </div>
              )}

              {selectedPet.owner && (
                <div className="flex items-center gap-3 rounded-2xl p-3 border" style={{ borderColor: "#EDE5D8", backgroundColor: "#FDFAF6" }}>
                  <UserAvatar
                    name={selectedPet.owner.full_name}
                    avatarUrl={selectedPet.owner.avatar_url}
                    size={40}
                    bgColor="#946D6D"
                  />
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#3A2E2B" }}>{selectedPet.owner.full_name}</p>
                    <p className="flex items-center gap-1 text-xs" style={{ color: "#9B8B84" }}><MapPin size={11} />{selectedPet.owner.city}</p>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col gap-2 pt-1 pb-safe">
                {selectedPet.owner_id === myId ? (
                  <a
                    href="/dashboard/my-pets"
                    className="w-full py-3.5 rounded-2xl text-sm font-bold text-white text-center flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#946D6D" }}
                  >
                    <Settings size={15} /> Manage This Listing
                  </a>
                ) : (
                  <>
                    <button
                      onClick={handleChat}
                      disabled={submitting}
                      className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: "#E8705A" }}
                    >
                      {submitting ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={15} />}
                      {submitting ? "Connecting…" : "Chat with Owner"}
                    </button>
                    <button
                      onClick={() => setShowReport(true)}
                      className="w-full py-2.5 rounded-2xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors hover:bg-red-50"
                      style={{ borderColor: "#EDE5D8", color: "#C96464" }}
                    >
                      <Flag size={12} /> Report Suspicious Listing
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────────────────────────────────── */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image
              src={lightboxUrl}
              alt="Full screen"
              fill
              className="object-contain"
              onClick={e => e.stopPropagation()}
            />
          </div>
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-sm hover:bg-white/30"
            aria-label="Close"
          ><X size={18} /></button>
        </div>
      )}

      {/* ── Add Pet Modal ─────────────────────────────────────────────────────── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
          <form
            onSubmit={handleAddPet}
            className="w-full sm:max-w-lg bg-white overflow-y-auto"
            style={{ maxHeight: "92dvh", borderRadius: "24px 24px 0 0" }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white flex items-center justify-between px-4 sm:px-5 pt-5 pb-3 border-b" style={{ borderColor: "#EDE5D8" }}>
              <h2 className="text-lg font-black" style={{ color: "#3A2E2B" }}>Post a Pet</h2>
              <button type="button" onClick={closeAdd} className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 sm:p-5 flex flex-col gap-4">
              {myCity && (
                <div className="flex items-center gap-2 text-xs font-semibold rounded-xl px-3 py-2.5 border" style={{ backgroundColor: "#F0F7EC", borderColor: "#C5DDB8", color: "#4A7A30" }}>
                  <MapPin size={12} /> Location auto-set: <strong>{myCity}</strong>
                </div>
              )}

              {/* Photos */}
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: "#3A2E2B" }}>Photos <span className="font-normal text-stone-400">(up to 5)</span></p>
                <div className="flex flex-wrap gap-2">
                  {addPhotos.map((p, i) => (
                    <div key={p.preview} className="relative w-16 h-16 rounded-xl overflow-hidden border" style={{ borderColor: "#D6C7B2" }}>
                      <Image src={p.preview} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => { URL.revokeObjectURL(p.preview); setAddPhotos(prev => prev.filter((_, j) => j !== i)); }}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                      >×</button>
                    </div>
                  ))}
                  {addPhotos.length < 5 && (
                    <button
                      type="button"
                      onClick={() => photoRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-0.5 text-xs font-bold transition-opacity hover:opacity-60"
                      style={{ borderColor: "#D6C7B2", color: "#9B8B84" }}
                    >
                      <Plus size={18} strokeWidth={1.5} />
                      Add
                    </button>
                  )}
                </div>
                <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" disabled={submitting}
                  onChange={e => { const f = Array.from(e.target.files ?? []); setAddPhotos(p => [...p, ...f.map(x => ({ file: x, preview: URL.createObjectURL(x) }))].slice(0, 5)); e.target.value = ""; }} />
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: "#3A2E2B" }}>Name *</label>
                <input required disabled={submitting} value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Milo" className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-orange-400" style={{ borderColor: "#D6C7B2" }} />
              </div>

              {/* Species + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: "#3A2E2B" }}>Species *</label>
                  <select disabled={submitting} value={addForm.species} onChange={e => setAddForm(p => ({ ...p, species: e.target.value as PetSpecies }))}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none" style={{ borderColor: "#D6C7B2" }}>
                    <option value="dog">Dog</option><option value="cat">Cat</option>
                    <option value="bird">Bird</option><option value="rabbit">Rabbit</option><option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: "#3A2E2B" }}>Gender *</label>
                  <select disabled={submitting} value={addForm.gender} onChange={e => setAddForm(p => ({ ...p, gender: e.target.value as "male" | "female" }))}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none" style={{ borderColor: "#D6C7B2" }}>
                    <option value="male">Male</option><option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Breed + Age */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: "#3A2E2B" }}>Breed *</label>
                  <input required disabled={submitting} value={addForm.breed} onChange={e => setAddForm(p => ({ ...p, breed: e.target.value }))}
                    placeholder="e.g. Shih Tzu" className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none" style={{ borderColor: "#D6C7B2" }} />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: "#3A2E2B" }}>Age (months) *</label>
                  <input type="number" min={0} required disabled={submitting} value={addForm.ageMonths} onChange={e => setAddForm(p => ({ ...p, ageMonths: e.target.value }))}
                    placeholder="e.g. 6" className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none" style={{ borderColor: "#D6C7B2" }} />
                </div>
              </div>

              {/* About */}
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: "#3A2E2B" }}>About</label>
                <textarea rows={3} disabled={submitting} value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe personality, habits, vaccinations…"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none resize-none" style={{ borderColor: "#D6C7B2" }} />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#E8705A" }}>
                {submitting ? "Posting…" : "Submit Listing"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Report Modal ──────────────────────────────────────────────────────── */}
      {showReport && selectedPet && (
        <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
          <form
            onSubmit={handleReport}
            className="w-full sm:max-w-md bg-white p-4 sm:p-5 flex flex-col gap-4"
            style={{ borderRadius: "24px 24px 0 0" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold" style={{ color: "#3A2E2B" }}>Report Listing</h2>
              <button type="button" onClick={() => setShowReport(false)} className="text-stone-400 flex items-center"><X size={18} /></button>
            </div>
            <select value={reportReason} onChange={e => setReportReason(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none" style={{ borderColor: "#D6C7B2" }}>
              <option value="scam">Scam / Fraud</option>
              <option value="fake_listing">Fake Listing</option>
              <option value="harassment">Harassment</option>
              <option value="illegal_trade">Illegal Pet Trade</option>
              <option value="other">Other</option>
            </select>
            <textarea required rows={3} value={reportDesc} onChange={e => setReportDesc(e.target.value)}
              placeholder="Describe the issue…"
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none resize-none" style={{ borderColor: "#D6C7B2" }} />
            <button type="submit" disabled={submitting}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: "#C96464" }}>
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
