"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    street: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            street_address: form.street,
            city: form.city,
            postal_code: form.postalCode || null,
            phone: form.phone || null,
          }
        }
      });

      if (error) throw error;

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row" style={{ backgroundColor: "#FDF4D2" }}>
      {/* Left panel – branding (desktop only) */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 relative overflow-hidden shrink-0"
        style={{ backgroundColor: "#7DC4B8" }}
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
          Join Adoptly
        </h1>
        <p className="text-white/80 text-center text-lg leading-relaxed max-w-sm relative z-10">
          Create your free account and start finding or listing pets for adoption today.
        </p>

        <div className="mt-12 flex flex-col gap-4 w-full max-w-xs relative z-10 text-white">
          {[
            "Browse hundreds of verified pet listings",
            "Chat directly with pet owners",
            "Post your own pet for adoption",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-white/95 text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel – form; scrollable on small screens */}
      <div className="flex-1 flex flex-col items-center justify-start lg:justify-center px-4 py-8 sm:px-8 overflow-y-auto">
        {/* Mobile/tablet logo */}
        <div className="lg:hidden mb-6 flex flex-col items-center">
          <Image src="/logo.jpg" alt="Adoptly" width={72} height={72} className="rounded-2xl object-contain mb-2" style={{ width: 72, height: 72 }} />
          <p className="font-bold text-xl" style={{ color: "#E8705A" }}>Adoptly</p>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-1" style={{ color: "#3A2E2B" }}>Create account</h2>
          <p className="text-sm mb-6" style={{ color: "#6B5651" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "#E8705A" }}>
              Sign in
            </Link>
          </p>

          {errorMsg && (
            <div className="p-3 text-sm rounded-xl mb-4 text-center font-medium" style={{ backgroundColor: "#FCE8E6", color: "#C53929" }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "#3A2E2B" }}>
                Full name <span style={{ color: "#E8705A" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Juan dela Cruz"
                required
                disabled={loading}
                value={form.fullName}
                onChange={(e) => update("fullName")(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
                style={{ borderColor: "#D6C7B2", backgroundColor: "white", color: "#3A2E2B" }}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "#3A2E2B" }}>
                Email address <span style={{ color: "#E8705A" }}>*</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                disabled={loading}
                value={form.email}
                onChange={(e) => update("email")(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
                style={{ borderColor: "#D6C7B2", backgroundColor: "white", color: "#3A2E2B" }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "#3A2E2B" }}>
                Password <span style={{ color: "#E8705A" }}>*</span>
              </label>
              <input
                type="password"
                placeholder="At least 8 characters"
                required
                minLength={8}
                disabled={loading}
                value={form.password}
                onChange={(e) => update("password")(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
                style={{ borderColor: "#D6C7B2", backgroundColor: "white", color: "#3A2E2B" }}
              />
            </div>

            {/* Street address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "#3A2E2B" }}>
                Street address <span style={{ color: "#E8705A" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="123 Sampaguita St."
                required
                disabled={loading}
                value={form.street}
                onChange={(e) => update("street")(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
                style={{ borderColor: "#D6C7B2", backgroundColor: "white", color: "#3A2E2B" }}
              />
            </div>

            {/* City + Postal — stacked on tiny screens, side-by-side on sm+ */}
            <div className="flex flex-col xs:flex-row gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-medium" style={{ color: "#3A2E2B" }}>
                  City <span style={{ color: "#E8705A" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Manila"
                  required
                  disabled={loading}
                  value={form.city}
                  onChange={(e) => update("city")(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
                  style={{ borderColor: "#D6C7B2", backgroundColor: "white", color: "#3A2E2B" }}
                />
              </div>
              <div className="flex flex-col gap-1.5 xs:w-28">
                <label className="text-sm font-medium" style={{ color: "#3A2E2B" }}>
                  Postal code
                </label>
                <input
                  type="text"
                  placeholder="1000"
                  disabled={loading}
                  value={form.postalCode}
                  onChange={(e) => update("postalCode")(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
                  style={{ borderColor: "#D6C7B2", backgroundColor: "white", color: "#3A2E2B" }}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "#3A2E2B" }}>
                Phone <span className="text-xs font-normal" style={{ color: "#6B5651" }}>(optional)</span>
              </label>
              <input
                type="tel"
                placeholder="+63 912 345 6789"
                disabled={loading}
                value={form.phone}
                onChange={(e) => update("phone")(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
                style={{ borderColor: "#D6C7B2", backgroundColor: "white", color: "#3A2E2B" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3.5 text-sm font-semibold text-white mt-1 transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: "#E8705A" }}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-5 mb-6 text-center text-xs" style={{ color: "#6B5651" }}>
            By signing up you agree to our{" "}
            <Link href="#" className="underline">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
