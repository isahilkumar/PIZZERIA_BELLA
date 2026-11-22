import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PizzaLogoIcon } from '../../components/BrandLogo';
import {
  ChefHat,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const ADMIN_BG_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=2560&auto=format&fit=crop&q=98',
    title: 'Wood-Fired Truffle Sourdough Feast',
  },
  {
    img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=2560&auto=format&fit=crop&q=98',
    title: 'San Marzano Margherita D.O.P. with Fresh Basil',
  },
  {
    img: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=2560&auto=format&fit=crop&q=98',
    title: 'Master Pizzaiolo & 900°F Stone Oven Hearth',
  },
  {
    img: 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=2560&auto=format&fit=crop&q=98',
    title: 'Artisan Pizza Baking over Glowing Wood Embers',
  },
];

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Background slideshow index
  const [slideIndex, setSlideIndex] = useState(0);

  // 3D Parallax & Depth State
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const animFrameRef = useRef(null);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  // Background auto-rotation every 7 seconds
  useEffect(() => {
    const bgTimer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % ADMIN_BG_SLIDES.length);
    }, 7000);

    return () => clearInterval(bgTimer);
  }, []);

  const handleMouseMove = (e) => {
    setIsHovering(true);
    if (animFrameRef.current) return;
    animFrameRef.current = requestAnimationFrame(() => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xPct = (clientX / innerWidth) * 100;
      const yPct = (clientY / innerHeight) * 100;
      setMousePos({ x: xPct, y: yPct });

      // Subtle 3D tilt angles for the centered frosted glass card
      const tiltX = (clientY / innerHeight - 0.5) * -8;
      const tiltY = (clientX / innerWidth - 0.5) * 8;
      setCardTilt({ x: tiltX, y: tiltY });
      animFrameRef.current = null;
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setCardTilt({ x: 0, y: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin(email, password);
      navigate('/admin/inventory');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unauthorized: Admin credentials invalid or insufficient privileges.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen w-full flex items-center justify-center px-4 py-24 sm:py-28 overflow-hidden bg-stone-950 select-none z-0"
    >
      {/* ══════════════════════════════════════════════════════════════
          1. 4K DYNAMIC WOOD-FIRED PIZZA BACKGROUND WITH ANIMATIONS
      ══════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {ADMIN_BG_SLIDES.map((slide, idx) => {
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
                  filter: 'brightness(0.65) saturate(1.20) contrast(1.10)',
                }}
              />
            </div>
          );
        })}

        {/* Cinematic Vignettes for Readability & Contrast */}
        <div className="absolute inset-0 bg-stone-950/40 z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-stone-950/80 via-stone-950/30 to-transparent z-10 pointer-events-none" />

        {/* Dynamic 3D Sunset Glow Spotlight (Tracks mouse pointer) */}
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500"
          style={{
            background: isHovering
              ? `radial-gradient(circle 800px at ${mousePos.x}% ${mousePos.y}%, rgba(249, 115, 22, 0.28) 0%, rgba(244, 63, 94, 0.14) 40%, transparent 80%)`
              : 'radial-gradient(circle 750px at 50% 50%, rgba(249, 115, 22, 0.20) 0%, transparent 70%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* Floating Stone Oven Fire Embers with Rising Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-15">
          {[
            { left: '12%', delay: '0s', dur: '12s', size: 'w-2 h-2', bg: 'bg-amber-400' },
            { left: '26%', delay: '3.5s', dur: '15s', size: 'w-1.5 h-1.5', bg: 'bg-orange-400' },
            { left: '48%', delay: '1.2s', dur: '14s', size: 'w-2.5 h-2.5', bg: 'bg-rose-400' },
            { left: '68%', delay: '5s', dur: '13s', size: 'w-1 h-1', bg: 'bg-amber-300' },
            { left: '85%', delay: '2.5s', dur: '16s', size: 'w-2 h-2', bg: 'bg-orange-500' },
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

      {/* ══════════════════════════════════════════════════════════════
          2. CENTERED PURE FROSTED GLASS LOGIN FORM (NO IMAGES INSIDE)
      ══════════════════════════════════════════════════════════════ */}
      <div
        className="relative z-20 max-w-lg w-full mx-auto rounded-[2.5rem] overflow-hidden border border-white/20 shadow-[0_35px_90px_rgba(0,0,0,0.75),0_0_50px_rgba(249,115,22,0.22)] bg-stone-950/45 backdrop-blur-3xl transition-transform duration-200 ease-out animate-scale-up p-8 sm:p-12 space-y-6"
        style={{
          transform: `perspective(1000px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
        }}
      >
        {/* Shimmer glowing bar across top edge */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 z-30 shadow-[0_0_12px_rgba(249,115,22,0.8)]" />

        {/* Specular glass reflection inside card */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/12 via-transparent to-transparent pointer-events-none" />

        {/* Form Header */}
        <div className="space-y-3 relative z-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <div className="hover:scale-105 transition-transform duration-300">
              <PizzaLogoIcon size={48} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400 block drop-shadow-sm">
                Kitchen Command Center
              </span>
              <span className="text-xs font-black text-stone-200">Executive Staff Portal</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight drop-shadow-md">
            Executive Chef Login
          </h1>
          <p className="text-stone-300 text-xs font-semibold leading-relaxed drop-shadow-sm">
            Restricted management console. Control real-time ingredient stocks, process live order timelines, and dispatch inventory alerts.
          </p>
        </div>

        {/* Error Alert with Frosted Glass Red */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/25 backdrop-blur-md border border-rose-400/50 text-rose-100 text-xs flex items-center gap-2.5 font-bold animate-shake shadow-lg relative z-10">
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 stroke-[2.5]" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick 1-Click Fill Admin Credentials - Frosted Glass Capsule */}
        <div className="relative z-10 p-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between text-[11px] shadow-sm transition-all duration-300">
          <span className="flex items-center gap-1.5 text-stone-100 font-black">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Executive Chef Credentials:
          </span>
          <button
            type="button"
            onClick={() => {
              setEmail('admin@pizzadelivery.com');
              setPassword('Admin@123456');
            }}
            className="px-3.5 py-1.5 rounded-xl text-[11px] font-black bg-white/15 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 text-amber-200 hover:text-white border border-white/30 hover:border-amber-300 shadow-sm transition-all duration-300 active:scale-95 cursor-pointer"
          >
            Fill Master Admin
          </button>
        </div>

        {/* Login Form with Transparent Glass Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-stone-200 block font-mono uppercase tracking-wider text-[11px] font-black">
              Staff Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pizzadelivery.com"
                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 backdrop-blur-md border border-white/25 focus:border-orange-400 rounded-2xl pl-10 pr-4 py-3.5 text-white placeholder-stone-400 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/25 shadow-inner transition-all duration-300"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-stone-200 block font-mono uppercase tracking-wider text-[11px] font-black">
              Admin Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 backdrop-blur-md border border-white/25 focus:border-orange-400 rounded-2xl pl-10 pr-11 py-3.5 text-white placeholder-stone-400 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/25 shadow-inner transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-white transition-colors p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Glowing Fiery Sunset Submit Button with Animations */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 hover:from-orange-400 hover:to-rose-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(249,115,22,0.45)] hover:shadow-[0_14px_40px_rgba(249,115,22,0.65)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 cursor-pointer group"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Validating Staff Privileges...</span>
              </>
            ) : (
              <>
                <span>Enter Kitchen Admin Console</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-3 border-t border-white/15 text-center space-y-2 relative z-10">
          <p className="text-xs text-stone-300 font-medium">
            Looking for customer dining & pizza ordering?{' '}
            <Link
              to="/login"
              className="text-amber-400 hover:text-amber-300 font-black hover:underline transition-colors ml-1"
            >
              Customer Login →
            </Link>
          </p>

          <div className="pt-1 flex items-center justify-center gap-4 text-[10px] text-stone-400 font-mono font-bold">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              Staff RBAC Protected
            </span>
            <span>•</span>
            <span>256-Bit SSL Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
