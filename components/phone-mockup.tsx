"use client";

import Image from "next/image";
import { useState } from "react";

const SCREENS = [
  {
    label: "Discovery Feed",
    pets: [
      { name: "Milo",   species: "Golden Retriever", age: "2 yrs", status: "Available", statusColor: "#A3B18A", dist: "3.5 km" },
      { name: "Luna",   species: "Domestic Shorthair", age: "1 yr", status: "Available", statusColor: "#A3B18A", dist: "2.6 km" },
      { name: "Beagle", species: "Beagle",            age: "3 yrs", status: "Pending",   statusColor: "#E0A96D", dist: "5.1 km" },
    ],
  },
  {
    label: "Pet Details",
    detail: {
      name: "Luna",
      breed: "Domestic Shorthair",
      gender: "Female",
      vaccinated: "Yes",
      neutered: "Yes",
    },
  },
  {
    label: "Chat",
    messages: [
      { from: "them", text: "Hi! Is Luna still available?" },
      { from: "me",   text: "Yes she is! She loves cuddles." },
      { from: "them", text: "Tell me more about Milo." },
    ],
  },
];

export function PhoneMockup() {
  const [active, setActive] = useState(0);
  const screen = SCREENS[active];

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Screen tabs */}
      <div className="flex gap-2 p-1 rounded-full" style={{ backgroundColor: "#EDE5D8" }}>
        {SCREENS.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              backgroundColor: active === i ? "#E8705A" : "transparent",
              color: active === i ? "white" : "#6B5651",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Phone frame */}
      <div
        className="relative w-[220px] h-[440px] rounded-[2.6rem] overflow-hidden flex flex-col animate-float"
        style={{
          backgroundColor: "#FDF4D2",
          border: "5px solid #2A1F1D",
          boxShadow: "0 32px 64px rgba(58,46,43,0.25), 0 8px 24px rgba(58,46,43,0.15)",
        }}
      >
        {/* Notch */}
        <div className="flex items-center justify-between px-4 pt-2.5 pb-1 shrink-0" style={{ backgroundColor: "#FDF4D2" }}>
          <span className="text-[9px] font-bold" style={{ color: "#3A2E2B" }}>9:41</span>
          <div className="w-16 h-3 rounded-full" style={{ backgroundColor: "#2A1F1D" }} />
          <div className="flex gap-1">
            <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: "#3A2E2B" }} />
            <div className="w-1.5 h-2 rounded-sm" style={{ backgroundColor: "#3A2E2B" }} />
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          {/* Discovery feed */}
          {active === 0 && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-2">
                <p className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Pet Discovery Feed</p>
                <div className="w-6 h-6 rounded-full flex items-center justify-center animate-pulse-ring" style={{ backgroundColor: "#E8705A" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
              </div>

              {/* Hero card */}
              <div className="mx-3 rounded-2xl overflow-hidden relative shrink-0" style={{ height: 130, backgroundColor: "#D6C7B2" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image src="/logo.jpg" alt="Milo" width={90} height={90} className="object-contain opacity-30" />
                </div>
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="text-[8px] font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: "#A3B18A" }}>Available</span>
                </div>
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "white" }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="#E8705A"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{ background: "linear-gradient(transparent,rgba(0,0,0,0.55))" }}>
                  <p className="text-xs font-bold text-white">Milo</p>
                  <p className="text-[9px] text-white/80">2 yrs · 3.5 km away</p>
                </div>
              </div>

              {/* Small grid */}
              <div className="grid grid-cols-2 gap-2 mx-3 mt-2">
                {screen.pets!.slice(1).map((p) => (
                  <div key={p.name} className="rounded-xl overflow-hidden relative" style={{ height: 75, backgroundColor: "#D6C7B2" }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image src="/logo.jpg" alt={p.name} width={40} height={40} className="object-contain opacity-25" />
                    </div>
                    <div className="absolute top-1 left-1">
                      <span className="text-[7px] font-bold text-white px-1.5 py-0.5 rounded-full" style={{ backgroundColor: p.statusColor }}>{p.status}</span>
                    </div>
                    <div className="absolute bottom-1 left-2">
                      <p className="text-[8px] font-semibold" style={{ color: "#3A2E2B" }}>{p.name}</p>
                      <p className="text-[7px]" style={{ color: "#6B5651" }}>{p.dist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detail screen */}
          {active === 1 && screen.detail && (
            <div className="flex flex-col px-4 py-2 gap-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B5651" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </div>
                <p className="text-[10px] font-semibold" style={{ color: "#6B5651" }}>Back</p>
              </div>
              <div className="rounded-2xl overflow-hidden relative" style={{ height: 110, backgroundColor: "#D6C7B2" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image src="/logo.jpg" alt="Luna" width={80} height={80} className="object-contain opacity-30" />
                </div>
              </div>
              <p className="text-sm font-bold mt-1" style={{ color: "#3A2E2B" }}>{screen.detail.name}</p>
              <p className="text-[10px]" style={{ color: "#6B5651" }}>{screen.detail.breed}</p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  { k: "Gender",     v: screen.detail.gender },
                  { k: "Breed",      v: screen.detail.breed },
                  { k: "Vaccinated", v: screen.detail.vaccinated },
                  { k: "Neutered",   v: screen.detail.neutered },
                ].map((r) => (
                  <div key={r.k} className="flex flex-col rounded-xl p-2" style={{ backgroundColor: "#EDE5D8" }}>
                    <p className="text-[8px]" style={{ color: "#6B5651" }}>{r.k}</p>
                    <p className="text-[9px] font-bold" style={{ color: "#3A2E2B" }}>{r.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 rounded-full py-2.5 text-center text-[10px] font-bold text-white" style={{ backgroundColor: "#E8705A" }}>
                Chat with Owner
              </div>
            </div>
          )}

          {/* Chat screen */}
          {active === 2 && screen.messages && (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: "#D6C7B2" }}>
                <div className="w-7 h-7 rounded-full" style={{ backgroundColor: "#D6C7B2" }} />
                <div>
                  <p className="text-[9px] font-bold" style={{ color: "#3A2E2B" }}>Luna's Owner</p>
                  <p className="text-[8px]" style={{ color: "#A3B18A" }}>Online</p>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-end gap-2 px-3 py-3">
                {screen.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                    <span
                      className="text-[8px] rounded-2xl px-2.5 py-1.5 max-w-[75%]"
                      style={{
                        backgroundColor: m.from === "me" ? "#E8705A" : "white",
                        color: m.from === "me" ? "white" : "#3A2E2B",
                        border: m.from === "them" ? "1px solid #D6C7B2" : "none",
                      }}
                    >
                      {m.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border-t" style={{ borderColor: "#D6C7B2" }}>
                <div className="flex-1 rounded-full px-3 py-1.5 text-[8px]" style={{ backgroundColor: "white", border: "1px solid #D6C7B2", color: "#6B5651" }}>
                  Type a message…
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "#E8705A" }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Home bar */}
        <div className="flex items-center justify-center py-1.5 shrink-0">
          <div className="w-24 h-1 rounded-full" style={{ backgroundColor: "#3A2E2B", opacity: 0.2 }} />
        </div>
      </div>
    </div>
  );
}
