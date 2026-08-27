"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { DownloadButton } from "@/components/download-button";
import { Navbar } from "@/components/navbar";

// ─── Live stat counter — animates from 0 to `end` when visible ───────────────
function LiveCounter({
  end,
  label,
  suffix = "",
}: {
  end: number | null;
  label: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref    = useRef<HTMLDivElement>(null);
  const ran    = useRef(false);

  useEffect(() => {
    if (end === null) return; // not loaded yet
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !ran.current) {
          ran.current = true;
          // If end is 0 just show 0 immediately
          if (end === 0) { setCount(0); observer.disconnect(); return; }
          const duration = Math.min(1400, 300 + end * 60); // scale duration to value
          const startTime = performance.now();
          const tick = (now: number) => {
            const p    = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(ease * end));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-center">
      {end === null ? (
        // Skeleton while loading
        <>
          <div className="h-8 w-16 rounded-lg mx-auto animate-pulse" style={{ backgroundColor: "rgba(232,112,90,0.15)" }} />
          <div className="h-3 w-20 rounded mx-auto mt-2 animate-pulse" style={{ backgroundColor: "rgba(107,86,81,0.12)" }} />
        </>
      ) : (
        <>
          <p className="text-2xl sm:text-3xl font-black" style={{ color: "#E8705A" }}>
            {count.toLocaleString()}{suffix}
          </p>
          <p className="text-xs mt-0.5 font-medium" style={{ color: "#6B5651" }}>{label}</p>
        </>
      )}
    </div>
  );
}

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── FAQ item ────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all"
      style={{ borderColor: open ? "#E8705A66" : "#D6C7B2", backgroundColor: open ? "#FFFBF5" : "#FFFFFF" }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left gap-4"
      >
        <span className="text-sm sm:text-base font-semibold" style={{ color: "#3A2E2B" }}>{q}</span>
        <span
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: open ? "#E8705A" : "#F5EFE6",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke={open ? "#fff" : "#9B8B84"} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-5 pt-0">
          <p className="text-sm leading-relaxed" style={{ color: "#6B5651" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Admin Banners Section ────────────────────────────────────────────────────
interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  bg_color: string;
  expires_at: string;
}

function BannersSection() {
  const [banners,  setBanners]  = useState<Banner[]>([]);
  const [current,  setCurrent]  = useState(0);
  const [paused,   setPaused]   = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [loaded,   setLoaded]   = useState(false);
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

  useEffect(() => {
    fetch(`${API}/banners`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Banner[]) => {
        const active = data.filter((b) => b.image_url && new Date(b.expires_at) > new Date());
        setBanners(active);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [API]);

  // Auto-advance every 3 s
  useEffect(() => {
    if (banners.length <= 1 || paused || lightbox) return;
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length, paused, lightbox]);

  // Lock scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  if (!loaded || banners.length === 0) return null;

  const banner = banners[current];

  const handleTap = (e: React.MouseEvent) => {
    e.preventDefault();
    if (banner.link_url) {
      fetch(`${API}/banners/${banner.id}/click`, { method: "POST" }).catch(() => {});
      window.open(banner.link_url, "_blank", "noopener,noreferrer");
    } else {
      setLightbox(true);
    }
  };

  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6" style={{ backgroundColor: "#FDF4D2" }}>
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "#E8705A" }}>
            Announcements
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-center text-2xl sm:text-3xl font-black mb-6" style={{ color: "#3A2E2B" }}>
            What&apos;s happening on Adoptly
          </h2>
        </Reveal>

        <Reveal delay={140}>
          {/* Carousel */}
          <div
            className="relative w-full overflow-hidden rounded-2xl cursor-pointer"
            style={{ aspectRatio: "16/6" }}
            onClick={handleTap}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
            role="button"
            tabIndex={0}
            aria-label={banner.link_url ? `Open ${banner.title}` : `View ${banner.title} full screen`}
            onKeyDown={(e) => { if (e.key === "Enter") handleTap(e as unknown as React.MouseEvent); }}
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
                  sizes="(max-width: 640px) 100vw, 768px"
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
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3" style={{ zIndex: 3 }}>
              <p className="text-white font-bold text-sm leading-snug drop-shadow line-clamp-1">
                {banner.title}
              </p>
              {banner.description && (
                <p className="text-white/75 text-xs mt-0.5 line-clamp-1 drop-shadow">
                  {banner.description}
                </p>
              )}
            </div>

            {/* Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-3 right-4 flex items-center gap-1" style={{ zIndex: 3 }}>
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                    className="rounded-full transition-all"
                    style={{
                      width:  i === current ? 18 : 5,
                      height: 5,
                      backgroundColor: i === current ? "#fff" : "rgba(255,255,255,0.45)",
                    }}
                    aria-label={`Banner ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Action pill */}
            <div
              className="absolute top-2.5 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm"
              style={{ backgroundColor: "rgba(0,0,0,0.48)", color: "#fff", zIndex: 3 }}
            >
              {banner.link_url ? (
                <>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Open
                </>
              ) : (
                <>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>
                  View
                </>
              )}
            </div>
          </div>
        </Reveal>

        {/* Lightbox */}
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
            <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-1 px-4">
              <p className="text-white font-semibold text-sm text-center drop-shadow">{banner.title}</p>
              {banner.description && (
                <p className="text-white/70 text-xs text-center">{banner.description}</p>
              )}
            </div>
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  // Real stats from backend — null = loading
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
      .catch(() => {
        // Fallback to zeros so the page still renders cleanly
        setStats({ petsListed: 0, adoptions: 0, citiesCovered: 0 });
      });
  }, []);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate send — wire to real email/API as needed
    setContactSent(true);
    setContactForm({ name: "", email: "", message: "" });
    setTimeout(() => setContactSent(false), 5000);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#FDF4D2" }}>
      <Navbar />

      {/* ════════════════════════════════════════════════════════════════
          #home — Hero
      ════════════════════════════════════════════════════════════════ */}
      <section
        id="home"
        className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16 overflow-hidden"
      >
        {/* Background blobs */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.07] pointer-events-none"
          style={{ backgroundColor: "#E8705A", filter: "blur(80px)" }}
        />
        <div
          className="absolute -bottom-40 -right-32 w-[460px] h-[460px] rounded-full opacity-[0.06] pointer-events-none"
          style={{ backgroundColor: "#7DC4B8", filter: "blur(80px)" }}
        />

        {/* Pill badge */}
        <Reveal delay={0}>
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 border"
            style={{ backgroundColor: "rgba(232,112,90,0.08)", borderColor: "rgba(232,112,90,0.25)", color: "#E8705A" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Now available across Metro Manila
          </div>
        </Reveal>

        {/* Headline */}
        <Reveal delay={80}>
          <h1 className="text-center max-w-3xl text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight">
            <span className="gradient-text">Find Your</span>
            <br />
            <span style={{ color: "#3A2E2B" }}>Purr-fect</span>
            <br />
            <span className="gradient-text">Companion</span>
          </h1>
        </Reveal>

        {/* Subtext */}
        <Reveal delay={160}>
          <p className="mt-6 text-center max-w-lg text-base sm:text-lg leading-relaxed px-2" style={{ color: "#6B5651" }}>
            Adoptly connects loving homes with pets in need. Browse verified listings,
            chat directly with owners, and give a pet the forever home they deserve.
          </p>
        </Reveal>

        {/* CTA row */}
        <Reveal delay={240}>
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white shadow-lg transition-all active:scale-95 hover:opacity-90"
              style={{ backgroundColor: "#E8705A", boxShadow: "0 4px 24px rgba(232,112,90,0.45)" }}
            >
              Get Started — it&apos;s free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold border-2 transition-all hover:bg-black/5"
              style={{ borderColor: "#D6C7B2", color: "#3A2E2B" }}
            >
              Sign in
            </Link>
          </div>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-4">
            <DownloadButton variant="hero" />
          </div>
        </Reveal>

        {/* Live stats — pulled from /stats endpoint */}
        <Reveal delay={380}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <LiveCounter end={stats?.petsListed ?? null}    label="Pets listed"      />
            <LiveCounter end={stats?.adoptions ?? null}      label="Adopted so far"   />
            <LiveCounter end={stats?.citiesCovered ?? null}  label="Cities covered"   />
          </div>
        </Reveal>


      </section>



      {/* ════════════════════════════════════════════════════════════════
          #about — About
      ════════════════════════════════════════════════════════════════ */}
      <section id="about" className="w-full py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">

          {/* Section label */}
          <Reveal>
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "#E8705A" }}>
              About Adoptly
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-center text-3xl sm:text-4xl font-black mb-5" style={{ color: "#3A2E2B" }}>
              We believe every pet deserves<br className="hidden sm:block" /> a loving home
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-center max-w-2xl mx-auto text-base leading-relaxed mb-16" style={{ color: "#6B5651" }}>
              Adoptly was built by animal lovers who wanted a better, safer way to connect rescue
              pets with the families who will cherish them. No middlemen, no fees — just direct
              connections that change lives.
            </p>
          </Reveal>

          {/* Cards grid */}
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                ),
                color: "#E8705A",
                title: "Compassion-first",
                desc: "Every decision we make puts the welfare of animals and adopters at the centre.",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                color: "#7DC4B8",
                title: "Verified listings",
                desc: "Every listing goes through a moderation layer so you can adopt with confidence.",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10A15.3 15.3 0 0 1 8 12a15.3 15.3 0 0 1 4-10z" />
                  </svg>
                ),
                color: "#E0A96D",
                title: "Local focus",
                desc: "We prioritise your neighbourhood so adoption meet-ups are never more than a short ride away.",
              },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 100}>
                <div
                  className="flex flex-col gap-4 rounded-3xl p-6 sm:p-7 border h-full transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{ borderColor: "#D6C7B2", backgroundColor: "#FFFFFF" }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${card.color}18`, color: card.color }}
                  >
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: "#3A2E2B" }}>{card.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B5651" }}>{card.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Team / story strip */}
          <Reveal delay={200} className="mt-14">
            <div
              className="rounded-3xl overflow-hidden grid md:grid-cols-2 border"
              style={{ borderColor: "#D6C7B2" }}
            >
              {/* Text side */}
              <div className="p-8 sm:p-10 flex flex-col justify-center gap-4" style={{ backgroundColor: "#FFFFFF" }}>
                <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "#E8705A" }}>The Project</p>
                <h3 className="text-2xl font-black" style={{ color: "#3A2E2B" }}>
                  Built by one person,<br />for every pet owner
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B5651" }}>
                  Adoptly is a solo project built from scratch by one developer with a
                  simple goal — make pet adoption in the Philippines easier, safer, and
                  more accessible for everyone. It is still early days, and every listing
                  and adoption on this platform is a step toward that vision.
                </p>
                <Link
                  href="/signup"
                  className="self-start mt-2 inline-flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70"
                  style={{ color: "#E8705A" }}
                >
                  Be part of it from the start
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              </div>
              {/* Colour side */}
              <div
                className="relative flex items-center justify-center p-10 min-h-[200px]"
                style={{ backgroundColor: "#FDF0EA" }}
              >
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #E8705A 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                <Image src="/logo.jpg" alt="Adoptly story" width={140} height={140} className="rounded-3xl shadow-xl object-cover relative z-10" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          #how-to-use — How to Use
      ════════════════════════════════════════════════════════════════ */}
      <section
        id="how-to-use"
        className="w-full py-20 sm:py-28 px-4 sm:px-6"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "#7DC4B8" }}>
              How it works
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-center text-3xl sm:text-4xl font-black mb-5" style={{ color: "#3A2E2B" }}>
              Adopt or rehome in three<br className="hidden sm:block" /> simple steps
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-center max-w-xl mx-auto text-base leading-relaxed mb-16" style={{ color: "#6B5651" }}>
              No complex forms. No waiting weeks. Just a clean, fast experience
              designed around how real people find pets.
            </p>
          </Reveal>

          {/* Steps */}
          <div className="flex flex-col gap-6">
            {[
              {
                step: "01",
                color: "#E8705A",
                bg: "#FDF0EA",
                title: "Create your free account",
                desc: "Sign up in under 60 seconds. Tell us your city so we can surface pets closest to you first. No credit card required.",
                action: "Sign up →",
                href: "/signup",
                visual: (
                  <div className="flex flex-col gap-2 w-full max-w-[200px]">
                    {["Full name", "City", "Email"].map(f => (
                      <div key={f} className="rounded-xl px-3 py-2 border text-xs font-medium" style={{ borderColor: "#E8705A44", backgroundColor: "#fff", color: "#9B8B84" }}>{f}</div>
                    ))}
                    <div className="rounded-xl px-3 py-2.5 text-xs font-bold text-white text-center mt-1" style={{ backgroundColor: "#E8705A" }}>Get Started</div>
                  </div>
                ),
              },
              {
                step: "02",
                color: "#7DC4B8",
                bg: "#EEF8F6",
                title: "Browse or list a pet",
                desc: "Adopters can filter by species, breed, age, and location. Owners post in minutes — add photos, describe your pet's personality, and go live instantly.",
                action: "Explore pets →",
                href: "/signup",
                visual: (
                  <div className="grid grid-cols-2 gap-2 w-full max-w-[200px]">
                    {[
                      { name: "Milo",  color: "#A3B18A" },
                      { name: "Luna",  color: "#E0A96D" },
                      { name: "Max",   color: "#A3B18A" },
                      { name: "Bella", color: "#A3B18A" },
                    ].map(p => (
                      <div key={p.name} className="rounded-xl overflow-hidden border" style={{ borderColor: "#D6C7B2" }}>
                        <div className="h-12 flex items-center justify-center" style={{ backgroundColor: "#EDE5D8" }}>
                          <Image src="/logo.jpg" alt={p.name} width={28} height={28} className="object-contain opacity-50" />
                        </div>
                        <div className="px-2 py-1.5">
                          <span className="block text-[8px] font-bold text-white px-1.5 py-0.5 rounded-full text-center mb-0.5" style={{ backgroundColor: p.color }}>Available</span>
                          <p className="text-[9px] font-semibold text-center" style={{ color: "#3A2E2B" }}>{p.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                step: "03",
                color: "#E0A96D",
                bg: "#FDF6EC",
                title: "Chat, meet, and adopt",
                desc: "Message the owner directly inside Adoptly. Arrange a meet-up, ask questions about the pet, and finalise the adoption — all in one place.",
                action: "Start chatting →",
                href: "/signup",
                visual: (
                  <div className="flex flex-col gap-2 w-full max-w-[200px]">
                    {[
                      { msg: "Hi! Is Milo still available?", own: false },
                      { msg: "Yes! He is friendly and vaccinated.", own: true },
                      { msg: "Can we meet this Saturday?", own: false },
                    ].map((m, i) => (
                      <div key={i} className={`flex ${m.own ? "justify-end" : "justify-start"}`}>
                        <div
                          className="px-3 py-2 text-[10px] leading-snug max-w-[80%]"
                          style={{
                            backgroundColor: m.own ? "#E0A96D" : "#fff",
                            color: m.own ? "#fff" : "#3A2E2B",
                            borderRadius: m.own ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                            border: m.own ? "none" : "1px solid #EDE5D8",
                          }}
                        >
                          {m.msg}
                        </div>
                      </div>
                    ))}
                  </div>
                ),
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 100}>
                <div
                  className={`rounded-3xl border overflow-hidden grid md:grid-cols-[1fr_auto] gap-0 transition-all hover:shadow-md`}
                  style={{ borderColor: "#D6C7B2", backgroundColor: "#FDFAF6" }}
                >
                  <div className="p-7 sm:p-8 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-black px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${item.color}18`, color: item.color }}
                      >
                        Step {item.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-black" style={{ color: "#3A2E2B" }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed max-w-md" style={{ color: "#6B5651" }}>{item.desc}</p>
                    <Link
                      href={item.href}
                      className="self-start mt-1 text-sm font-bold transition-opacity hover:opacity-70"
                      style={{ color: item.color }}
                    >
                      {item.action}
                    </Link>
                  </div>
                  <div
                    className="flex items-center justify-center p-6 sm:p-8 min-h-[160px]"
                    style={{ backgroundColor: item.bg }}
                  >
                    {item.visual}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          Feature highlights band
      ════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 px-4 sm:px-6" style={{ backgroundColor: "#FDF4D2" }}>
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-center text-2xl sm:text-3xl font-black mb-12" style={{ color: "#3A2E2B" }}>
              Everything you need, nothing you don&apos;t
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                label: "Smart Search",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
                color: "#E8705A",
              },
              {
                label: "Proximity Sort",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                color: "#7DC4B8",
              },
              {
                label: "In-app Chat",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                color: "#E0A96D",
              },
              {
                label: "Moderated Listings",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                color: "#A3B18A",
              },
              {
                label: "Save Favourites",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
                color: "#C96464",
              },
              {
                label: "Mobile Ready",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
                color: "#946D6D",
              },
            ].map((f, i) => (
              <Reveal key={f.label} delay={i * 60}>
                <div
                  className="flex flex-col items-center gap-3 rounded-2xl p-4 sm:p-5 border text-center transition-all hover:-translate-y-1 hover:shadow-md"
                  style={{ borderColor: "#D6C7B2", backgroundColor: "#FFFFFF" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${f.color}15`, color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <p className="text-xs font-bold" style={{ color: "#3A2E2B" }}>{f.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          Admin Banners / Announcements
      ════════════════════════════════════════════════════════════════ */}
      <BannersSection />

      {/* ════════════════════════════════════════════════════════════════
          CTA Banner
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="w-full py-16 sm:py-20 px-4 sm:px-6 text-center relative overflow-hidden"
        style={{ backgroundColor: "#E8705A" }}
      >
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-10" style={{ backgroundColor: "#fff" }} />
        <div className="absolute -bottom-16 -right-12 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: "#fff" }} />
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <Image src="/logo.jpg" alt="Adoptly" width={72} height={72} className="rounded-2xl border-4 border-white/30 mb-5 shadow-lg" style={{ width: 72, height: 72 }} />
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Ready to find your match?</h2>
          <p className="mb-8 text-base sm:text-lg text-white/80 max-w-md">
            Download the Adoptly app or use the web version — your perfect companion is waiting.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 sm:px-0">
            <DownloadButton variant="banner" />
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold border-2 border-white text-white hover:bg-white/10 transition-colors"
            >
              Use on Web
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          #faq — FAQ
      ════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="w-full py-20 sm:py-28 px-4 sm:px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "#E8705A" }}>FAQ</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-center text-3xl sm:text-4xl font-black mb-4" style={{ color: "#3A2E2B" }}>
              Frequently asked questions
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-center text-base leading-relaxed mb-12" style={{ color: "#6B5651" }}>
              Can't find an answer? Reach out through our{" "}
              <button
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                className="font-semibold hover:underline"
                style={{ color: "#E8705A" }}
              >
                contact form
              </button>.
            </p>
          </Reveal>

          <div className="flex flex-col gap-3">
            {[
              {
                q: "Is Adoptly free to use?",
                a: "Yes, completely free — for both adopters and owners. Creating an account, browsing listings, and chatting with owners costs nothing. We believe every pet deserves a home regardless of budget.",
              },
              {
                q: "How do I list my pet for adoption?",
                a: "Create a free account, go to My Pets, and tap \"Post a Pet\". Fill in your pet's details, upload photos, and your listing goes live instantly. You can update the status (Available → Pending → Adopted) at any time.",
              },
              {
                q: "Are the listings verified and safe?",
                a: "All listings are moderated by our team. Users can also report suspicious listings directly from the pet detail page. Accounts with repeated violations are blocked.",
              },
              {
                q: "Can I search for pets near me?",
                a: "Yes. When you sign up, you provide your city. The explore feed automatically sorts results by proximity so the nearest pets appear first. You can also manually search by any city name.",
              },
              {
                q: "What happens after I contact an owner?",
                a: "A private chat thread opens between you and the owner. Arrange a meet-up, ask health and vaccination questions, and when both parties agree, the owner marks the pet as Adopted.",
              },
              {
                q: "Is there a mobile app?",
                a: "A native Android app is in development. In the meantime, the web app is fully responsive and works great on any phone or tablet — just visit adoptly.com in your mobile browser.",
              },
              {
                q: "How do I report a problem?",
                a: "Open any pet listing, scroll to the bottom, and tap \"Report Suspicious Listing\". Our moderation team reviews every report within 24 hours.",
              },
            ].map((item) => (
              <Reveal key={item.q}>
                <FAQItem q={item.q} a={item.a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          #contact — Contact
      ════════════════════════════════════════════════════════════════ */}
      <section id="contact" className="w-full py-20 sm:py-28 px-4 sm:px-6" style={{ backgroundColor: "#FDF4D2" }}>
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "#E8705A" }}>Get in touch</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-center text-3xl sm:text-4xl font-black mb-4" style={{ color: "#3A2E2B" }}>
              We&apos;d love to hear from you
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-center max-w-lg mx-auto text-base leading-relaxed mb-14" style={{ color: "#6B5651" }}>
              Questions, feedback, partnership ideas — send us a message and we&apos;ll
              reply within one business day.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8 items-start">

            {/* Contact cards */}
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  ),
                  label: "Email us",
                  value: "adoptlysupport@gmail.com",
                  color: "#E8705A",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  label: "Location",
                  value: "Valenzuela City, Metro Manila, Philippines",
                  color: "#7DC4B8",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  ),
                  label: "Support hours",
                  value: "Mon – Sat · 9 AM – 6 PM PHT",
                  color: "#E0A96D",
                },
              ].map((c, i) => (
                <Reveal key={c.label} delay={i * 80}>
                  <div
                    className="flex items-start gap-4 rounded-2xl p-5 border"
                    style={{ borderColor: "#D6C7B2", backgroundColor: "#FFFFFF" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${c.color}15`, color: c.color }}
                    >
                      {c.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: "#9B8B84" }}>{c.label}</p>
                      <p className="text-sm font-semibold" style={{ color: "#3A2E2B" }}>{c.value}</p>
                    </div>
                  </div>
                </Reveal>
              ))}

              {/* Social row */}
              <Reveal delay={260}>
                <div className="flex gap-3 pt-1">
                  {[
                    { label: "Facebook",  color: "#1877F2", initial: "f" },
                    { label: "Instagram", color: "#E1306C", initial: "in" },
                    { label: "Twitter/X", color: "#000000", initial: "X" },
                  ].map((s) => (
                    <button
                      key={s.label}
                      aria-label={s.label}
                      className="w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold transition-all hover:scale-110"
                      style={{ borderColor: "#D6C7B2", color: s.color, backgroundColor: "#FFFFFF" }}
                    >
                      {s.initial}
                    </button>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Contact form */}
            <Reveal delay={120}>
              <form
                onSubmit={handleContact}
                className="rounded-3xl border p-6 sm:p-7 flex flex-col gap-4"
                style={{ borderColor: "#D6C7B2", backgroundColor: "#FFFFFF" }}
              >
                {contactSent && (
                  <div
                    className="rounded-xl p-3 text-sm font-semibold text-center"
                    style={{ backgroundColor: "#A3B18A22", color: "#3A6020" }}
                  >
                    Message sent — we will be in touch soon.
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Juan dela Cruz"
                      value={contactForm.name}
                      onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-orange-400 transition-colors"
                      style={{ borderColor: "#D6C7B2" }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Email</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={contactForm.email}
                      onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-orange-400 transition-colors"
                      style={{ borderColor: "#D6C7B2" }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold" style={{ color: "#3A2E2B" }}>Message</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us how we can help…"
                    value={contactForm.message}
                    onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none focus:border-orange-400 transition-colors"
                    style={{ borderColor: "#D6C7B2" }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: "#E8705A", boxShadow: "0 3px 16px rgba(232,112,90,0.35)" }}
                >
                  Send Message
                </button>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          Footer
      ════════════════════════════════════════════════════════════════ */}
      <footer
        className="w-full border-t"
        style={{ borderColor: "#D6C7B2", backgroundColor: "#3A2E2B" }}
      >
        {/* Main footer grid */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.jpg" alt="Adoptly" width={38} height={38} className="rounded-xl object-cover" style={{ width: 38, height: 38 }} />
              <span className="text-xl font-bold" style={{ color: "#FDF4D2" }}>Adoptly</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#9B8B84" }}>
              Connecting loving homes with pets in need across the Philippines.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6B5651" }}>Navigate</p>
            {[
              { label: "Home",       href: "#home"       },
              { label: "About",      href: "#about"      },
              { label: "How to Use", href: "#how-to-use" },
              { label: "FAQ",        href: "#faq"        },
              { label: "Contact",    href: "#contact"    },
            ].map(l => (
              <button
                key={l.href}
                onClick={() => document.querySelector(l.href)?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm text-left transition-opacity hover:opacity-70"
                style={{ color: "#C0A898" }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Account */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6B5651" }}>Account</p>
            {[
              { label: "Sign up",   href: "/signup" },
              { label: "Log in",    href: "/login"  },
              { label: "Dashboard", href: "/dashboard" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="text-sm transition-opacity hover:opacity-70" style={{ color: "#C0A898" }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6B5651" }}>Legal</p>
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Use",   href: "/terms"   },
              { label: "Cookie Policy",  href: "/cookies" },
            ].map(l => (
              <Link key={l.label} href={l.href} className="text-sm transition-opacity hover:opacity-70" style={{ color: "#C0A898" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t px-4 sm:px-6 py-5"
          style={{ borderColor: "#4A3E3A" }}
        >
          <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: "#6B5651" }}>
              © {new Date().getFullYear()} Adoptly. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: "#6B5651" }}>
              Built for pets and the people who love them.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
