import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PizzaLogoIcon } from '../components/BrandLogo';
import {
  Crown,
  Sparkles,
  Flame,
  Award,
  Gift,
  Clock,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Star,
  ShieldCheck,
  Zap,
  Tag,
  ExternalLink,
} from 'lucide-react';

const CLUB_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&auto=format&fit=crop&q=95',
    title: 'Wood-Fired Truffle Sourdough',
    tag: 'VIP Kitchen Privileges',
  },
  {
    img: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=1920&auto=format&fit=crop&q=95',
    title: 'Napoli San Marzano D.O.P.',
    tag: 'Secret Menu Access',
  },
  {
    img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1920&auto=format&fit=crop&q=95',
    title: 'Farmhouse Garden Harvest',
    tag: 'Priority Hearth Baking',
  },
];

const CLUB_PERKS = [
  {
    icon: Tag,
    title: '20% Off Welcome Voucher',
    desc: 'Instant discount applied to your first artisanal sourdough pizza.',
    badge: 'Instant Gift',
  },
  {
    icon: Flame,
    title: 'Priority Hearth Queue',
    desc: 'Your pizzas get loaded into our 800°F stone oven ahead of regular tickets.',
    badge: 'Kitchen VIP',
  },
  {
    icon: Gift,
    title: 'Complimentary Truffle Dips',
    desc: 'Free roasted garlic butter & hot honey drizzle on every custom order.',
    badge: 'Chef Perk',
  },
  {
    icon: Crown,
    title: 'Annual Birthday Pizza',
    desc: 'Celebrate your special day with a complimentary 12" signature pizza.',
    badge: 'Member Exclusive',
  },
  {
    icon: Sparkles,
    title: 'Secret Menu Access',
    desc: 'Taste and vote on monthly experimental crusts and sauces before launch.',
    badge: 'Early Access',
  },
  {
    icon: Zap,
    title: 'Zero Delivery Fees',
    desc: 'Unlimited free doorstep delivery on all artisan orders over ₹499.',
    badge: 'Free Shipping',
  },
];

export default function JoinClub() {
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinedSuccess, setJoinedSuccess] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState(null);

  // Active slide index
  const [slideIdx, setSlideIdx] = useState(0);

  // 3D Parallax & Card Tilt State
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % CLUB_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e) => {
    if (animFrameRef.current) return;
    animFrameRef.current = requestAnimationFrame(() => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xPct = (clientX / innerWidth) * 100;
      const yPct = (clientY / innerHeight) * 100;
      setMousePos({ x: xPct, y: yPct });

      // Subtle tilt for membership card
      const tiltX = (clientY / innerHeight - 0.5) * -12;
      const tiltY = (clientX / innerWidth - 0.5) * 12;
      setCardTilt({ x: tiltX, y: tiltY });
      animFrameRef.current = null;
    });
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res && res.success) {
        setJoinedSuccess(true);
        if (res.previewUrl) {
          setVerificationNotice(res.previewUrl);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Membership registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden pt-24 pb-12 select-none"
    >
      {/* Dynamic 4K Wood-Fired Pizza Background Slides */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        {CLUB_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 transform scale-105 ${
              idx === slideIdx ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${slide.img})`,
              filter: 'brightness(0.38) saturate(1.2) contrast(1.1)',
            }}
          />
        ))}

        {/* Cinematic Vignette & Radial Spotlight */}
        <div
          className="absolute inset-0 transition-all duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle 900px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 120, 40, 0.22) 0%, rgba(20, 8, 4, 0.75) 60%, rgba(10, 4, 2, 0.94) 100%)`,
          }}
        />

        {/* Warm Ember Particles Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-rose-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header Hero Pill */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/25 to-amber-500/25 border border-orange-400/40 text-amber-300 text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-lg shadow-orange-500/10">
            <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Pizzeria Bella VIP Hearth Society</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black text-white tracking-tight leading-tight drop-shadow-md">
            Join the Club. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400">
              Taste Pizza Like Royalty.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-stone-200 font-bold max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            Unlock secret wood-fired recipes, priority hearth baking queues, complimentary artisanal truffle dips, and 20% off your first custom sourdough order.
          </p>
        </div>

        {/* 2-Column Grid: Left (3D Digital VIP Card & Perks), Right (Instant Sign-Up Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: 3D Holographic VIP Membership Card & Perks */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* 3D Holographic Digital Membership Card */}
            <div
              className="relative rounded-3xl p-7 sm:p-8 text-white shadow-2xl transition-transform duration-200 ease-out border border-white/30 backdrop-blur-2xl overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 110, 40, 0.85) 0%, rgba(220, 38, 38, 0.75) 50%, rgba(180, 83, 9, 0.85) 100%)',
                transform: `perspective(1000px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
                boxShadow: '0 30px 60px -15px rgba(249, 115, 22, 0.45), 0 0 40px rgba(251, 191, 36, 0.25)',
              }}
            >
              {/* Shimmer light bar across card */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-2xl shadow-inner">
                    🍕
                  </div>
                  <div>
                    <div className="font-serif font-black text-lg tracking-wider text-white">
                      PIZZERIA BELLA
                    </div>
                    <div className="text-[10px] font-mono tracking-widest text-amber-200 uppercase font-bold">
                      Napoli Hearth VIP Society
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 border border-white/40 text-white font-mono text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                  <Crown className="w-3.5 h-3.5 text-amber-200" />
                  <span>VIP Member</span>
                </div>
              </div>

              {/* Gold Chip & Contactless Indicator */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-100 shadow-md flex items-center justify-center">
                  <div className="w-7 h-5 border border-amber-800/40 rounded flex flex-col justify-between p-0.5 opacity-60">
                    <div className="border-b border-amber-800/40 h-1"></div>
                    <div className="border-b border-amber-800/40 h-1"></div>
                  </div>
                </div>
                <div className="text-white/60 text-xs font-mono">))) Contactless Sourdough Pass</div>
              </div>

              {/* Dynamic Live Member Preview */}
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-mono uppercase text-amber-200 tracking-widest font-black">
                    Club Member ID
                  </div>
                  <div className="font-mono font-black text-xl sm:text-2xl text-white tracking-widest">
                    PB • 2026 • 8849
                  </div>
                </div>

                <div className="flex justify-between items-end pt-2 border-t border-white/25">
                  <div>
                    <div className="text-[9px] font-mono uppercase text-amber-200 tracking-wider font-bold">
                      Cardholder Name
                    </div>
                    <div className="font-serif font-black text-base text-white capitalize tracking-wide">
                      {name.trim() || user?.name || 'Artisan Guest'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[9px] font-mono uppercase text-amber-200 tracking-wider font-bold">
                      Valid Hearth Year
                    </div>
                    <div className="font-mono font-black text-xs text-white">
                      PERPETUAL / 2026+
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Club Perks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CLUB_PERKS.map((perk, idx) => {
                const IconComponent = perk.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-orange-400/60 transition-all hover:-translate-y-0.5 shadow-lg space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500/40 to-rose-500/40 border border-orange-300/40 flex items-center justify-center text-amber-300">
                        <IconComponent className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-amber-200 border border-white/20">
                        {perk.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white">{perk.title}</h3>
                    <p className="text-[11px] text-stone-300 font-semibold leading-relaxed">
                      {perk.desc}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT COLUMN: Membership Signup Form */}
          <div className="lg:col-span-6">
            <div className="glass-modal-card rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6 text-stone-900 border border-white/80">
              
              {joinedSuccess ? (
                /* Success State Screen */
                <div className="text-center py-8 space-y-5 animate-scale-up">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-4xl mx-auto shadow-xl shadow-emerald-500/30">
                    👑
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                      Welcome to the Society
                    </span>
                    <h2 className="text-3xl font-serif font-black text-stone-950">
                      You are Officially a VIP!
                    </h2>
                    <p className="text-xs text-stone-700 font-bold max-w-sm mx-auto">
                      Your VIP membership card is now active. Your 20% welcome discount has been loaded into your account.
                    </p>
                  </div>

                  {verificationNotice && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2">
                      <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-orange-600" />
                        <span>Verification Email Dispatched</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        We sent a secure activation link to <strong>{email}</strong>.
                      </p>
                      <a
                        href={verificationNotice}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-black text-orange-700 hover:text-orange-900 underline"
                      >
                        Preview Verification Link ↗
                      </a>
                    </div>
                  )}

                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate('/custom-builder')}
                      className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Launch Custom Pizza Studio</span>
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="py-3.5 px-6 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-black text-xs transition cursor-pointer"
                    >
                      Explore Menu
                    </button>
                  </div>
                </div>
              ) : isAuthenticated ? (
                /* Already Authenticated Member State */
                <div className="text-center py-8 space-y-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center text-3xl mx-auto shadow-lg shadow-orange-500/20">
                    ✨
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-black uppercase tracking-widest text-orange-700 bg-orange-100 px-3 py-1 rounded-full border border-orange-300">
                      Active Member
                    </span>
                    <h2 className="text-2xl font-serif font-black text-stone-950">
                      Welcome Back, {user?.name}!
                    </h2>
                    <p className="text-xs text-stone-600 font-bold max-w-sm mx-auto">
                      You are already enjoying all VIP Hearth privileges. Your membership card PB-2026-8849 is active.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col gap-3 max-w-xs mx-auto">
                    <Link
                      to="/custom-builder"
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Craft a Custom Pizza</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-black text-xs transition text-center"
                    >
                      View Live Orders
                    </Link>
                  </div>
                </div>
              ) : (
                /* VIP Membership Registration Form */
                <>
                  <div className="border-b border-orange-200/60 pb-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-orange-600">
                        Instant 1-Click Enrollment
                      </span>
                      <span className="text-[10px] font-mono font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                        Free Lifetime Pass
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">
                      Claim Your VIP Membership
                    </h2>
                    <p className="text-xs text-stone-600 font-semibold">
                      Fill out the fields below. Watch your name appear live on your digital VIP card!
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2 animate-shake">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleJoin} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-stone-800 mb-1.5">
                        Cardholder Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Mario Rossi"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-stone-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-xs font-bold text-stone-950 outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-stone-800 mb-1.5">
                        Email Address (For Dispatches & Perks)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="mario@example.com"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-stone-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-xs font-bold text-stone-950 outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-stone-800 mb-1.5">
                          Create Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-stone-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-xs font-bold text-stone-950 outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-stone-800 mb-1.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-stone-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-xs font-bold text-stone-950 outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Minting Your VIP Membership Pass...</span>
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 text-amber-200" />
                          <span>Join the Club & Activate 20% Off</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="pt-2 text-center text-xs text-stone-600 font-bold border-t border-orange-200/40">
                    Already an enrolled member?{' '}
                    <Link to="/login" className="text-orange-600 font-black hover:underline">
                      Sign In here →
                    </Link>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Subtle Bottom Credit */}
      <div className="relative z-10 text-center text-[11px] font-mono text-stone-400 mt-12">
        Pizzeria Bella Napoli Hearth VIP Society • Handcrafted in Napoli Est. 1889
      </div>
    </div>
  );
}
