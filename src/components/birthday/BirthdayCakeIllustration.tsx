import React from "react";

interface BirthdayCakeProps {
  className?: string;
  size?: number;
}

export default function BirthdayCakeIllustration({
  className = "w-10 h-10",
  size = 40,
}: BirthdayCakeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Soft Glow behind flame */}
      <circle cx="32" cy="13" r="8" fill="#FF5C28" fillOpacity="0.18" />

      {/* Plate / Pedestal (SiBS Navy with subtle highlight) */}
      <ellipse cx="32" cy="56" rx="26" ry="4.5" fill="#042C51" />
      <ellipse cx="32" cy="55" rx="24" ry="3.5" fill="#0A3C6B" />

      {/* Cake Bottom Layer (Warm Cream / Off-white base) */}
      <path
        d="M13 41.5C13 41.5 13 49 13 49.5C13 54 21.5 54.5 32 54.5C42.5 54.5 51 54 51 49.5C51 49 51 41.5 51 41.5L13 41.5Z"
        fill="#F4EADB"
      />
      {/* Bottom layer shading */}
      <path
        d="M44 41.5C48 43 51 46.5 51 49.5C51 54 42.5 54.5 32 54.5C28 54.5 24.5 54.3 21.5 54C34 54 45 50 44 41.5Z"
        fill="#E8DAC5"
      />

      {/* Middle Filling / Cream Stripe (SiBS Navy subtle accent ribbon) */}
      <path
        d="M13 41.5C18 43 25 43.8 32 43.8C39 43.8 46 43 51 41.5L51 44C46 45.5 39 46.3 32 46.3C25 46.3 18 45.5 13 44L13 41.5Z"
        fill="#042C51"
      />

      {/* Cake Top Tier / Base (Warm Soft White) */}
      <path
        d="M16 29C16 29 16 39 16 39.5C16 43 23 43.8 32 43.8C41 43.8 48 43 48 39.5C48 39 48 29 48 29L16 29Z"
        fill="#FCF9F2"
      />
      {/* Top Tier shading */}
      <path
        d="M42 29C45 30.5 48 34.5 48 39.5C48 43 41 43.8 32 43.8C28 43.8 24.5 43.6 22 43.3C33 43.3 43 39 42 29Z"
        fill="#E8DAC5"
      />

      {/* Cake Top Surface (Ellipse) */}
      <ellipse cx="32" cy="29" rx="16" ry="4.5" fill="#FFFFFF" />

      {/* Decorative Icing Drips (Scalloped frosting with subtle SiBS orange accents) */}
      <path
        d="M16 29C16 32 18.5 34 20 32C21.5 30 23 34 25 34C27 34 28.5 31.5 30 31.5C31.5 31.5 33 34.5 35 34.5C37 34.5 38.5 31 40 31C41.5 31 43 33.5 45 33C47 32.5 48 29 48 29L16 29Z"
        fill="#FFFDF7"
      />

      {/* Tiny celebratory sprinkles on cake top */}
      <circle cx="25" cy="28.5" r="1" fill="#FF5C28" />
      <circle cx="32" cy="30.5" r="1" fill="#D4AF37" />
      <circle cx="39" cy="28.5" r="1" fill="#1A9882" />
      <circle cx="28" cy="27.5" r="0.8" fill="#2E63B8" />
      <circle cx="36" cy="27.5" r="0.8" fill="#FF5C28" />

      {/* Elegant Candle (Single sleek candle with diagonal stripe) */}
      <rect x="30.5" y="16" width="3" height="11" rx="1.5" fill="#FFFFFF" />
      {/* Candle Stripe (SiBS Orange) */}
      <path d="M30.5 20L33.5 18V19.5L30.5 21.5V20Z" fill="#FF5C28" />
      <path d="M30.5 24L33.5 22V23.5L30.5 25.5V24Z" fill="#042C51" />

      {/* Candle Wick */}
      <line x1="32" y1="16" x2="32" y2="13.5" stroke="#333333" strokeWidth="1" strokeLinecap="round" />

      {/* Flame (Outer Warm Gold & Inner Bright Orange/White) */}
      <path
        d="M32 6.5C32 6.5 35 10 35 12.5C35 14.1569 33.6569 15.5 32 15.5C30.3431 15.5 29 14.1569 29 12.5C29 10 32 6.5 32 6.5Z"
        fill="#FF5C28"
      />
      <path
        d="M32 9C32 9 33.8 11.2 33.8 12.8C33.8 13.7941 32.9941 14.6 32 14.6C31.0059 14.6 30.2 13.7941 30.2 12.8C30.2 11.2 32 9 32 9Z"
        fill="#FFD233"
      />
      <circle cx="32" cy="13" r="1" fill="#FFFFFF" />

      {/* Tiny Sparkle Star Accent */}
      <path
        d="M46 16L47 19L50 20L47 21L46 24L45 21L42 20L45 19L46 16Z"
        fill="#FF5C28"
        fillOpacity="0.85"
      />
      <path
        d="M17 21L17.8 23.2L20 24L17.8 24.8L17 27L16.2 24.8L14 24L16.2 23.2L17 21Z"
        fill="#D4AF37"
        fillOpacity="0.85"
      />
    </svg>
  );
}
