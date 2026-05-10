"use client";

import { useEffect, useRef } from "react";
import { safeTo } from "@/lib/gsap";

interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  color?: string;
}

export function ProgressRing({
  value,
  size = 132,
  stroke = 3,
  label = "Progreso",
  color = "var(--cobalt)",
}: ProgressRingProps) {
  const radius = (size - stroke * 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const circleRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    if (!circleRef.current) return;
    safeTo(circleRef.current, {
      strokeDashoffset: offset,
      duration: 1.1,
      ease: "power3.out",
    });
  }, [offset]);

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--hairline)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="micro text-[9px]">{label}</div>
          <div className="font-serif text-3xl font-medium leading-none mt-1">
            {value}
            <span className="font-mono text-sm font-normal">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
