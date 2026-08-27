"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { formatAge, speciesInitials } from "@/data/mock";
import type { Pet } from "@/types";
import { api } from "@/lib/api";
import { Heart, PawPrint, X } from "lucide-react";

export default function FavoritesGrid() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("adoptly_favorites");
    const parsed = saved ? JSON.parse(saved) : [];
    setFavorites(parsed);

    api.get("/pets")
      .then((data) => {
        setPets(data.filter((p: Pet) => parsed.includes(p.id)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRemoveFavorite = (e: React.MouseEvent, petId: string) => {
    e.stopPropagation();
    const updated = favorites.filter((id) => id !== petId);
    setFavorites(updated);
    localStorage.setItem("adoptly_favorites", JSON.stringify(updated));
    setPets((prev) => prev.filter((p) => p.id !== petId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm font-semibold" style={{ color: "#3A2E2B" }}>Loading saved listings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div>
        <h3 className="text-xl sm:text-2xl font-bold" style={{ color: "#3A2E2B" }}>My Saved Pets</h3>
        {pets.length > 0 && (
          <p className="text-sm mt-0.5" style={{ color: "#6B5651" }}>{pets.length} saved listing{pets.length !== 1 ? "s" : ""}</p>
        )}
      </div>

      {/* Responsive grid */}
      {pets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="rounded-2xl border overflow-hidden bg-white relative transition-all hover:shadow-md active:scale-[0.97]"
              style={{ borderColor: "#D6C7B2" }}
            >
              {/* Thumbnail */}
              <div
                className="relative flex items-center justify-center"
                style={{ height: 140, backgroundColor: "#EDE5D8" }}
              >
                {pet.image_urls?.[0] ? (
                  <Image src={pet.image_urls[0]} alt={pet.name} fill className="object-cover" />
                ) : (
                  <span className="text-2xl font-black" style={{ color: "#C0A898" }}>{speciesInitials(pet.species)}</span>
                )}

                {/* Remove button */}
                <button
                  onClick={(e) => handleRemoveFavorite(e, pet.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 border border-stone-200 flex items-center justify-center shadow-sm transition-colors hover:bg-red-50 hover:border-red-200"
                  aria-label="Remove from favorites"
                >
                  <X size={13} style={{ color: "#946D6D" }} />
                </button>

                {/* Status chip */}
                <span
                  className="absolute top-2 left-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor:
                      pet.status === "available" ? "#A3B18A" :
                      pet.status === "pending"   ? "#E0A96D" : "#6B5651",
                    color: "#fff",
                  }}
                >
                  {pet.status}
                </span>
              </div>

              <div className="p-3 flex flex-col gap-1">
                <h4 className="font-bold text-sm truncate" style={{ color: "#3A2E2B" }}>{pet.name}</h4>
                <p className="text-xs truncate" style={{ color: "#6B5651" }}>{pet.breed || pet.species}</p>
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#9B8B84" }}>{formatAge(pet.age_months)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {pets.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#F5EFE6" }}>
            <Heart size={28} style={{ color: "#C0A898" }} />
          </div>
          <div>
            <p className="text-base font-bold" style={{ color: "#3A2E2B" }}>No saved pets</p>
            <p className="text-sm mt-1 max-w-xs" style={{ color: "#6B5651" }}>
              Tap the save option on pet listings to view them here later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
