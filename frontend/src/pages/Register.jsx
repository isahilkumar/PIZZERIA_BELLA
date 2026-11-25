import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PizzaLogoIcon } from '../components/BrandLogo';
import confetti from 'canvas-confetti';
import {
  Pizza,
  Lock,
  Mail,
  User,
  Smartphone,
  KeyRound,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
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
  RefreshCw,
  Edit2,
  PhoneCall,
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirect = searchParams.get('redirect') || '/';

  // Auth Mode: 'phone' (Mobile OTP) vs 'email' (Email & Password)
  const [authMode, setAuthMode] = useState('phone');

  // Common Fields
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Email Registration Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

  // Mobile Phone + OTP Registration Fields
  const [phone, setPhone] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [showPhonePassword, setShowPhonePassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpPreview, setOtpPreview] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [phoneSuccessUser, setPhoneSuccessUser] = useState(null);

  // 3D Parallax & Depth State
  const [tilt, setTilt] = useState({ x: 0, y: 0, mouseX: 50, mouseY: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const { register, registerWithPhone, verifyPhoneOtp } = useAuth();

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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

  // 1. Submit Email Registration
  const handleEmailSubmit = async (e) => {
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

  // 2. Submit Phone Number to Request OTP
  const handleSendPhoneOtp = async (e) => {
    e?.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number');
      return;
    }

    setLoading(true);

    try {
      const res = await registerWithPhone(name, cleanPhone, phonePassword);
      if (res.success) {
        setOtpSent(true);
        setOtpPreview(res.data?.otpPreview || '');
        setCountdown(60);
      } else {
        setError(res.message || 'Failed to dispatch verification code');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch OTP. Please verify your phone number.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP and Complete Phone Registration
  const handleVerifyPhoneOtp = async (e) => {
    e?.preventDefault();
    setError('');

    if (!otp || otp.length < 6) {
      setError('Please enter the complete 6-digit OTP code');
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phone.replace(/[\s-]/g, '');
      const res = await verifyPhoneOtp(cleanPhone, otp);

      if (res.success) {
        setPhoneSuccessUser(res.user);

        // Fire celebratory confetti!
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        setTimeout(() => {
          navigate(redirect);
        }, 1800);
      } else {
        setError(res.message || 'OTP verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code. Please try again.');
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
        {REGISTER_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              idx === slideIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={slide.img}
              alt={slide.title}
              className="w-full h-full object-cover object-center transform transition-transform duration-10000 ease-linear scale-105"
            />
            {/* Cinematic Multilayer Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/70" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/35 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-transparent to-black/75" />
          </div>
        ))}
      </div>

      {/* Floating 3D Depth Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/6 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl"
          style={{
            transform: `translate3d(${tilt.y * 3}px, ${tilt.x * 3}px, 50px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/6 w-80 h-80 rounded-full bg-rose-500/20 blur-3xl"
          style={{
            transform: `translate3d(${tilt.y * -2.5}px, ${tilt.x * -2.5}px, 30px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════
          MAIN TWO-COLUMN STAGE (Hero Story + Form)
      ═══════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* ── LEFT PANEL: Live Artisanal Slide Showcase ── */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between space-y-8 pr-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wider uppercase shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{activeSlide.tag}</span>
            </div>

            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-serif font-black text-white leading-tight tracking-tight drop-shadow-md">
              {activeSlide.title}
            </h1>

            <p className="text-base text-white/85 font-medium leading-relaxed max-w-xl drop-shadow">
              {activeSlide.highlight}
            </p>
          </div>

          {/* Quick Perks Badge */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 flex items-center gap-2.5 text-white shadow-lg">
              <Award className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <div className="text-[10px] text-white/60 font-mono uppercase tracking-wider">Perk Included</div>
                <div className="text-xs font-bold text-amber-300">{activeSlide.perk}</div>
              </div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 flex items-center gap-2 text-white/90 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant OTP & Secure Login</span>
            </div>
          </div>

          {/* Bottom Interactive Slide Strip */}
          <div className="space-y-2 pt-4">
            <div className="text-[11px] font-mono uppercase tracking-widest text-white/70 font-bold flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>Artisanal Wood-Fired Menu Showcase ({slideIndex + 1}/{REGISTER_SLIDES.length})</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {REGISTER_SLIDES.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => setSlideIndex(idx)}
                  className={`text-left p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                    idx === slideIndex
                      ? 'bg-white/25 border-orange-400 shadow-lg scale-102'
                      : 'bg-black/40 border-white/10 hover:bg-white/15 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="relative h-12 rounded-lg overflow-hidden mb-1.5">
                    <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" />
                    {idx === slideIndex && (
                      <div className="absolute inset-0 border-2 border-orange-400 rounded-lg pointer-events-none" />
                    )}
                  </div>
                  <div className="text-[11px] text-white font-bold truncate leading-tight">{slide.title}</div>
                  <div className="text-[9px] text-amber-300 font-mono font-bold line-clamp-1">{slide.perk}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Floating Luxury Glass Register Card ── */}
        <div className="lg:col-span-6 xl:col-span-5 w-full max-w-lg mx-auto">
          <div className="glass-fade-card rounded-[2.5rem] p-7 sm:p-9 relative overflow-hidden space-y-5">
            
            {/* Top Subtle Sunset Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />

            {/* Form Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <PizzaLogoIcon size={40} />
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

            {/* ═══════════════════════════════════════════════════
                AUTHENTICATION MODE SWITCHER: MOBILE OTP VS EMAIL
            ═══════════════════════════════════════════════════ */}
            {!phoneSuccessUser && !registrationSuccess && (
              <div className="grid grid-cols-2 p-1 bg-stone-100/90 rounded-2xl border border-stone-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('phone');
                    setError('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMode === 'phone'
                      ? 'bg-white text-stone-950 shadow-sm border border-stone-200'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Smartphone className={`w-3.5 h-3.5 ${authMode === 'phone' ? 'text-sunset-500' : ''}`} />
                  <span>Mobile + OTP</span>
                  <span className="text-[9px] bg-orange-100 text-sunset-700 px-1.5 py-0.2 rounded-full font-bold">Fast</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('email');
                    setError('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMode === 'email'
                      ? 'bg-white text-stone-950 shadow-sm border border-stone-200'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Mail className={`w-3.5 h-3.5 ${authMode === 'email' ? 'text-sunset-500' : ''}`} />
                  <span>Email & Password</span>
                </button>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-bold animate-card-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════
                MODE A: MOBILE PHONE + OTP VERIFICATION
            ═══════════════════════════════════════════════════ */}
            {authMode === 'phone' ? (
              phoneSuccessUser ? (
                /* Phone Registration Success State */
                <div className="space-y-4 py-4 text-center animate-card-fade-in">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-serif font-black text-stone-950">Registration Complete!</h3>
                    <p className="text-xs text-stone-600">
                      Welcome to Bella Club, <strong className="text-orange-600">{phoneSuccessUser.name}</strong>!
                    </p>
                    <p className="text-[11px] text-stone-400">Mobile verified • Redirecting you to the kitchen...</p>
                  </div>
                  <div className="pt-2">
                    <div className="w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                </div>
              ) : !otpSent ? (
                /* Step 1: Input Name & Mobile Phone Number */
                <form onSubmit={handleSendPhoneOtp} className="space-y-3.5">
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
                        placeholder="Sahil Kumar"
                        className="w-full bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl pl-10 pr-4 py-2.5 text-stone-950 font-bold text-sm focus:outline-none focus:bg-white/85 focus:border-orange-500 focus:ring-4 focus:ring-orange-400/20 shadow-xs transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  {/* Mobile Phone Number */}
                  <div className="space-y-1">
                    <label className="text-stone-900 block font-mono uppercase tracking-wider text-[11px] font-black">
                      Mobile Phone Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none border-r border-stone-300 pr-2">
                        <Smartphone className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-mono font-black text-stone-700">+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                        placeholder="98765 43210"
                        className="w-full bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl pl-20 pr-4 py-2.5 text-stone-950 font-bold text-sm focus:outline-none focus:bg-white/85 focus:border-orange-500 focus:ring-4 focus:ring-orange-400/20 shadow-xs transition-all placeholder:text-stone-400 font-mono tracking-wider"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 pl-1">
                      We'll dispatch a 6-digit verification code to this number.
                    </p>
                  </div>

                  {/* Optional Password */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-stone-900 block font-mono uppercase tracking-wider text-[11px] font-black">
                        Password <span className="text-stone-400 font-normal lowercase">(Optional)</span>
                      </label>
                      <span className="text-[10px] text-stone-400 font-mono">For password logins</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPhonePassword ? 'text' : 'password'}
                        value={phonePassword}
                        onChange={(e) => setPhonePassword(e.target.value)}
                        placeholder="Create password (optional)"
                        className="w-full bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl pl-10 pr-9 py-2.5 text-stone-950 font-bold text-sm focus:outline-none focus:bg-white/85 focus:border-orange-500 focus:ring-4 focus:ring-orange-400/20 shadow-xs transition-all placeholder:text-stone-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPhonePassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1 cursor-pointer"
                      >
                        {showPhonePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Send OTP Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sunset-rose via-sunset-500 to-sunset-gold hover:from-rose-600 hover:to-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(249,115,22,0.35)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.5)] active:scale-98 transition-all disabled:opacity-60 cursor-pointer pt-3"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code (OTP)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter & Verify 6-Digit OTP */
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-4 animate-card-fade-in">
                  <div className="p-3.5 bg-orange-50/90 rounded-2xl border border-orange-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                        Code dispatched to
                      </div>
                      <div className="text-xs font-mono font-black text-orange-900 mt-0.5">
                        +91 {phone}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                        setError('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-[11px] font-bold text-stone-700 hover:text-orange-600 flex items-center gap-1 cursor-pointer transition"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Real-time SMS Message Notification Mockup & 1-Click Auto-Fill */}
                  {otpPreview && (
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/90 rounded-2xl border-2 border-orange-300 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-orange-950 flex items-center gap-1">
                            <span>💬 SMS Dispatch to +91 {phone}</span>
                          </span>
                        </div>
                        <span className="text-[10px] bg-orange-200/80 text-orange-800 px-2 py-0.5 rounded-full font-mono font-bold">
                          Just now
                        </span>
                      </div>

                      <div className="bg-white/90 p-3 rounded-xl border border-orange-200 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-stone-500 font-medium">Your 6-digit verification code:</div>
                          <div className="text-xl font-mono font-black text-stone-950 tracking-[0.25em]">
                            {otpPreview}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setOtp(otpPreview)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sunset-rose to-sunset-500 hover:from-rose-600 hover:to-orange-500 text-white font-black text-xs shadow-xs cursor-pointer transition active:scale-95 flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Tap to Auto-Fill</span>
                        </button>
                      </div>

                      <p className="text-[10px] text-stone-500 leading-tight">
                        💡 SMS dispatched via server gateway. Click <strong>Tap to Auto-Fill</strong> or enter the code below to complete registration.
                      </p>
                    </div>
                  )}

                  {/* 6-Digit OTP Input */}
                  <div className="space-y-1.5">
                    <label className="text-stone-900 block font-mono uppercase tracking-wider text-[11px] font-black text-center">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        autoFocus
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="••••••"
                        className="w-full bg-white/80 backdrop-blur-md border border-stone-300 rounded-2xl pl-10 pr-4 py-3 text-stone-950 font-mono font-black text-xl text-center tracking-[0.5em] focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-400/20 shadow-xs transition-all placeholder:text-stone-300"
                      />
                    </div>
                  </div>

                  {/* Verify & Register Button */}
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sunset-rose via-sunset-500 to-sunset-gold hover:from-rose-600 hover:to-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(249,115,22,0.35)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.5)] active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Verify OTP & Complete Registration</span>
                      </>
                    )}
                  </button>

                  {/* Resend OTP */}
                  <div className="text-center pt-1">
                    {countdown > 0 ? (
                      <span className="text-[11px] font-mono text-stone-400">
                        Resend code in <strong className="text-orange-600">{countdown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-800 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend OTP Code</span>
                      </button>
                    )}
                  </div>
                </form>
              )
            ) : (
              /* ═══════════════════════════════════════════════════
                  MODE B: EMAIL & PASSWORD REGISTRATION
              ═══════════════════════════════════════════════════ */
              registrationSuccess ? (
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

                  {/* Instant 1-Click Verification Link */}
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
                <form onSubmit={handleEmailSubmit} className="space-y-3.5">
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

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

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
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

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
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )
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
