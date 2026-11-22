import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PizzaLogoIcon } from './BrandLogo';
import { ArrowRight, X } from 'lucide-react';

const WELCOME_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=2560&auto=format&fit=crop&q=98',
    title: 'Wood-Fired Truffle Sourdough Feast',
    tag: 'Artisan Neapolitan',
  },
  {
    img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=2560&auto=format&fit=crop&q=98',
    title: 'San Marzano Margherita D.O.P. with Fresh Basil',
    tag: '48hr Cold Fermented',
  },
  {
    img: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=2560&auto=format&fit=crop&q=98',
    title: 'Master Pizzaiolo & 900°F Stone Oven Hearth',
    tag: 'Live Fire Baked',
  },
  {
    img: 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=2560&auto=format&fit=crop&q=98',
    title: 'Artisan Pizza Baking over Glowing Wood Embers',
    tag: 'Leopard Cornicione',
  },
  {
    img: 'https://images.unsplash.com/photo-1598023696416-0193a0bcd302?w=2560&auto=format&fit=crop&q=98',
    title: 'Panoramic Gourmet Sourdough with Molten Mozzarella',
    tag: 'Chef Signature',
  },
  {
    img: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=2560&auto=format&fit=crop&q=98',
    title: 'Traditional Italian Hearth Baked Pizza Classica',
    tag: 'Heritage Recipe',
  },
];

const TYPING_PHRASES = [
  'Welcome to Pizzeria Bella 🙏',
  '🙏 Namaste, Welcome to Pizzeria Bella',
  'Welcome to Pizzeria Bella 🙏',
];

export default function WelcomeLanding({ onEnter, isStandalone = false }) {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  // Typewriter State with Namaste Emoji
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // 3D Mouse Parallax & Radial Glow
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const animFrameRef = useRef(null);

  // Auto-cycle backdrop slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % WELCOME_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Typewriter Animation Effect
  useEffect(() => {
    const currentPhrase = TYPING_PHRASES[phraseIdx];
    let timer;

    if (!isDeleting && typedText === currentPhrase) {
      // Pause for 3.5s when typing is complete
      timer = setTimeout(() => setIsDeleting(true), 3500);
    } else if (isDeleting && typedText === '') {
      // Switch phrase after backspacing
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % TYPING_PHRASES.length);
    } else {
      // Type or delete characters
      const speed = isDeleting ? 30 : 80;
      timer = setTimeout(() => {
        setTypedText(
          isDeleting
            ? currentPhrase.substring(0, typedText.length - 1)
            : currentPhrase.substring(0, typedText.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, phraseIdx]);

  const handleMouseMove = (e) => {
    setIsHovering(true);
    if (animFrameRef.current) return;
    animFrameRef.current = requestAnimationFrame(() => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xPct = (clientX / innerWidth) * 100;
      const yPct = (clientY / innerHeight) * 100;
      setMousePos({ x: xPct, y: yPct });

      // Subtle 3D tilt angles (only on non-touch desktop)
      if (innerWidth > 768) {
        const tiltX = (clientY / innerHeight - 0.5) * -6;
        const tiltY = (clientX / innerWidth - 0.5) * 6;
        setCardTilt({ x: tiltX, y: tiltY });
      }
      animFrameRef.current = null;
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setCardTilt({ x: 0, y: 0 });
  };

  const handleEnterClick = () => {
    if (onEnter) {
      onEnter();
    } else {
      navigate('/');
    }
  };

  // Keyboard shortcut: Press Enter to enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleEnterClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper to style parts of typed string (Welcome to in white, Pizzeria Bella in fiery gradient)
  const renderTypedContent = () => {
    if (typedText.startsWith('Welcome to ')) {
      const prefix = 'Welcome to ';
      const rest = typedText.slice(prefix.length);
      return (
        <>
          <span className="text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            {prefix}
          </span>
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400 bg-clip-text text-transparent drop-shadow-[0_12px_30px_rgba(0,0,0,0.95)]">
            {rest}
          </span>
        </>
      );
    }

    if (typedText.startsWith('🙏 Namaste, ')) {
      const prefix = '🙏 Namaste, ';
      const rest = typedText.slice(prefix.length);
      return (
        <>
          <span className="text-amber-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            {prefix}
          </span>
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400 bg-clip-text text-transparent drop-shadow-[0_12px_30px_rgba(0,0,0,0.95)]">
            {rest}
          </span>
        </>
      );
    }

    return (
      <span className="text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
        {typedText}
      </span>
    );
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto overflow-x-hidden select-none"
    >
      {/* ══════════════════════════════════════════════════════════════
          1. 4K DYNAMIC WOOD-FIRED PIZZA BACKGROUND (VIVID & CRISP)
      ══════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {WELCOME_SLIDES.map((slide, idx) => {
          const isActive = idx === slideIndex;
          return (
            <div
              key={idx}
              className="absolute inset-0 w-full h-full transition-opacity duration-1200 ease-in-out"
              style={{
                opacity: isActive ? 1 : 0,
                zIndex: isActive ? 2 : 1,
              }}
            >
              <img
                src={slide.img}
                alt={slide.title}
                className={`w-full h-full object-cover object-center transform transition-transform duration-[10000ms] ease-out ${
                  isActive ? 'scale-108' : 'scale-100'
                }`}
                style={{
                  filter: 'brightness(0.85) saturate(1.15) contrast(1.04)',
                }}
              />
            </div>
          );
        })}

        {/* Minimal Vignettes so Pizza Stays 100% Bright, Crisp & Visible */}
        <div className="absolute inset-0 bg-stone-950/20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-44 sm:h-64 bg-gradient-to-t from-stone-950/75 via-stone-950/20 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-24 sm:h-36 bg-gradient-to-b from-stone-950/50 via-transparent to-transparent pointer-events-none" />

        {/* Dynamic 3D Sunset Glow Spotlight Tracking Mouse */}
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500"
          style={{
            background: isHovering
              ? `radial-gradient(circle 900px at ${mousePos.x}% ${mousePos.y}%, rgba(249, 115, 22, 0.35) 0%, rgba(244, 63, 94, 0.15) 45%, transparent 80%)`
              : 'radial-gradient(circle 800px at 50% 50%, rgba(249, 115, 22, 0.22) 0%, transparent 70%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* Floating Stone Oven Fire Embers */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-15">
          {[
            { left: '10%', delay: '0s', dur: '12s', size: 'w-2 h-2', bg: 'bg-amber-400' },
            { left: '25%', delay: '3.5s', dur: '15s', size: 'w-1.5 h-1.5', bg: 'bg-orange-400' },
            { left: '46%', delay: '1.2s', dur: '14s', size: 'w-2.5 h-2.5', bg: 'bg-rose-400' },
            { left: '68%', delay: '5s', dur: '13s', size: 'w-1 h-1', bg: 'bg-amber-300' },
            { left: '84%', delay: '2.5s', dur: '16s', size: 'w-2 h-2', bg: 'bg-orange-500' },
            { left: '38%', delay: '7s', dur: '18s', size: 'w-1.5 h-1.5', bg: 'bg-amber-400' },
          ].map((ember, i) => (
            <div
              key={i}
              className={`absolute rounded-full ${ember.size} ${ember.bg} blur-[0.6px] shadow-[0_0_8px_rgba(251,146,60,0.85)]`}
              style={{
                left: ember.left,
                bottom: '-20px',
                animation: `floatEmber ${ember.dur} infinite linear`,
                animationDelay: ember.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* Top Right Quick Skip Button - Responsive Position */}
      {!isStandalone && (
        <button
          type="button"
          onClick={handleEnterClick}
          className="absolute top-3 right-3 sm:top-5 sm:right-6 z-30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-mono font-bold text-white bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-lg"
        >
          <span>Skip</span>
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* ══════════════════════════════════════════════════════════════
          2. FULLY RESPONSIVE 100% TRANSPARENT 3D WELCOME PORTAL
      ══════════════════════════════════════════════════════════════ */}
      <div
        className="relative z-20 my-auto w-full max-w-[94vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.35)] bg-transparent backdrop-blur-[3px] transition-transform duration-200 ease-out animate-scale-up p-5 sm:p-8 md:p-12 lg:p-14 text-center space-y-5 sm:space-y-7 md:space-y-8"
        style={{
          transform: `perspective(1000px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
        }}
      >
        {/* Shimmer glowing bar across top edge */}
        <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 z-30 shadow-[0_0_16px_rgba(249,115,22,0.9)]" />

        {/* Brand Emblem with Responsive Dimensions & Live Beacon */}
        <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3 relative z-10">
          <div className="relative group">
            <div className="hover:scale-108 hover:rotate-2 transition-all duration-300 drop-shadow-[0_12px_35px_rgba(0,0,0,0.9)] flex items-center justify-center">
              <PizzaLogoIcon className="w-16 h-16 min-[400px]:w-18 min-[400px]:h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28" />
            </div>
            {/* Live Oven Pulsing Beacon */}
            <span
              className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-300 rounded-full border-2 border-white shadow-[0_0_14px_rgba(249,115,22,1)] animate-pulse"
              title="900°F Stone Oven Active"
            />
          </div>

          {/* Namaste Welcome Pill */}
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider sm:tracking-widest text-amber-300 bg-black/40 backdrop-blur-md border border-white/25 shadow-md">
            <span>🙏 Namaste</span>
            <span>•</span>
            <span>Benvenuti</span>
            <span>•</span>
            <span>Est. 1889</span>
          </span>
        </div>

        {/* ── RESPONSIVE DYNAMIC TYPING FEATURE ── */}
        <div className="space-y-2 sm:space-y-3 relative z-10 min-h-[90px] min-[400px]:min-h-[110px] sm:min-h-[140px] md:min-h-[180px] lg:min-h-[220px] flex items-center justify-center px-2">
          <h1 className="text-2xl min-[380px]:text-3xl min-[480px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] font-serif font-black tracking-tight leading-tight sm:leading-tight md:leading-[1.05] drop-shadow-[0_14px_35px_rgba(0,0,0,0.95)] break-words">
            {renderTypedContent()}
            {/* Pulsing Golden Typewriter Cursor */}
            <span
              className="inline-block w-1 sm:w-1.5 md:w-2 lg:w-2.5 h-6 min-[380px]:h-7 min-[480px]:h-9 sm:h-12 md:h-16 lg:h-20 bg-amber-400 ml-1.5 sm:ml-2 rounded-full animate-pulse shadow-[0_0_14px_rgba(251,191,36,1)] align-middle"
              aria-hidden="true"
            />
          </h1>
        </div>

        {/* Fully Transparent Glass Call-To-Action Button */}
        <div className="pt-1 sm:pt-2 relative z-10 w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={handleEnterClick}
            className="w-full py-3.5 sm:py-4 md:py-5 px-5 sm:px-8 rounded-xl sm:rounded-2xl bg-transparent hover:bg-white/10 active:bg-white/15 backdrop-blur-md border-2 border-white/40 hover:border-amber-400/80 text-white font-black text-sm sm:text-base md:text-lg lg:text-xl flex items-center justify-center gap-2.5 sm:gap-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.4)] hover:shadow-[0_0_35px_rgba(251,191,36,0.5),inset_0_1px_2px_rgba(255,255,255,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer group"
          >
            <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">Enter Pizzeria Bella</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-300 group-hover:translate-x-2 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.85)]" />
          </button>
        </div>
      </div>
    </div>
  );
}
