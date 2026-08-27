"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Real stats
  const [stats, setStats] = useState<{
    petsListed: number;
    adoptions: number;
    citiesCovered: number;
  } | null>(null);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
    fetch(`${API}/stats`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setStats)
      .catch(() => setStats({ petsListed: 0, adoptions: 0, citiesCovered: 0 }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profiles/me`,
        { headers: { Authorization: `Bearer ${data.session?.access_token}` } }
      );
      if (!response.ok) throw new Error("Failed to load user profile");
      const profile = await response.json();
      router.push(profile.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row" style={{ backgroundColor: "#FDF4D2" }}>

      {/* ── Left branding panel (desktop only) ────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 relative overflow-hidden shrink-0"
        style={{ backgroundColor: "#E8705A" }}
      >
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20" style={{ backgroundColor: "white" }} />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: "white" }} />

        <Image
          src="/logo.jpg"
          alt="Adoptly"
          width={220}
          height={220}
          className="object-contain mb-8 relative z-10"
          priority
        />
        <h1 className="text-4xl font-bold text-white text-center mb-3 relative z-10">
          Welcome back
        </h1>
        <p className="text-white/80 text-center text-lg leading-relaxed max-w-sm relative z-10">
          Sign in to continue finding your companion.
        </p>

        {/* Real stats from backend */}
        <div className="mt-12 flex gap-8 relative z-10">
          {stats === null ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-7 w-12 rounded-lg mx-auto animate-pulse bg-white/20" />
                <div className="h-3 w-16 rounded mx-auto mt-2 animate-pulse bg-white/15" />
              </div>
            ))
          ) : (
            [
              { value: stats.petsListed,    label: "Pets listed"  },
              { value: stats.adoptions,     label: "Adopted"      },
              { value: stats.citiesCovered, label: "Cities"       },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value.toLocaleString()}</p>
                <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:px-8 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-6 flex flex-col items-center">
          <Image src="/logo.jpg" alt="Adoptly" width={72} height={72} className="rounded-2xl object-contain mb-2" style={{ width: 72, height: 72 }} />
          <p className="font-bold text-xl" style={{ color: "#E8705A" }}>Adoptly</p>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-1" style={{ color: "#3A2E2B" }}>Sign in</h2>
          <p className="text-sm mb-7" style={{ color: "#6B5651" }}>
            New here?{" "}
            <Link href="/signup" className="font-semibold hover:underline" style={{ color: "#E8705A" }}>
              Create an account
            </Link>
          </p>

          {errorMsg && (
            <div className="p-3 text-sm rounded-xl mb-4 text-center font-medium" style={{ backgroundColor: "#FCE8E6", color: "#C53929" }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "#3A2E2B" }}>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                disabled={loading}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm border outline-none transition-all"
                style={{ borderColor: "#D6C7B2", backgroundColor: "white", color: "#3A2E2B" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: "#3A2E2B" }}>Password</label>
                <Link href="#" className="text-xs hover:underline" style={{ color: "#E8705A" }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="Password"
                required
                disabled={loading}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm border outline-none transition-all"
                style={{ borderColor: "#D6C7B2", backgroundColor: "white", color: "#3A2E2B" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3.5 text-sm font-semibold text-white mt-1 transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: "#E8705A" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: "#D6C7B2" }} />
            <span className="text-xs" style={{ color: "#6B5651" }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#D6C7B2" }} />
          </div>

          <p className="text-center text-xs" style={{ color: "#6B5651" }}>
            By signing in you agree to our{" "}
            <Link href="#" className="underline">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
