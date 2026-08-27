"use client";

import { useEffect, useRef, useState } from "react";

interface StatCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  label: string;
}

export function StatCounter({ end, suffix = "", prefix = "", duration = 1800, label }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * end));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <span className="text-4xl font-bold" style={{ color: "#E8705A" }}>
        {prefix}{count.toLocaleString()}{suffix}
      </span>
      <span className="text-sm font-medium" style={{ color: "#6B5651" }}>{label}</span>
    </div>
  );
}
