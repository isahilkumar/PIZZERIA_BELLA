import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Play, Pause, RefreshCw, Eye } from 'lucide-react';

export default function PizzaPlateVisualizer({
  selectedBase,
  selectedSauce,
  selectedCheese,
  selectedVeggies = [],
  autoAnimate = true,
  showControls = true,
  size = 'md',
}) {
  // Slice pull animation states
  const [isPulled, setIsPulled] = useState(true);
  const [autoPlay, setAutoPlay] = useState(autoAnimate);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play interval: cycles between pulled and together
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setIsPulled((prev) => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  // Size configurations
  const sizeClasses = {
    sm: 'w-64 h-64 sm:w-72 sm:h-72',
    md: 'w-72 h-72 sm:w-84 sm:h-84',
    lg: 'w-80 h-80 sm:w-96 sm:h-96',
  };

  // Base crust style
  const getCrustBorder = () => {
    if (!selectedBase) return { border: '#b45309', rim: '#92400e', fill: '#fde68a', name: 'Hand Tossed Thin Crust' };
    const name = selectedBase.name.toLowerCase();
    if (name.includes('sourdough')) {
      return { border: '#78350f', rim: '#542609', fill: '#fef3c7', name: selectedBase.name };
    }
    if (name.includes('cauliflower')) {
      return { border: '#ca8a04', rim: '#a16207', fill: '#fef9c3', name: selectedBase.name };
    }
    if (name.includes('burst')) {
      return { border: '#f59e0b', rim: '#d97706', fill: '#fef08a', name: selectedBase.name, stuffed: true };
    }
    if (name.includes('pan') || name.includes('deep')) {
      return { border: '#78350f', rim: '#451a03', fill: '#fed7aa', name: selectedBase.name, deep: true };
    }
    return { border: '#b45309', rim: '#92400e', fill: '#fde68a', name: selectedBase.name };
  };

  // Sauce gradient & style
  const getSauceColors = () => {
    if (!selectedSauce) return { start: '#ef4444', mid: '#dc2626', end: '#991b1b', name: 'Classic San Marzano' };
    const name = selectedSauce.name.toLowerCase();
    if (name.includes('alfredo')) {
      return { start: '#fef9c3', mid: '#fef08a', end: '#fde047', name: selectedSauce.name };
    }
    if (name.includes('pesto')) {
      return { start: '#84cc16', mid: '#65a30d', end: '#3f6212', name: selectedSauce.name };
    }
    if (name.includes('bbq') || name.includes('chipotle')) {
      return { start: '#9a3412', mid: '#7c2d12', end: '#451a03', name: selectedSauce.name };
    }
    if (name.includes('peri')) {
      return { start: '#f97316', mid: '#dc2626', end: '#7f1d1d', name: selectedSauce.name };
    }
    return { start: '#ef4444', mid: '#dc2626', end: '#991b1b', name: selectedSauce.name };
  };

  // Cheese colors & melt style
  const getCheeseColors = () => {
    if (!selectedCheese) return { start: '#fefce8', mid: '#fef08a', end: '#f59e0b', name: 'Fresh Mozzarella' };
    const name = selectedCheese.name.toLowerCase();
    if (name.includes('vegan')) {
      return { start: '#fefce8', mid: '#fef08a', end: '#fde047', name: selectedCheese.name };
    }
    if (name.includes('cheddar')) {
      return { start: '#fef08a', mid: '#f59e0b', end: '#d97706', name: selectedCheese.name };
    }
    if (name.includes('ricotta')) {
      return { start: '#ffffff', mid: '#fef9c3', end: '#fef08a', name: selectedCheese.name };
    }
    return { start: '#fefce8', mid: '#fef08a', end: '#f59e0b', name: selectedCheese.name };
  };

  const crust = getCrustBorder();
  const sauce = getSauceColors();
  const cheese = getCheeseColors();

  // Mathematical Geometry (viewBox: 0 0 320 320, Center: 160, 160)
  const cx = 160;
  const cy = 160;
  const R_crust = 122;
  const R_sauce = 105;
  const R_cheese = 92;

  // Angles for the Hero Removed Slice: -75° to -15° (Centered at -45°, pointing Top-Right)
  // Shift when pulled: along bisector (-45°)
  const pullDist = isPulled ? 32 : 0;
  const pullDx = Number((Math.cos((-45 * Math.PI) / 180) * pullDist).toFixed(2)); // ~22.6px
  const pullDy = Number((Math.sin((-45 * Math.PI) / 180) * pullDist).toFixed(2)); // ~ -22.6px

  // Trigonometric point helper
  const pt = (r, deg, ox = 0, oy = 0) => {
    const rad = (deg * Math.PI) / 180;
    return `${(cx + ox + r * Math.cos(rad)).toFixed(2)} ${(cy + oy + r * Math.sin(rad)).toFixed(2)}`;
  };

  // Slice Wedge (Crust): -75° to -15°
  const sliceCrustPath = `M ${cx} ${cy} L ${pt(R_crust, -75)} A ${R_crust} ${R_crust} 0 0 1 ${pt(R_crust, -15)} Z`;
  const sliceSaucePath = `M ${cx} ${cy} L ${pt(R_sauce, -75)} A ${R_sauce} ${R_sauce} 0 0 1 ${pt(R_sauce, -15)} Z`;
  const sliceCheesePath = `M ${cx} ${cy} L ${pt(R_cheese, -75)} A ${R_cheese} ${R_cheese} 0 0 1 ${pt(R_cheese, -15)} Z`;

  // Main Pizza Body (300° wedge): -15° clockwise around to -75°
  const mainCrustPath = `M ${cx} ${cy} L ${pt(R_crust, -15)} A ${R_crust} ${R_crust} 0 1 1 ${pt(R_crust, -75)} Z`;
  const mainSaucePath = `M ${cx} ${cy} L ${pt(R_sauce, -15)} A ${R_sauce} ${R_sauce} 0 1 1 ${pt(R_sauce, -75)} Z`;
  const mainCheesePath = `M ${cx} ${cy} L ${pt(R_cheese, -15)} A ${R_cheese} ${R_cheese} 0 1 1 ${pt(R_cheese, -75)} Z`;

  // Slice score lines on the main body
  const cutterAngles = [45, 105, 165, 225];

  // Cheese Pull Strands Coordinates (connecting main body cut edge to slice cut edge)
  // Side 1 (along -75°): points at radii 28, 55, 82
  // Center Tip: point at (cx, cy)
  // Side 2 (along -15°): points at radii 32, 60, 88
  const cheeseStrands = [
    // Tip Center Strand
    {
      m: `${cx} ${cy}`,
      s: `${cx + pullDx} ${cy + pullDy}`,
      cp1: `${cx + pullDx * 0.4} ${cy + pullDy * 0.2 + 4}`,
      cp2: `${cx + pullDx * 0.7} ${cy + pullDy * 0.8 + 2}`,
      width: 3.5,
      drop: true,
    },
    // Edge A (Top cut at -75°)
    {
      m: pt(28, -75),
      s: pt(28, -75, pullDx, pullDy),
      cp1: pt(28 + pullDist * 0.3, -73, 0, 3),
      cp2: pt(28 + pullDist * 0.7, -74, pullDx * 0.8, pullDy * 0.8 + 2),
      width: 2.8,
    },
    {
      m: pt(58, -75),
      s: pt(58, -75, pullDx, pullDy),
      cp1: pt(58 + pullDist * 0.25, -73, 0, 4),
      cp2: pt(58 + pullDist * 0.75, -74, pullDx * 0.8, pullDy * 0.8 + 2),
      width: 2.2,
      drop: true,
    },
    {
      m: pt(84, -75),
      s: pt(84, -75, pullDx, pullDy),
      cp1: pt(84 + pullDist * 0.3, -73, 0, 3),
      cp2: pt(84 + pullDist * 0.7, -74, pullDx * 0.8, pullDy * 0.8 + 1),
      width: 1.8,
    },
    // Edge B (Bottom cut at -15°)
    {
      m: pt(32, -15),
      s: pt(32, -15, pullDx, pullDy),
      cp1: pt(32 + pullDist * 0.3, -16, 0, 4),
      cp2: pt(32 + pullDist * 0.7, -15, pullDx * 0.8, pullDy * 0.8 + 3),
      width: 3.0,
      drop: true,
    },
    {
      m: pt(62, -15),
      s: pt(62, -15, pullDx, pullDy),
      cp1: pt(62 + pullDist * 0.25, -16, 0, 4),
      cp2: pt(62 + pullDist * 0.75, -15, pullDx * 0.8, pullDy * 0.8 + 2),
      width: 2.4,
    },
    {
      m: pt(88, -15),
      s: pt(88, -15, pullDx, pullDy),
      cp1: pt(88 + pullDist * 0.3, -16, 0, 3),
      cp2: pt(88 + pullDist * 0.7, -15, pullDx * 0.8, pullDy * 0.8 + 1),
      width: 1.6,
    },
  ];

  // Helper to render vegetable topping SVG shapes
  const renderSvgTopping = (veg, angle, radius, key) => {
    const name = (veg.name || '').toLowerCase();
    const rad = (angle * Math.PI) / 180;
    const x = cx + radius * Math.cos(rad);
    const y = cy + radius * Math.sin(rad);

    if (name.includes('bell') || name.includes('pepper')) {
      const isGreen = key.charCodeAt(0) % 2 === 0;
      return (
        <path
          key={key}
          d={`M ${x - 9} ${y + 5} Q ${x} ${y - 8} ${x + 9} ${y + 5}`}
          fill="none"
          stroke={isGreen ? '#16a34a' : '#ea580c'}
          strokeWidth="3.2"
          strokeLinecap="round"
          filter="drop-shadow(0 1px 1px rgba(0,0,0,0.3))"
        />
      );
    }
    if (name.includes('olive')) {
      return (
        <g key={key} transform={`translate(${x}, ${y})`}>
          <circle r="5" fill="#1c1917" stroke="#44403c" strokeWidth="1" />
          <circle r="2.2" fill="#78350f" opacity="0.6" />
        </g>
      );
    }
    if (name.includes('onion')) {
      return (
        <path
          key={key}
          d={`M ${x - 8} ${y + 4} Q ${x} ${y - 6} ${x + 8} ${y + 4}`}
          fill="none"
          stroke="#be185d"
          strokeWidth="2.4"
          strokeLinecap="round"
          filter="drop-shadow(0 1px 1px rgba(0,0,0,0.25))"
        />
      );
    }
    if (name.includes('jalape') || name.includes('chili')) {
      return (
        <g key={key} transform={`translate(${x}, ${y})`}>
          <circle r="5.5" fill="#059669" stroke="#064e3b" strokeWidth="1.2" />
          <circle r="2" fill="#6ee7b7" />
          <circle cx="1" cy="0" r="0.8" fill="#ffffff" />
        </g>
      );
    }
    if (name.includes('mushroom')) {
      return (
        <g key={key} transform={`translate(${x}, ${y})`}>
          <path d="M -5 0 A 5 4 0 0 1 5 0 Z" fill="#fef3c7" stroke="#78350f" strokeWidth="1" />
          <rect x="-1.5" y="0" width="3" height="4" rx="1" fill="#fde68a" stroke="#78350f" strokeWidth="0.8" />
        </g>
      );
    }
    if (name.includes('tomato')) {
      return (
        <g key={key} transform={`translate(${x}, ${y})`}>
          <circle r="6" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
          <circle r="4" fill="#ef4444" />
          <circle cx="-1.5" cy="-1" r="1.2" fill="#fecaca" />
        </g>
      );
    }
    if (name.includes('corn')) {
      return (
        <g key={key} transform={`translate(${x}, ${y})`}>
          <circle cx="-2.5" cy="0" r="2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="2.5" cy="0" r="2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
        </g>
      );
    }
    // Default Basil Leaf
    return (
      <path
        key={key}
        d={`M ${x - 4} ${y - 6} Q ${x + 6} ${y} ${x - 4} ${y + 6} Q ${x - 6} ${y} ${x - 4} ${y - 6}`}
        fill="#15803d"
        stroke="#14532d"
        strokeWidth="0.8"
        filter="drop-shadow(0 1px 1px rgba(0,0,0,0.25))"
      />
    );
  };

  // Pre-configured topping coordinate slots:
  // Slots on Hero Slice: angle between -70° and -20°
  const sliceSlots = [
    { angle: -45, radius: 46 },
    { angle: -62, radius: 72 },
    { angle: -28, radius: 74 },
    { angle: -45, radius: 78 },
  ];
  // Slots on Main Body: angle outside [-75°, -15°]
  const mainSlots = [
    { angle: 15, radius: 52 },
    { angle: 55, radius: 68 },
    { angle: 90, radius: 48 },
    { angle: 125, radius: 74 },
    { angle: 160, radius: 56 },
    { angle: 195, radius: 70 },
    { angle: 230, radius: 45 },
    { angle: 260, radius: 72 },
    { angle: 285, radius: 50 },
    { angle: 35, radius: 80 },
    { angle: 140, radius: 36 },
    { angle: 210, radius: 34 },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full">
      {/* Outer Glow Halo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/15 via-rose-500/10 to-amber-400/15 rounded-full blur-2xl transform scale-95 pointer-events-none" />

      {/* SVG Container on Natural Birch Pizza Peel */}
      <div
        className={`relative ${sizeClasses[size] || sizeClasses.md} flex items-center justify-center cursor-pointer`}
        onClick={() => {
          setIsPulled((prev) => !prev);
          setAutoPlay(false); // User interaction pauses autoplay
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Click to pull or return pizza slice"
      >
        <svg
          viewBox="0 0 320 320"
          className="w-full h-full drop-shadow-[0_22px_45px_rgba(154,52,18,0.24)]"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Wooden Peel Texture Gradients */}
            <radialGradient id="peelGradient" cx="45%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="50%" stopColor="#fde68a" />
              <stop offset="85%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>

            {/* Crust Gradients */}
            <radialGradient id="crustGradient" cx="48%" cy="48%" r="58%">
              <stop offset="0%" stopColor={crust.fill} />
              <stop offset="65%" stopColor={crust.border} />
              <stop offset="100%" stopColor={crust.rim} />
            </radialGradient>

            {/* Sauce Gradients */}
            <radialGradient id="sauceGradient" cx="45%" cy="45%" r="60%">
              <stop offset="0%" stopColor={sauce.start} />
              <stop offset="60%" stopColor={sauce.mid} />
              <stop offset="100%" stopColor={sauce.end} />
            </radialGradient>

            {/* Cheese Gradients */}
            <radialGradient id="cheeseGradient" cx="46%" cy="46%" r="56%">
              <stop offset="0%" stopColor={cheese.start} />
              <stop offset="65%" stopColor={cheese.mid} />
              <stop offset="100%" stopColor={cheese.end} />
            </radialGradient>

            {/* Molten Cheese String Gradient */}
            <linearGradient id="cheesePullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={cheese.start} />
              <stop offset="50%" stopColor={cheese.mid} />
              <stop offset="100%" stopColor={cheese.end} />
            </linearGradient>

            {/* Slice Elevation Shadow Filter */}
            <filter id="sliceShadow" x="-25%" y="-25%" width="160%" height="160%">
              <feDropShadow dx={isPulled ? "10" : "2"} dy={isPulled ? "14" : "4"} stdDeviation={isPulled ? "10" : "3"} floodColor="#7c2d12" floodOpacity={isPulled ? "0.45" : "0.25"} />
            </filter>

            {/* Crust Depth Filter */}
            <filter id="crustDepth">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#451a03" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* ═══════════════════════════════════════════════════
              1. WOODEN PIZZA PEEL / SERVING BOARD
          ═══════════════════════════════════════════════════ */}
          <g id="wooden-peel">
            {/* Peel Handle (bottom left) */}
            <path
              d="M 50 270 L 15 305 A 12 12 0 0 0 32 322 L 67 287 Z"
              fill="#d97706"
              stroke="#b45309"
              strokeWidth="2"
              filter="drop-shadow(2px 4px 6px rgba(0,0,0,0.3))"
            />
            {/* Round Peel Board */}
            <circle cx="160" cy="160" r="150" fill="url(#peelGradient)" stroke="#ffffff" strokeWidth="4" />
            {/* Circular Wood Grain Rings */}
            <circle cx="160" cy="160" r="142" fill="none" stroke="#f59e0b" strokeWidth="1.2" opacity="0.45" />
            <circle cx="160" cy="160" r="130" fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.35" />

            {/* Semolina flour dusting & knife score marks in the removed slice gap */}
            {isPulled && (
              <g id="gap-details" className="transition-opacity duration-700">
                {/* Pizza cutter mark on board */}
                <line x1="160" y1="160" x2={pt(130, -45).split(' ')[0]} y2={pt(130, -45).split(' ')[1]} stroke="#b45309" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.5" />
                {/* Flour flecks */}
                <circle cx="178" cy="142" r="1" fill="#ffffff" opacity="0.75" />
                <circle cx="192" cy="128" r="1.4" fill="#ffffff" opacity="0.85" />
                <circle cx="210" cy="118" r="1" fill="#ffffff" opacity="0.65" />
                <circle cx="198" cy="148" r="1.2" fill="#ffffff" opacity="0.7" />
                {/* Oregano speck */}
                <circle cx="186" cy="136" r="0.8" fill="#3f6212" opacity="0.6" />
                <circle cx="204" cy="132" r="1" fill="#3f6212" opacity="0.55" />
              </g>
            )}
          </g>

          {/* ═══════════════════════════════════════════════════
              2. MAIN PIZZA BODY (Remaining 5 Slices / 300°)
          ═══════════════════════════════════════════════════ */}
          <g id="main-pizza-body" filter="url(#crustDepth)">
            {/* Crust Dough (300° wedge) */}
            <path
              d={mainCrustPath}
              fill="url(#crustGradient)"
              stroke={crust.rim}
              strokeWidth="2.5"
            />

            {/* Oven blister char marks on main crust rim */}
            <ellipse cx="60" cy="160" rx="4.5" ry="2.5" fill="#451a03" opacity="0.6" transform="rotate(-15 60 160)" />
            <ellipse cx="160" cy="275" rx="5" ry="3" fill="#451a03" opacity="0.55" transform="rotate(30 160 275)" />
            <ellipse cx="85" cy="85" rx="4" ry="2" fill="#451a03" opacity="0.65" transform="rotate(45 85 85)" />
            <ellipse cx="80" cy="235" rx="5" ry="2.8" fill="#451a03" opacity="0.5" transform="rotate(-35 80 235)" />
            <ellipse cx="245" cy="225" rx="4" ry="2.2" fill="#451a03" opacity="0.6" transform="rotate(20 245 225)" />

            {/* Sauce Layer */}
            <path d={mainSaucePath} fill="url(#sauceGradient)" opacity="0.96" />

            {/* Oregano flecks on sauce */}
            <circle cx="120" cy="180" r="1.2" fill="#365314" />
            <circle cx="140" cy="220" r="1.0" fill="#365314" />
            <circle cx="95" cy="140" r="1.3" fill="#365314" />
            <circle cx="205" cy="205" r="1.1" fill="#365314" />

            {/* Melted Cheese Layer */}
            <path d={mainCheesePath} fill="url(#cheeseGradient)" opacity="0.94" />

            {/* Toasted Brown Cheese Spots on Main Body */}
            <ellipse cx="115" cy="145" rx="6" ry="4" fill="#9a3412" opacity="0.5" />
            <ellipse cx="145" cy="205" rx="7" ry="4.5" fill="#9a3412" opacity="0.45" />
            <ellipse cx="185" cy="185" rx="5.5" ry="3.5" fill="#9a3412" opacity="0.4" />
            <ellipse cx="110" cy="190" rx="5" ry="3" fill="#9a3412" opacity="0.45" />

            {/* Slicing cutter score lines across main body */}
            {cutterAngles.map((ang) => (
              <line
                key={ang}
                x1="160"
                y1="160"
                x2={pt(R_crust - 2, ang).split(' ')[0]}
                y2={pt(R_crust - 2, ang).split(' ')[1]}
                stroke="#78350f"
                strokeWidth="1.2"
                strokeDasharray="4 2"
                opacity="0.4"
              />
            ))}

            {/* Vegetable Toppings on Main Body */}
            {selectedVeggies.map((veg, vIdx) => {
              const slot = mainSlots[vIdx % mainSlots.length];
              const slot2 = mainSlots[(vIdx + 5) % mainSlots.length];
              return (
                <React.Fragment key={vIdx}>
                  {renderSvgTopping(veg, slot.angle, slot.radius, `main-${vIdx}-1`)}
                  {renderSvgTopping(veg, slot2.angle, slot2.radius, `main-${vIdx}-2`)}
                </React.Fragment>
              );
            })}
          </g>

          {/* ═══════════════════════════════════════════════════
              3. MOLTEN CHEESE PULL STRANDS (Dynamic Stretching)
          ═══════════════════════════════════════════════════ */}
          {isPulled && (
            <g id="cheese-pull-strands" className="animate-cheese-goo pointer-events-none">
              {cheeseStrands.map((strand, sIdx) => {
                const pathD = `M ${strand.m} C ${strand.cp1}, ${strand.cp2}, ${strand.s}`;
                return (
                  <g key={sIdx}>
                    {/* Shadow under cheese strand */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#78350f"
                      strokeWidth={strand.width + 1.2}
                      strokeLinecap="round"
                      opacity="0.25"
                      transform="translate(1, 2)"
                    />
                    {/* Golden Cheese Core Strand */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#cheesePullGrad)"
                      strokeWidth={strand.width}
                      strokeLinecap="round"
                      opacity="0.95"
                      filter="drop-shadow(0 0 2px rgba(251,191,36,0.6))"
                    />
                    {/* Molten Cheese Droplet bead in middle */}
                    {strand.drop && (
                      <circle
                        cx={(parseFloat(strand.cp1.split(' ')[0]) + parseFloat(strand.cp2.split(' ')[0])) / 2}
                        cy={(parseFloat(strand.cp1.split(' ')[1]) + parseFloat(strand.cp2.split(' ')[1])) / 2 + 2}
                        r={strand.width * 0.75}
                        fill={cheese.start}
                        stroke={cheese.end}
                        strokeWidth="0.5"
                      />
                    )}
                  </g>
                );
              })}

              {/* Steam wisps rising from hot cheese pull gap */}
              <path
                d="M 175 138 Q 170 120 176 106 T 172 88"
                fill="none"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="2.4"
                strokeLinecap="round"
                className="animate-steam-1"
              />
              <path
                d="M 194 130 Q 202 112 196 94 T 202 74"
                fill="none"
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth="2.0"
                strokeLinecap="round"
                className="animate-steam-2"
              />
              <path
                d="M 184 150 Q 188 134 182 118 T 186 98"
                fill="none"
                stroke="rgba(255, 255, 255, 0.55)"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="animate-steam-3"
              />
            </g>
          )}

          {/* ═══════════════════════════════════════════════════
              4. HERO REMOVED PIZZA SLICE (Smooth Animated Pull)
          ═══════════════════════════════════════════════════ */}
          <g
            id="hero-pizza-slice"
            filter="url(#sliceShadow)"
            style={{
              transform: `translate(${pullDx}px, ${pullDy}px) ${isPulled ? 'scale(1.03)' : 'scale(1)'}`,
              transition: 'transform 0.65s cubic-bezier(0.34, 1.45, 0.64, 1)',
              transformOrigin: `${cx}px ${cy}px`,
            }}
            className={isPulled && !isHovered ? 'animate-slice-float' : ''}
          >
            {/* Slice Crust Dough */}
            <path
              d={sliceCrustPath}
              fill="url(#crustGradient)"
              stroke={crust.rim}
              strokeWidth="2.5"
            />

            {/* Crust Rim Blister Char Marks on the slice */}
            <ellipse cx="225" cy="75" rx="5" ry="2.6" fill="#451a03" opacity="0.65" transform="rotate(35 225 75)" />
            <ellipse cx="258" cy="115" rx="4" ry="2.2" fill="#451a03" opacity="0.55" transform="rotate(-15 258 115)" />

            {/* Slice Sauce Layer */}
            <path d={sliceSaucePath} fill="url(#sauceGradient)" opacity="0.96" />

            {/* Oregano flecks on slice sauce */}
            <circle cx="195" cy="120" r="1.2" fill="#365314" />
            <circle cx="218" cy="98" r="1.1" fill="#365314" />

            {/* Slice Melted Cheese Layer */}
            <path d={sliceCheesePath} fill="url(#cheeseGradient)" opacity="0.94" />

            {/* Toasted Cheese Spots on Slice */}
            <ellipse cx="202" cy="112" rx="5.5" ry="3.5" fill="#9a3412" opacity="0.5" />
            <ellipse cx="228" cy="92" rx="6" ry="4" fill="#9a3412" opacity="0.45" />

            {/* Vegetable Toppings on the Removed Slice */}
            {selectedVeggies.map((veg, vIdx) => {
              const slot = sliceSlots[vIdx % sliceSlots.length];
              return renderSvgTopping(veg, slot.angle, slot.radius, `slice-${vIdx}`);
            })}
          </g>
        </svg>

        {/* Hover Cue Tag */}
        <div
          className={`absolute top-2 right-2 transition-all duration-300 pointer-events-none ${
            isPulled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          }`}
        >
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white shadow-md">
            <Flame className="w-3 h-3 text-amber-300 animate-pulse" />
            Fresh Slice Pull
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          5. INTERACTIVE CONTROLS & STATUS STRIP
      ═══════════════════════════════════════════════════ */}
      {showControls && (
        <div className="w-full max-w-sm mt-5 space-y-3">
          {/* Action Button Row */}
          <div className="flex items-center justify-center gap-3">
            {/* Manual Pull / Return Toggle Button */}
            <button
              onClick={() => {
                setIsPulled((prev) => !prev);
                setAutoPlay(false); // User manual action overrides autoplay
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 shadow-sunset-sm hover:shadow-sunset-md hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-white/30"
            >
              <span className="text-base leading-none">🍕</span>
              <span>{isPulled ? 'Push Slice In' : 'Pull Slice Out'}</span>
            </button>

            {/* Autoplay Loop Toggle */}
            <button
              onClick={() => setAutoPlay((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 border ${
                autoPlay
                  ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-sm'
                  : 'bg-white text-stone-700 hover:text-stone-950 border-stone-200'
              }`}
              title={autoPlay ? 'Pause continuous cheese pull loop' : 'Play continuous cheese pull loop'}
            >
              {autoPlay ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-700" />
                  <span className="hidden sm:inline">Looping</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-stone-600" />
                  <span className="hidden sm:inline">Auto Pull</span>
                </>
              )}
            </button>
          </div>

          {/* Status micro-copy */}
          <div className="text-center text-[11px] font-bold text-stone-600 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>
              {isPulled
                ? '6 Slices Hand-Cut • Golden Cheese Stretched'
                : 'Whole Stone-Baked Pizza • Click Slice to Separate'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
