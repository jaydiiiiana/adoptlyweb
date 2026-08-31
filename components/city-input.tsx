"use client";

import React, { useState, useRef, useEffect } from "react";
import { PH_LOCATIONS_SORTED } from "@/data/ph-locations";

interface CityInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function CityInput({ value, onChange, disabled, required }: CityInputProps) {
  const [query, setQuery]       = useState(value);
  const [open, setOpen]         = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef            = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);
  const listRef                 = useRef<HTMLUListElement>(null);

  const filtered = query.trim().length === 0
    ? []
    : PH_LOCATIONS_SORTED.filter((loc) =>
        loc.toLowerCase().includes(query.trim().toLowerCase())
      ).slice(0, 10);

  // Sync external value → internal query when value is reset
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[highlighted] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const select = (loc: string) => {
    setQuery(loc);
    onChange(loc);
    setOpen(false);
    setHighlighted(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) select(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(""); // clear valid selection while typing
    setHighlighted(0);
    setOpen(val.trim().length > 0);
  };

  const isValid = PH_LOCATIONS_SORTED.includes(value);

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        placeholder="Type to search city or municipality…"
        required={required}
        disabled={disabled}
        value={query}
        onChange={handleChange}
        onFocus={() => { if (query.trim()) setOpen(true); }}
        onKeyDown={handleKeyDown}
        // HTML5 validation — only submit if a valid PH location is selected
        onInvalid={(e) => {
          (e.target as HTMLInputElement).setCustomValidity(
            "Please select a valid city or municipality from the list."
          );
        }}
        onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
        className="w-full rounded-xl px-4 py-3 text-sm border outline-none transition-colors"
        style={{
          borderColor: open ? "#E8705A" : isValid ? "#A3B18A" : "#D6C7B2",
          backgroundColor: "white",
          color: "#3A2E2B",
        }}
      />

      {/* Valid indicator */}
      {isValid && !open && (
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold"
          style={{ color: "#A3B18A" }}
        >
          ✓
        </span>
      )}

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 rounded-xl border shadow-lg overflow-y-auto"
          style={{
            borderColor: "#D6C7B2",
            backgroundColor: "white",
            maxHeight: 220,
          }}
        >
          {filtered.map((loc, i) => (
            <li
              key={loc}
              onMouseDown={() => select(loc)}
              onMouseEnter={() => setHighlighted(i)}
              className="px-4 py-2.5 text-sm cursor-pointer transition-colors"
              style={{
                backgroundColor: i === highlighted ? "#FEF3F0" : "white",
                color: "#3A2E2B",
                fontWeight: i === highlighted ? 600 : 400,
              }}
            >
              {/* Highlight matching substring */}
              {(() => {
                const idx = loc.toLowerCase().indexOf(query.trim().toLowerCase());
                if (idx === -1) return loc;
                return (
                  <>
                    {loc.slice(0, idx)}
                    <span style={{ color: "#E8705A", fontWeight: 700 }}>
                      {loc.slice(idx, idx + query.trim().length)}
                    </span>
                    {loc.slice(idx + query.trim().length)}
                  </>
                );
              })()}
            </li>
          ))}
        </ul>
      )}

      {/* No results */}
      {open && query.trim().length > 0 && filtered.length === 0 && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: "#D6C7B2", backgroundColor: "white", color: "#9B8B84" }}
        >
          No matching city or municipality found.
        </div>
      )}
    </div>
  );
}
