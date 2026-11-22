import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PizzaLogoIcon } from '../components/BrandLogo';
import {
  Pizza,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  ShieldCheck,
  Star,
  Sparkles,
  Clock,
  Award,
} from 'lucide-react';

// Curated 4K/HD pizza slides for full-screen 3D backdrop
const REGISTER_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&auto=format&fit=crop&q=95',
    title: 'Wood-Fired Truffle Sourdough',
    tag: '48h Slow Fermentation',
    highlight: 'Join the club to sculpt your own custom-kneaded sourdough bases, artisan cheese blends, and farm toppings.',
    perk: 'Free Custom Pizza Studio Access',
  },
  {
    img: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=1920&auto=format&fit=crop&q=95',
    title: 'Margherita Bella Classico',
    tag: 'Authentic Napoli D.O.P.',
    highlight: 'Crafted with genuine D.O.P. San Marzano tomatoes, bubbling Fior di Latte mozzarella, and fresh basil.',
    perk: 'Live Stone Oven Dispatch Timeline',
  },
  {
    img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1920&auto=format&fit=crop&q=95',
    title: 'Farmhouse Garden Harvest',
    tag: 'Chef Signature Veg',
    highlight: 'Farm-fresh tricolor peppers, sweet corn, and caramelized sweet onions delivered piping hot to your door.',
    perk: '1-Click Razorpay Fast Checkout',
  },
  {
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&auto=format&fit=crop&q=95',
    title: 'Fiery Peri Peri Supreme',
    tag: 'Smoky & Spicy Kick',
    highlight: 'Bird’s eye chili marinara paired with sharp cheddar, fiery pickled jalapeños, and fresh spiced paneer cubes.',
    perk: 'Exclusive Member Tasting Perks',
  },
];

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

  // 3D Parallax & Depth State
  const [tilt, setTilt] = useState({ x: 0, y: 0, mouseX: 50, mouseY: 50 });
  const [isHovering, setIsHovering] = useState(false);

  // Full-Screen Pizza Slide Index
  const [slideIndex, setSlideIndex] = useState(0);

  const { register } = useAuth();

  // Mouse Parallax Tilt Tracker
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

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

  // Auto-cycle backdrop every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % REGISTER_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await register(name, email, password);
      if (res.success) {
        setRegistrationSuccess(res.data);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const activeSlide = REGISTER_SLIDES[slideIndex];

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
        {REGISTER_SLIDES.map((slide, idx) => {
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

      {/* ── Dynamic 3D Sunset Glow Spotlight ── */}
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
          { left: '30%', delay: '3s', dur: '15s', size: 'w-1.5 h-1.5', bg: 'bg-orange-400' },
          { left: '52%', delay: '1.5s', dur: '14s', size: 'w-2.5 h-2.5', bg: 'bg-rose-400' },
          { left: '70%', delay: '5s', dur: '13s', size: 'w-1 h-1', bg: 'bg-amber-300' },
          { left: '88%', delay: '2s', dur: '16s', size: 'w-2 h-2', bg: 'bg-orange-500' },
          { left: '42%', delay: '7s', dur: '18s', size: 'w-1.5 h-1.5', bg: 'bg-amber-400' },
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
          FOREGROUND CONTENT: 3D Showcase + Glass Register Card
      ═══════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-20">
        
        {/* ── LEFT PANEL (Desktop): Member Club Perks & 3D Showcase ── */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6 hidden lg:block text-white">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-200">
              Join Bella Club • VIP Membership
            </span>
          </div>

          {/* Active Pizza Title & Perk */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600/90 text-white backdrop-blur-md border border-orange-400/40 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>{activeSlide.tag}</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-serif font-black text-white leading-tight drop-shadow-2xl">
              {activeSlide.title}
            </h1>

            <div className="text-amber-300 text-sm font-mono font-bold flex items-center gap-2 drop-shadow">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Member Perk: {activeSlide.perk}</span>
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
              4.9/5 Customer Rating
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-400" />
              35-min Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Stone-Baked at 800°F
            </span>
          </div>

          {/* Interactive Slide Thumbnail Switcher */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-200/80 block font-bold">
              Explore Wood-Oven Creations:
            </span>
            <div className="flex items-center gap-3">
              {REGISTER_SLIDES.map((slide, idx) => (
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
                    <div className="text-[9px] text-amber-300 font-mono font-bold line-clamp-1">{slide.perk}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Floating Luxury Glass Register Card ── */}
        <div className="lg:col-span-6 xl:col-span-5 w-full max-w-lg mx-auto">
          <div className="glass-fade-card rounded-[2.5rem] p-7 sm:p-9 relative overflow-hidden space-y-6">
            
            {/* Top Subtle Sunset Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />

            {/* Form Header */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <PizzaLogoIcon size={42} />
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-600 block">
                      Pizzeria Bella • New Membership
                    </span>
                    <span className="text-xs font-bold text-stone-500">Wood-Fired Artisanal Kitchen</span>
                  </div>
                </div>

                {/* Mobile Slide Dot Indicators */}
                <div className="flex lg:hidden items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-full">
                  {REGISTER_SLIDES.map((_, idx) => (
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
                Create Account
              </h2>
              <p className="text-stone-600 text-xs font-medium leading-relaxed">
                Join Bella Club for custom pizza studio access, priority oven dispatch, and 1-click re-ordering.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-bold animate-card-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════
                REGISTRATION SUCCESS BANNER (With 1-Click Verification)
            ═══════════════════════════════════════════════════ */}
            {registrationSuccess ? (
              <div className="space-y-5 py-3 animate-card-fade-in">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div className="space-y-1.5 text-center">
                  <h3 className="text-2xl font-serif font-black text-stone-950">Verification Link Sent!</h3>
                  <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                    We've dispatched an email verification link to{' '}
                    <strong className="text-orange-700 font-mono font-bold">{registrationSuccess.email}</strong>.
                  </p>
                </div>

                {/* Instant 1-Click Verification Card for Local Evaluation */}
                <div className="p-4 bg-orange-50/90 rounded-2xl border border-orange-200/80 space-y-3 text-xs">
                  <div className="text-orange-800 font-mono font-bold uppercase text-[10px] tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    Instant Local Verification Link:
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Click the button below to verify your account right now without opening email:
                  </p>
                  <Link
                    to={`/verify-email/${registrationSuccess.verificationToken}`}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:to-orange-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sunset-sm hover:shadow-sunset-md active:scale-95"
                  >
                    <span>Click to Verify Email Instantly</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </Link>
                  {registrationSuccess.previewUrl && (
                    <a
                      href={registrationSuccess.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-600 hover:text-orange-800 text-[11px] flex items-center justify-center gap-1 pt-1 font-bold"
                    >
                      <span>Open Ethereal Mailbox Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="pt-2 text-center">
                  <Link
                    to="/login"
                    className="text-xs text-orange-600 hover:text-orange-800 underline font-black"
                  >
                    Proceed to Login Page →
                  </Link>
                </div>
              </div>
            ) : (
              /* ═══════════════════════════════════════════════════
                  REGISTRATION FORM
              ═══════════════════════════════════════════════════ */
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-stone-900 block font-mono uppercase tracking-wider text-[11px] font-black">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mario Rossi"
                      className="w-full bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl pl-10 pr-4 py-2.5 text-stone-950 font-bold text-sm focus:outline-none focus:bg-white/85 focus:border-orange-500 focus:ring-4 focus:ring-orange-400/20 shadow-xs transition-all placeholder:text-stone-400"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
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
                      placeholder="mario@example.com"
                      className="w-full bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl pl-10 pr-4 py-2.5 text-stone-950 font-bold text-sm focus:outline-none focus:bg-white/85 focus:border-orange-500 focus:ring-4 focus:ring-orange-400/20 shadow-xs transition-all placeholder:text-stone-400"
                    />
                  </div>
                </div>

                {/* Password Fields in 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-stone-900 block font-mono uppercase tracking-wider text-[11px] font-black">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl pl-10 pr-9 py-2.5 text-stone-950 font-bold text-sm focus:outline-none focus:bg-white/85 focus:border-orange-500 focus:ring-4 focus:ring-orange-400/20 shadow-xs transition-all placeholder:text-stone-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-stone-900 block font-mono uppercase tracking-wider text-[11px] font-black">
                      Confirm
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl pl-10 pr-9 py-2.5 text-stone-950 font-bold text-sm focus:outline-none focus:bg-white/85 focus:border-orange-500 focus:ring-4 focus:ring-orange-400/20 shadow-xs transition-all placeholder:text-stone-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1 cursor-pointer"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:to-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(249,115,22,0.35)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.5)] active:scale-98 transition-all disabled:opacity-60 cursor-pointer pt-3"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account & Join Club</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer Routing & Security Trust */}
            <div className="pt-2 border-t border-orange-100 text-center space-y-2">
              <p className="text-xs text-stone-600 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-orange-600 hover:text-orange-700 font-black hover:underline">
                  Sign In Here →
                </Link>
              </p>

              {/* Security Assurance */}
              <div className="pt-1 flex items-center justify-center gap-4 text-[10px] text-stone-400 font-mono">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  256-Bit SSL Encrypted
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Instant Member Perks
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
