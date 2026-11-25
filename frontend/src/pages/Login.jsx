import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PizzaLogoIcon } from '../components/BrandLogo';
import {
  Pizza,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Flame,
  ShieldCheck,
  Star,
  Clock,
  Award,
} from 'lucide-react';

// Curated 4K/HD pizza slides for full-screen 3D backdrop
const LOGIN_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&auto=format&fit=crop&q=95',
    title: 'Wood-Fired Truffle Sourdough',
    tag: '48h Slow Fermentation',
    highlight: 'Naturally leavened wild sourdough crust with velvety garlic alfredo, smoked provolone, and sautéed forest mushrooms.',
    price: '₹520',
  },
  {
    img: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=1920&auto=format&fit=crop&q=95',
    title: 'Margherita Bella Classico',
    tag: 'Authentic Napoli D.O.P.',
    highlight: 'Sweet Italian San Marzano plum tomatoes, bubbling Fior di Latte mozzarella, fragrant basil leaves, and cold-pressed extra virgin olive oil.',
    price: '₹320',
  },
  {
    img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1920&auto=format&fit=crop&q=95',
    title: 'Farmhouse Garden Harvest',
    tag: 'Chef Signature Veg',
    highlight: 'Crisp oven-charred tricolor bell peppers, caramelized sweet onions, golden sweet corn, and earth-rich wild mushrooms baked to perfection.',
    price: '₹420',
  },
  {
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&auto=format&fit=crop&q=95',
    title: 'Fiery Peri Peri Supreme',
    tag: 'Smoky & Spicy Kick',
    highlight: 'Bold African bird’s eye chili marinara paired with sharp aged cheddar, fiery pickled jalapeños, and spiced cottage cheese cubes.',
    price: '₹460',
  },
];

export default function Login() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resendStatus, setResendStatus] = useState('');

  // 3D Parallax & Depth State
  const [tilt, setTilt] = useState({ x: 0, y: 0, mouseX: 50, mouseY: 50 });
  const [isHovering, setIsHovering] = useState(false);

  // Full-Screen Pizza Slide Index
  const [slideIndex, setSlideIndex] = useState(0);

  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();

  // Mouse Parallax Tilt Tracker
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Smooth subtle 3D tilt angles
    const tiltX = ((y - centerY) / centerY) * -5;
    const tiltY = ((x - centerX) / centerX) * 5;
    const mouseXPercent = (x / rect.width) * 100;
    const mouseYPercent = (y / rect.height) * 100;

    setTilt({ x: tiltX, y: tiltY, mouseX: mouseXPercent, mouseY: mouseYPercent });
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt((prev) => ({ ...prev, x: 0, y: 0 }));
  };

  // Auto-cycle full-screen backdrop every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % LOGIN_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
        setUnverifiedEmail(err.response.data.email || email);
        setError(err.response.data.message);
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    try {
      setResendStatus('Sending verification link...');
      const res = await resendVerification(unverifiedEmail);
      setResendStatus(res.message || 'Verification link resent! Check your inbox.');
    } catch (err) {
      setResendStatus('Failed to resend verification email.');
    }
  };

  const activeSlide = LOGIN_SLIDES[slideIndex];

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden select-none pt-28 pb-16 px-4 sm:px-6 lg:px-8"
      style={{ perspective: '1200px' }}
    >
      {/* ═══════════════════════════════════════════════════
          3D FULL-SCREEN ARTISANAL PIZZA STAGE
      ═══════════════════════════════════════════════════ */}
      <div
        className={`absolute inset-0 w-full h-full pointer-events-none ${!isHovering ? 'animate-3d-ambient' : ''}`}
        style={{
          transform: isHovering
            ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.10, 1.10, 1.10)`
            : undefined,
          transition: isHovering
            ? 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)'
            : 'transform 1.8s ease-out',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {LOGIN_SLIDES.map((slide, idx) => {
          const isActive = idx === slideIndex;
          return (
            <div
              key={idx}
              className="absolute inset-0 w-full h-full"
              style={{
                opacity: isActive ? 1 : 0,
                zIndex: isActive ? 2 : 1,
                transition: 'opacity 1800ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <img
                src={slide.img}
                alt={slide.title}
                className="w-full h-full object-cover object-center scale-[1.06]"
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
          );
        })}
      </div>

      {/* ── Dynamic 3D Sunset Glow Spotlight (tracks mouse across screen) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-700"
        style={{
          background: isHovering
            ? `radial-gradient(circle 650px at ${tilt.mouseX}% ${tilt.mouseY}%, rgba(249, 115, 22, 0.24) 0%, rgba(244, 63, 94, 0.12) 35%, transparent 75%)`
            : 'radial-gradient(circle 700px at 70% 40%, rgba(249, 115, 22, 0.18) 0%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* ── Floating 3D Stone Oven Embers ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-15">
        {[
          { left: '10%', delay: '0s', dur: '12s', size: 'w-2 h-2', bg: 'bg-amber-400' },
          { left: '28%', delay: '3s', dur: '15s', size: 'w-1.5 h-1.5', bg: 'bg-orange-400' },
          { left: '50%', delay: '1.5s', dur: '14s', size: 'w-2.5 h-2.5', bg: 'bg-rose-400' },
          { left: '72%', delay: '5s', dur: '13s', size: 'w-1 h-1', bg: 'bg-amber-300' },
          { left: '88%', delay: '2s', dur: '16s', size: 'w-2 h-2', bg: 'bg-orange-500' },
          { left: '40%', delay: '7s', dur: '18s', size: 'w-1.5 h-1.5', bg: 'bg-amber-400' },
        ].map((ember, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${ember.size} ${ember.bg} blur-[0.7px] shadow-[0_0_8px_rgba(251,146,60,0.8)]`}
            style={{
              left: ember.left,
              bottom: '-20px',
              animation: `floatEmber ${ember.dur} infinite linear`,
              animationDelay: ember.delay,
            }}
          />
        ))}
      </div>

      {/* ── Multi-Layer Cinematic Vignettes for Readability ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/92 via-stone-950/75 to-stone-950/85 z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-stone-950/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-stone-950/70 to-transparent z-10 pointer-events-none" />

      {/* ═══════════════════════════════════════════════════
          FOREGROUND CONTENT: 3D Showcase + Frosted Form
      ═══════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-20">
        
        {/* ── LEFT PANEL (Desktop): 3D Pizza Showcase & Highlights ── */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6 hidden lg:block text-white">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-200">
              Stone Oven Live • 900°F
            </span>
          </div>

          {/* Active Pizza Title */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600/90 text-white backdrop-blur-md border border-orange-400/40 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>{activeSlide.tag}</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-serif font-black text-white leading-tight drop-shadow-2xl">
              {activeSlide.title}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl xl:text-3xl font-serif font-black text-amber-300 drop-shadow">
                {activeSlide.price}
              </span>
              <span className="text-white/60 text-xs font-mono">Handcrafted Upon Order</span>
            </div>
          </div>

          {/* Sensory Highlight Quote */}
          <p className="text-white/80 text-sm leading-relaxed font-medium max-w-xl">
            "{activeSlide.highlight}"
          </p>

          {/* Trust strip */}
          <div className="flex items-center gap-6 pt-2 border-t border-white/15 text-xs text-white/75 font-medium">
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Star className="w-4 h-4 fill-current" />
              4.9/5 (12k+ Reviews)
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-400" />
              35-min Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              #1 Wood-Fired
            </span>
          </div>

          {/* Interactive Slide Thumbnail Switcher */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-200/80 block font-bold">
              Switch 3D Pizza Showcase:
            </span>
            <div className="flex items-center gap-3">
              {LOGIN_SLIDES.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => setSlideIndex(idx)}
                  className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 p-1 flex items-center gap-2.5 ${
                    idx === slideIndex
                      ? 'bg-white/20 border-amber-300 shadow-sunset-sm scale-105'
                      : 'bg-black/30 border-white/15 hover:border-white/40 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={slide.img}
                    alt={slide.title}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="text-left pr-2 hidden xl:block">
                    <div className="text-[11px] font-bold text-white leading-snug line-clamp-1">{slide.title}</div>
                    <div className="text-[9px] text-amber-300 font-mono font-bold">{slide.price}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Floating Luxury Glass Login Card ── */}
        <div className="lg:col-span-6 xl:col-span-5 w-full max-w-lg mx-auto">
          <div className="glass-fade-card rounded-[2.5rem] p-7 sm:p-10 relative overflow-hidden space-y-6">
            
            {/* Top Subtle Sunset Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />

            {/* Form Header */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <PizzaLogoIcon size={42} />
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-600 block">
                      Pizzeria Bella • Member Club
                    </span>
                    <span className="text-xs font-bold text-stone-500">Wood-Fired Artisanal Kitchen</span>
                  </div>
                </div>

                {/* Mobile Slide Dot Indicators */}
                <div className="flex lg:hidden items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-full">
                  {LOGIN_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSlideIndex(idx)}
                      className={`rounded-full transition-all duration-300 ${
                        idx === slideIndex ? 'w-4 h-1.5 bg-orange-500' : 'w-1.5 h-1.5 bg-stone-300'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950 tracking-tight">
                Sign In
              </h2>
              <p className="text-stone-600 text-xs font-medium leading-relaxed">
                Welcome back! Access your custom-sculpted pizzas, saved studio compositions, and real-time live kitchen tracking.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col gap-1.5 animate-card-fade-in font-medium">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
                {unverifiedEmail && (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-left text-orange-700 hover:text-orange-900 font-black underline mt-1 cursor-pointer"
                  >
                    Click here to resend verification link →
                  </button>
                )}
              </div>
            )}

            {/* Resend Status Message */}
            {resendStatus && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-card-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resendStatus}</span>
              </div>
            )}

            {/* 1-Click Fast Fill Evaluation Pills */}
            <div className="p-3 bg-white/45 backdrop-blur-md rounded-2xl border border-white/70 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-stone-800 font-black">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  1-Click Fast Fill:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('user@example.com');
                      setPassword('User@123456');
                    }}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-white/80 hover:bg-white text-orange-900 border border-white/80 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    Customer Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@pizzadelivery.com');
                      setPassword('Admin@123456');
                    }}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-white/80 hover:bg-white text-stone-900 border border-white/80 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    Chef Admin
                  </button>
                </div>
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-stone-900 block font-mono uppercase tracking-wider text-[11px] font-black">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl pl-10 pr-4 py-3 text-stone-950 font-bold text-sm focus:outline-none focus:bg-white/85 focus:border-orange-500 focus:ring-4 focus:ring-orange-400/20 shadow-xs transition-all placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-stone-900 font-mono uppercase tracking-wider text-[11px] font-black">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-orange-600 hover:text-orange-800 text-xs font-bold hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl pl-10 pr-11 py-3 text-stone-950 font-bold text-sm focus:outline-none focus:bg-white/85 focus:border-orange-500 focus:ring-4 focus:ring-orange-400/20 shadow-xs transition-all placeholder:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:to-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(249,115,22,0.35)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.5)] active:scale-98 transition-all disabled:opacity-60 cursor-pointer pt-3.5"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Routing & Trust */}
            <div className="pt-3 border-t border-orange-100 text-center space-y-2.5">
              <p className="text-xs text-stone-600 font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="text-orange-600 hover:text-orange-700 font-black hover:underline">
                  Register with Mobile Number & OTP →
                </Link>
              </p>

              <p className="text-[11px] text-stone-500">
                Kitchen staff or executive chef?{' '}
                <Link to="/admin/login" className="text-rose-600 hover:text-rose-700 font-black hover:underline">
                  Enter Kitchen Admin Portal 👨‍🍳
                </Link>
              </p>

              <div className="pt-1 flex items-center justify-center gap-4 text-[10px] text-stone-400 font-mono">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  256-Bit SSL Encrypted
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Real-Time Kitchen Sync
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
