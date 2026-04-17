"use client";

const RADIUS = 48;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function HoldRing({ progress }) {
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = CIRCUMFERENCE * (1 - clamped);

  return (
    <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
      <circle
        cx="60"
        cy="60"
        r={RADIUS}
        fill="none"
        stroke="rgba(27, 33, 48, 0.14)"
        strokeWidth={STROKE}
      />
      <circle
        cx="60"
        cy="60"
        r={RADIUS}
        fill="none"
        stroke="var(--accent-2)"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
      />
    </svg>
  );
}
