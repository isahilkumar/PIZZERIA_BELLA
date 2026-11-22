import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, ShieldCheck, Award, ChevronRight } from 'lucide-react';

/**
 * World-Class Handcrafted Vector Emblem for Pizzeria Bella Napoli
 * Masterfully sculpted on a 100x100 coordinate grid with Neapolitan sourdough
 * leopard char, San Marzano pomodoro, melted Fior di Latte mozzarella cheese pull,
 * artisanal pepperoni, Genovese basil, rising stone hearth flames, and polished Italian gold rims.
 */
export function PizzaLogoIcon({ size, className = '' }) {
  const hasDimensionClass = className.includes('w-') || className.includes('h-');
  const resolvedSize = hasDimensionClass ? undefined : (size || 48);

  return (
    <svg
      width={resolvedSize}
      height={resolvedSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_4px_16px_rgba(249,115,22,0.45)] transition-transform duration-300 ${className}`}
    >
      <defs>
        {/* Luxury Terracotta & Ember Crimson Base */}
        <radialGradient id="bellaBadgeBg" cx="42%" cy="36%" r="65%" fx="42%" fy="36%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="38%" stopColor="#dc2626" />
          <stop offset="75%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>

        {/* Polished Metallic Italian Gold Rim */}
        <linearGradient id="goldBevelRim" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="75%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>

        {/* Inner Gold Specular Highlight */}
        <linearGradient id="goldGlint" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#fef08a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
        </linearGradient>

        {/* Sourdough Leopard-Spotted Cornicione */}
        <linearGradient id="crustLeopard" x1="20" y1="20" x2="80" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="35%" stopColor="#fbbf24" />
          <stop offset="70%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        {/* San Marzano Rich Tomato Base */}
        <radialGradient id="sauceGlow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="70%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>

        {/* Creamy Fior di Latte Mozzarella Melt */}
        <linearGradient id="cheeseMelt" x1="50" y1="38" x2="50" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#fef9c3" />
          <stop offset="85%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>

        {/* Artisan Pepperoni / Charred Salumi */}
        <radialGradient id="pepperoniGrad" cx="38%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>

        {/* Genovese Emerald Basil */}
        <linearGradient id="basilGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        {/* Rising Wood-Fired Hearth Flame */}
        <linearGradient id="hearthFlame" x1="50" y1="44" x2="50" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="40%" stopColor="#ea580c" />
          <stop offset="75%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>

        {/* Soft Drop Shadow Filter for Slice */}
        <filter id="sliceShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* ── 1. Outer Ceramic Squircle Crest ── */}
      <rect x="3" y="3" width="94" height="94" rx="28" fill="url(#bellaBadgeBg)" />
      <rect x="3" y="3" width="94" height="94" rx="28" stroke="url(#goldBevelRim)" strokeWidth="2.8" strokeLinecap="round" />
      <rect x="7" y="7" width="86" height="86" rx="24" stroke="url(#goldGlint)" strokeWidth="1.2" strokeDasharray="3 2" />

      {/* ── 2. Radiant Stone Oven Heat Arc ── */}
      <path
        d="M 18 72 A 38 38 0 0 1 82 72"
        stroke="rgba(254, 240, 138, 0.28)"
        strokeWidth="1.8"
        strokeDasharray="2 3"
        fill="none"
      />

      {/* ── 3. Dancing Wood-Fired Hearth Flame (Behind Slice) ── */}
      <path
        d="M 50 8 C 58 19 67 26 63 37 C 60 45 52 48 45 46 C 40 44 38 38 41 33 C 44 28 48 22 50 8 Z"
        fill="url(#hearthFlame)"
        opacity="0.95"
      />
      {/* White-Hot Flame Core */}
      <path
        d="M 50 17 C 54 23 58 28 56 34 C 54 38 49 40 45 38 C 42 36 41 32 43 28 Z"
        fill="#ffffff"
        opacity="0.85"
      />

      {/* ── 4. The Artisanal Pizza Slice (Hero) ── */}
      <g filter="url(#sliceShadow)">
        {/* San Marzano Rich Tomato Base */}
        <path
          d="M 25 39 Q 50 29 75 39 L 50 83 Z"
          fill="url(#sauceGlow)"
          stroke="#991b1b"
          strokeWidth="0.8"
        />

        {/* Golden-Brown Sourdough Crust (Cornicione) */}
        <path
          d="M 22 34 Q 50 20 78 34 C 82 38 80 43 75 43 Q 50 30 25 43 C 20 43 18 38 22 34 Z"
          fill="url(#crustLeopard)"
          stroke="#92400e"
          strokeWidth="0.8"
        />
        {/* Authentic Neapolitan Leopard Char Spots */}
        <circle cx="33" cy="32" r="2.2" fill="#3f1a04" opacity="0.9" />
        <circle cx="49" cy="27" r="2.6" fill="#381503" opacity="0.95" />
        <circle cx="65" cy="31" r="2.0" fill="#3f1a04" opacity="0.9" />
        <circle cx="41" cy="29" r="1.5" fill="#2d1302" opacity="0.85" />
        <circle cx="58" cy="29" r="1.7" fill="#2d1302" opacity="0.85" />

        {/* Melted Fior di Latte Mozzarella Layer with Organic Cheese Pull */}
        <path
          d="M 28 41 Q 38 48 44 42 Q 52 50 58 43 Q 66 49 72 41 L 52 79 Q 50 86 48 79 Z"
          fill="url(#cheeseMelt)"
        />

        {/* Gourmet Pepperoni / Salumi Slices */}
        {/* Top-Left Pepperoni */}
        <circle cx="39" cy="50" r="5.5" fill="url(#pepperoniGrad)" stroke="#7f1d1d" strokeWidth="0.7" />
        <path d="M 36 48 A 3.5 3.5 0 0 1 42 48" stroke="#fca5a5" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.85" />

        {/* Top-Right Pepperoni */}
        <circle cx="61" cy="51" r="5" fill="url(#pepperoniGrad)" stroke="#7f1d1d" strokeWidth="0.7" />
        <path d="M 58 49 A 3 3 0 0 1 64 49" stroke="#fca5a5" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.85" />

        {/* Lower Pepperoni */}
        <circle cx="50" cy="65" r="4.5" fill="url(#pepperoniGrad)" stroke="#7f1d1d" strokeWidth="0.7" />
        <path d="M 47.5 63.5 A 2.5 2.5 0 0 1 52.5 63.5" stroke="#fca5a5" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.85" />

        {/* Fresh Italian Genovese Basil Leaves */}
        <path
          d="M 48 55 C 44 51 47 45 52 47 C 55 50 53 57 48 55 Z"
          fill="url(#basilGrad)"
        />
        <path d="M 49 54 Q 50 51 51 48" stroke="#bbf7d0" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />

        <path
          d="M 64 58 C 62 54 66 50 70 52 C 72 55 69 61 64 58 Z"
          fill="url(#basilGrad)"
        />
        <path d="M 65 57 Q 67 54 69 53" stroke="#bbf7d0" strokeWidth="0.7" strokeLinecap="round" opacity="0.9" />

        {/* Herb Seasoning Flecks */}
        <circle cx="34" cy="46" r="0.8" fill="#15803d" />
        <circle cx="54" cy="59" r="0.7" fill="#fef08a" />
        <circle cx="46" cy="73" r="0.6" fill="#fef08a" />
        <circle cx="53" cy="74" r="0.6" fill="#dc2626" />
      </g>

      {/* ── 5. Three Polished Heritage Gold Stars ── */}
      <g fill="url(#goldBevelRim)">
        {/* Left Star */}
        <polygon
          points="38,88 39.2,90.6 42,91 40,92.8 40.5,95.5 38,94.2 35.5,95.5 36,92.8 34,91 36.8,90.6"
          transform="scale(0.85) translate(6, 12)"
        />
        {/* Center Star (Hero) */}
        <polygon
          points="50,87.5 51.4,90.4 54.5,90.9 52.2,93 52.8,96 50,94.5 47.2,96 47.8,93 45.5,90.9 48.6,90.4"
          transform="scale(0.95) translate(2.5, 4)"
        />
        {/* Right Star */}
        <polygon
          points="62,88 63.2,90.6 66,91 64,92.8 64.5,95.5 62,94.2 59.5,95.5 60,92.8 58,91 60.8,90.6"
          transform="scale(0.85) translate(11, 12)"
        />
      </g>
    </svg>
  );
}

// Advanced rotating live telemetry items
const TELEMETRY_ITEMS = [
  { label: '900°F Stone Oven', sub: 'Beechwood Fired', icon: Flame, color: 'text-amber-400' },
  { label: 'Napoli D.O.P.', sub: 'San Marzano Heritage', icon: Award, color: 'text-rose-400' },
  { label: '48h Sourdough', sub: 'Wild Fermentation', icon: Sparkles, color: 'text-emerald-400' },
];

/**
 * Elevated Luxury Brand Lockup with Advanced Live Telemetry Features
 */
export default function BrandLogo({ isOverDark = false, className = '' }) {
  const [telemetryIndex, setTelemetryIndex] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  // Auto-cycle live telemetry every 4.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryIndex((prev) => (prev + 1) % TELEMETRY_ITEMS.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const currentTelemetry = TELEMETRY_ITEMS[telemetryIndex];
  const TelemetryIcon = currentTelemetry.icon;

  return (
    <div
      className={`relative inline-flex items-center gap-3.5 group cursor-pointer select-none ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Link to="/" className="flex items-center gap-3.5">
        {/* ── Brand Emblem with Live Oven Beacon ── */}
        <div className="relative">
          <div className="group-hover:scale-108 group-hover:rotate-2 group-hover:shadow-[0_0_24px_rgba(249,115,22,0.6)] transition-all duration-300 rounded-[1.2rem] overflow-hidden">
            <PizzaLogoIcon size={46} />
          </div>

          {/* Live Oven Telemetry Pulsing Dot */}
          <span
            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-300 rounded-full border-2 border-white shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse"
            title="900°F Stone Oven Active"
          />
        </div>

        {/* ── Brand Typography Lockup ── */}
        <div className="flex flex-col">
          {/* Main Title Row */}
          <div className="flex items-center gap-2">
            <span
              className={`font-serif font-black text-2xl sm:text-[1.65rem] tracking-tight leading-none drop-shadow-sm transition-all duration-300 ${
                isOverDark
                  ? 'bg-gradient-to-r from-white via-amber-200 to-orange-300 bg-clip-text text-transparent group-hover:from-white group-hover:via-amber-100 group-hover:to-orange-200'
                  : 'bg-gradient-to-r from-stone-950 via-orange-950 to-rose-900 bg-clip-text text-transparent group-hover:from-orange-950 group-hover:to-rose-800'
              }`}
            >
              Pizzeria <span className="text-sunset-gradient">Bella</span>
            </span>

            {/* D.O.P. Napoli Live Rotating Telemetry Badge */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black tracking-wider uppercase border transition-all duration-500 shadow-xs ${
                isOverDark
                  ? 'bg-black/40 border-amber-400/40 text-amber-200 backdrop-blur-md'
                  : 'bg-orange-500/10 border-orange-300 text-orange-900'
              }`}
            >
              <TelemetryIcon className={`w-3 h-3 ${currentTelemetry.color} animate-pulse`} />
              <span className="font-extrabold">{currentTelemetry.label}</span>
            </div>
          </div>

          {/* Subtitle with Real-Time Kitchen Dispatch Status */}
          <div className="flex items-center gap-2 pt-1">
            <span className="flex items-center gap-1.5 text-[9.5px] font-mono uppercase tracking-widest font-black text-orange-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>Wood-Fired Artisanal Hearth</span>
            </span>
            <span className="text-stone-400 text-[10px]">•</span>
            <span
              className={`text-[9.5px] font-mono tracking-wider uppercase font-bold hidden md:inline-block ${
                isOverDark ? 'text-amber-200/80' : 'text-stone-500'
              }`}
            >
              Napoli Est. 1889
            </span>
          </div>
        </div>
      </Link>

      {/* ── Advanced Live Kitchen Heritage Popover (Reveals on Hover) ── */}
      {showTooltip && (
        <div className="absolute top-full left-0 mt-3 w-80 bg-stone-950/95 backdrop-blur-2xl border border-orange-400/30 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-white z-50 animate-slide-up pointer-events-none">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/15">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-300">
                Live Kitchen Dispatch Telemetry
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/50">Online</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-3 text-xs">
            <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
              <div className="text-[10px] font-mono text-white/60 uppercase">Oven Temp</div>
              <div className="text-sm font-serif font-black text-amber-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                900°F (482°C)
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
              <div className="text-[10px] font-mono text-white/60 uppercase">Sourdough</div>
              <div className="text-sm font-serif font-black text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                48h Ferment
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
              <div className="text-[10px] font-mono text-white/60 uppercase">San Marzano</div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                100% D.O.P.
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10">
              <div className="text-[10px] font-mono text-white/60 uppercase">Guarantee</div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                35 Min Delivery
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
