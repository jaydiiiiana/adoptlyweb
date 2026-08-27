"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Home",       href: "#home"       },
  { label: "About",      href: "#about"      },
  { label: "How to Use", href: "#how-to-use" },
  { label: "Contact",    href: "#contact"    },
  { label: "FAQ",        href: "#faq"        },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active,   setActive]   = useState("#home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy
  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleNav = (href: string) => {
    const el = document.querySelector(href);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(253,244,210,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(214,199,178,0.55)" : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 32px rgba(58,46,43,0.07)" : "none",
      }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-3 flex items-center justify-between">

        {/* Brand */}
        <button onClick={() => handleNav("#home")} className="flex items-center gap-2.5 group shrink-0">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"
              style={{ backgroundColor: "#E8705A" }}
            />
            <Image
              src="/logo.jpg"
              alt="Adoptly"
              width={36}
              height={36}
              className="rounded-xl object-cover relative z-10 transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: "#E8705A" }}>
            Adoptly
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((item) => {
            const isActive = active === item.href;
            return (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                className="relative px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-black/5"
                style={{ color: isActive ? "#E8705A" : "#3A2E2B" }}
              >
                {item.label}
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: "#E8705A",
                    width: isActive ? "1rem" : "0px",
                  }}
                />
              </button>
            );
          })}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-black/5"
            style={{ color: "#3A2E2B" }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#E8705A", boxShadow: "0 2px 14px rgba(232,112,90,0.38)" }}
          >
            Sign up free
          </Link>
        </div>

        {/* Mobile: show Log in + Sign up inline instead of a hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:bg-black/5"
            style={{ color: "#3A2E2B" }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-1.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#E8705A" }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}

// Kept for any legacy import
export function MobileNav() { return null; }
