import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PizzaPlateVisualizer from '../components/PizzaPlateVisualizer';
import WelcomeLanding from '../components/WelcomeLanding';
import {
  Sparkles,
  Flame,
  Clock,
  ShieldCheck,
  ChevronRight,
  Plus,
  Check,
  Sliders,
  Award,
  Leaf,
  Heart,
  Star,
  ArrowRight,
  RotateCcw,
  ShoppingBag,
  Layers,
  Search,
  X,
  Minus,
  Eye,
  Info,
  UtensilsCrossed,
} from 'lucide-react';

// Hero pizza slides — HD real food photos (1920px, q=95) with metadata
const HERO_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&auto=format&fit=crop&q=95&sat=20',
    badge: 'Wood-Fired Neapolitan',
    tag: 'Fresh Mozzarella',
    name: 'Truffle Forest Mushroom',
    price: '₹520',
    desc: 'Sourdough crust, garlic alfredo, smoked provolone & baby spinach',
  },
  {
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&auto=format&fit=crop&q=95&sat=20',
    badge: '48-hr Cold Fermented',
    tag: 'Stone Baked',
    name: 'Margherita Classica',
    price: '₹299',
    desc: 'San Marzano tomato, buffalo mozzarella & fresh basil',
  },
  {
    img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1920&auto=format&fit=crop&q=95&sat=20',
    badge: "Chef's Signature",
    tag: 'Spicy Arrabbiata',
    name: 'Pepperoni Diavola',
    price: '₹420',
    desc: 'Double pepperoni, chilli flakes, smoked cheese & basil oil',
  },
  {
    img: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=1920&auto=format&fit=crop&q=95&sat=20',
    badge: 'Garden Fresh',
    tag: 'Veg Supreme',
    name: 'Pesto Garden Royale',
    price: '₹359',
    desc: 'Basil pesto, roasted peppers, olives & sun-dried tomatoes',
  },
  {
    img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1920&auto=format&fit=crop&q=95&sat=20',
    badge: 'Crowd Favourite',
    tag: 'Cheese Pull Guaranteed',
    name: 'Cheese Burst BBQ',
    price: '₹449',
    desc: 'Stuffed cheese crust, smoky BBQ sauce & crispy onions',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [addedNotice, setAddedNotice] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);

  // Cinematic Welcome Landing Gate
  const [showWelcome, setShowWelcome] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('welcome') === 'true') return true;
    return !sessionStorage.getItem('pizzeria_welcomed');
  });

  const handleEnterWebsite = () => {
    sessionStorage.setItem('pizzeria_welcomed', 'true');
    setShowWelcome(false);
  };

  // 3D Parallax & Depth State
  const [tilt, setTilt] = useState({ x: 0, y: 0, mouseX: 65, mouseY: 45 });
  const [isHovering, setIsHovering] = useState(false);
  const animFrameRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Smooth 3D tilt angles
    const tiltX = ((y - centerY) / centerY) * -6;
    const tiltY = ((x - centerX) / centerX) * 6;
    const mouseXPercent = (x / rect.width) * 100;
    const mouseYPercent = (y / rect.height) * 100;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      setTilt({ x: tiltX, y: tiltY, mouseX: mouseXPercent, mouseY: mouseYPercent });
      setIsHovering(true);
    });
  };

  const handleMouseLeave = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsHovering(false);
    setTilt((prev) => ({ ...prev, x: 0, y: 0 }));
  };

  const { addToCart, cartItems = [], updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();

  // Search, Sort, Favorites, and Quick View Modal
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fav_pizzas') || '[]');
    } catch {
      return [];
    }
  });
  const [quickViewPizza, setQuickViewPizza] = useState(null);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('fav_pizzas', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const res = await API.get('/pizzas');
        if (res.data.success) {
          setPizzas(res.data.pizzas);
        }
      } catch (err) {
        console.error('Failed to load pizzas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPizzas();
  }, [isAuthenticated]);

  // Hero auto-cycle every 9 seconds with true seamless crossfade (no black screen / fade gap)
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (idx) => {
    if (idx === heroIndex) return;
    setHeroIndex(idx);
  };

  const slide = HERO_SLIDES[heroIndex];

  const handleAddVarietyToCart = (pizza) => {
    const item = {
      itemType: 'variety',
      pizzaVarietyId: pizza._id,
      name: pizza.name,
      base: {
        id: pizza.defaultBase?._id,
        name: pizza.defaultBase?.name || 'Hand Tossed Thin Crust',
        price: pizza.defaultBase?.price || 0,
      },
      sauce: {
        id: pizza.defaultSauce?._id,
        name: pizza.defaultSauce?.name || 'Classic San Marzano',
        price: pizza.defaultSauce?.price || 0,
      },
      cheese: {
        id: pizza.defaultCheese?._id,
        name: pizza.defaultCheese?.name || 'Fresh Mozzarella',
        price: pizza.defaultCheese?.price || 0,
      },
      veggies: (pizza.defaultVeggies || []).map((v) => ({
        id: v._id,
        name: v.name,
        price: v.price || 0,
      })),
      quantity: 1,
      unitPrice: pizza.basePrice,
      itemTotal: pizza.basePrice,
    };

    addToCart(item);
    setAddedNotice(pizza.name);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  const filteredPizzas = pizzas
    .filter((pizza) => {
      if (filter === 'veg' && !pizza.isVegetarian) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = pizza.name?.toLowerCase().includes(q);
        const matchTag = pizza.tagline?.toLowerCase().includes(q);
        const matchDesc = pizza.description?.toLowerCase().includes(q);
        const matchBase = pizza.defaultBase?.name?.toLowerCase().includes(q);
        const matchSauce = pizza.defaultSauce?.name?.toLowerCase().includes(q);
        const matchCheese = pizza.defaultCheese?.name?.toLowerCase().includes(q);
        if (!matchName && !matchTag && !matchDesc && !matchBase && !matchSauce && !matchCheese) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      return 0;
    });

  // Animated numeric counter for the catalog heading
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    const target = filteredPizzas.length;
    if (target === 0) {
      setAnimatedCount(0);
      return;
    }
    let current = 0;
    const intervalTime = Math.max(30, Math.floor(350 / target));
    const timer = setInterval(() => {
      current += 1;
      setAnimatedCount(current);
      if (current >= target) {
        clearInterval(timer);
      }
    }, intervalTime);
    return () => clearInterval(timer);
  }, [filteredPizzas.length]);

  return (
    <div className="space-y-24 pb-28">
      {/* ── BREATHTAKING CINEMATIC WELCOME LANDING PORTAL ── */}
      {showWelcome && (
        <WelcomeLanding onEnter={handleEnterWebsite} />
      )}

      {/* ═══════════════════════════════════════════════════
          ECOMMERCE HERO — 3D Parallax & Depth Immersion
      ═══════════════════════════════════════════════════ */}
      <section
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full min-h-screen flex flex-col overflow-hidden select-none"
        style={{ perspective: '1200px' }}
      >

        {/* ── 3D Transformed Background Stage ── */}
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
          {HERO_SLIDES.map((s, idx) => {
            const isActive = idx === heroIndex;
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
                  src={s.img}
                  alt={s.name}
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
              ? `radial-gradient(circle 650px at ${tilt.mouseX}% ${tilt.mouseY}%, rgba(249, 115, 22, 0.22) 0%, rgba(244, 63, 94, 0.10) 35%, transparent 75%)`
              : 'radial-gradient(circle 700px at 70% 40%, rgba(249, 115, 22, 0.15) 0%, transparent 70%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* ── Floating 3D Stone Oven Embers ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-15">
          {[
            { left: '15%', delay: '0s', dur: '12s', size: 'w-2 h-2', bg: 'bg-amber-400' },
            { left: '35%', delay: '3s', dur: '15s', size: 'w-1.5 h-1.5', bg: 'bg-orange-400' },
            { left: '60%', delay: '1.5s', dur: '14s', size: 'w-2.5 h-2.5', bg: 'bg-rose-400' },
            { left: '78%', delay: '5s', dur: '13s', size: 'w-1 h-1', bg: 'bg-amber-300' },
            { left: '90%', delay: '2s', dur: '16s', size: 'w-2 h-2', bg: 'bg-orange-500' },
            { left: '48%', delay: '7s', dur: '18s', size: 'w-1.5 h-1.5', bg: 'bg-amber-400' },
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

        {/* ── Layered gradient overlays for depth & readability ── */}
        {/* Strong left panel for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-950/92 via-orange-950/70 to-orange-900/10 z-10 pointer-events-none" />
        {/* Bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-orange-950/80 to-transparent z-10 pointer-events-none" />
        {/* Subtle top fade */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-orange-950/30 to-transparent z-10 pointer-events-none" />

        {/* ── Slide progress bar (top) ── */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-white/10 z-30 overflow-hidden">
          <div
            key={heroIndex}
            className="h-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400"
            style={{
              animation: 'slideProgress 9s linear forwards',
            }}
          />
        </div>

        {/* ── MAIN HERO CONTENT ── */}
        <div className="relative z-20 flex-1 flex items-center pointer-events-auto">
          <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16 py-20 lg:py-28 pointer-events-auto">
            <div className="max-w-2xl lg:max-w-3xl space-y-7 relative z-30 pointer-events-auto">

              {/* Eyebrow label */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/25 border border-orange-400/40 text-amber-300 text-[11px] font-black tracking-widest uppercase backdrop-blur-sm">
                  <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                  900°F Stone Oven
                </span>
                <span
                  key={heroIndex}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-[11px] font-bold backdrop-blur-sm animate-fade-in"
                >
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                  <span>Now Baking: <strong className="text-amber-300 font-extrabold">{slide.name}</strong></span>
                </span>
              </div>

              {/* Primary headline */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-serif font-black text-white leading-[1.0] tracking-tight drop-shadow-2xl">
                  Slow-Proofed{' '}
                  <span className="block">
                    Dough,{' '}
                    <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-amber-300">
                      Baked in
                    </em>
                  </span>
                  <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">
                    Sunset Embers.
                  </em>
                </h1>
                <p className="text-white/75 text-base sm:text-lg lg:text-xl max-w-xl leading-relaxed font-normal">
                  Every pie starts with 48-hour cold-fermented sourdough, sweet San Marzano plum tomatoes, and velvety buffalo mozzarella. Savor our signature catalog or sculpt your own custom creation.
                </p>
              </div>

              {/* Social proof row */}
              <div className="flex flex-wrap items-center gap-4 py-1">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow" />
                  ))}
                  <span className="text-white font-extrabold text-sm ml-1">4.9</span>
                  <span className="text-white/50 text-xs ml-0.5">(12k+ reviews)</span>
                </div>
                <span className="w-px h-4 bg-white/25" />
                <span className="text-white/70 text-sm">🛵 35 min avg delivery</span>
                <span className="w-px h-4 bg-white/25" />
                <span className="text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> #1 Artisanal Pizzeria
                </span>
              </div>

              {/* CTA row */}
              <div className="flex flex-wrap items-center gap-4 pt-2 relative z-30">
                <Link
                  to="/custom-builder"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/custom-builder');
                  }}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 shadow-[0_8px_32px_rgba(249,115,22,0.45)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.6)] hover:scale-[1.03] active:scale-95 transition-all duration-300 group cursor-pointer relative z-30 pointer-events-auto"
                >
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Launch Custom Pizza Studio
                </Link>
                <a
                  href="#menu-catalog"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('menu-catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm text-white/90 bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/50 backdrop-blur-sm transition-all duration-300 group cursor-pointer relative z-30 pointer-events-auto"
                >
                  Explore Signature Catalog
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Trust strip */}
              <div className="flex flex-wrap items-center gap-5 pt-4 border-t border-white/15">
                {[
                  { icon: Clock, label: '35 min', sub: 'Stone Oven to Door' },
                  { icon: Leaf, label: '100%', sub: 'Live Kitchen Stock' },
                  { icon: ShieldCheck, label: 'Razorpay', sub: 'Safe Test Checkout' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-amber-300 shrink-0" />
                    <div>
                      <div className="text-white text-sm font-black leading-none">{label}</div>
                      <div className="text-white/50 text-[10px] mt-0.5">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Floating added notice */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-sunset-400 text-orange-900 px-5 py-4 rounded-2xl shadow-sunset-lg flex items-center gap-3.5 animate-slide-up backdrop-blur-xl">
          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-sunset-rose to-sunset-500 text-white flex items-center justify-center font-bold shadow-sunset-sm">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-orange-900">Added to Cart!</div>
            <div className="text-[11px] text-orange-500">{addedNotice} is waiting in your pizza box.</div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MENU CATALOG SECTION — Perfected Artisanal Ecommerce Experience
      ═══════════════════════════════════════════════════ */}
      <section id="menu-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-28">
        {/* Header Block with Live Counter */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-orange-200/80 pb-6">
          <div className="space-y-2.5">
            <div className="text-orange-600 font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-spin-slow" />
              <span>Wood-Fired Artisanal Selection • Napoli Masterclass</span>
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              <h2 className="text-3xl sm:text-5xl font-serif font-black text-stone-950 tracking-tight">
                The Artisan Oven Catalog
              </h2>

              {/* Dynamic Live Animated Counter Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 border border-orange-300 shadow-sm backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                </span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-orange-700">Live Menu:</span>
                <span key={animatedCount} className="text-base font-serif font-black text-stone-950 tabular-nums animate-number-pop">
                  {animatedCount < 10 ? `0${animatedCount}` : animatedCount}
                </span>
                <span className="text-xs font-bold text-stone-600">Pies Ready to Bake</span>
              </div>
            </div>

            <p className="text-stone-600 font-medium text-sm max-w-2xl leading-relaxed">
              Slow-fermented for 48 hours and flash-baked at 800°F. Add chef favorites directly to your order or fine-tune individual layers in our interactive pizza studio.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-orange-200 shadow-sm text-xs font-bold text-stone-700">
            <span className="flex items-center gap-1 text-orange-700 px-2 py-1 bg-orange-100/60 rounded-xl">
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              800°F Stone Oven
            </span>
            <span className="w-px h-4 bg-orange-200" />
            <span className="flex items-center gap-1 text-emerald-800 px-2 py-1 bg-emerald-100/60 rounded-xl">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              100% Pure Veg
            </span>
            <span className="w-px h-4 bg-orange-200" />
            <span className="flex items-center gap-1 text-amber-800 px-2 py-1 bg-amber-100/60 rounded-xl">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              4.9/5 Rating
            </span>
          </div>
        </div>

        {/* ── Search, Filters & Sorting Toolbar ── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-orange-50/60 p-3 rounded-2xl border border-orange-200/80">
          {/* Real-time Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, crust, sauce or cheese..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white text-stone-900 placeholder:text-stone-400 text-xs font-bold border border-orange-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-400/20 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter: All */}
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1.5 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white shadow-sunset-sm scale-102'
                  : 'bg-white text-stone-700 hover:text-stone-950 border border-orange-200 hover:bg-orange-100/50'
              }`}
            >
              <span>All Pizzas</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                filter === 'all' ? 'bg-white/25 text-white' : 'bg-orange-100 text-orange-800'
              }`}>
                {pizzas.length}
              </span>
            </button>

            {/* Filter: 100% Veg */}
            <button
              onClick={() => setFilter('veg')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1.5 ${
                filter === 'veg'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm scale-102'
                  : 'bg-white text-stone-700 hover:text-stone-950 border border-orange-200 hover:bg-emerald-50'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Veg</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                filter === 'veg' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {pizzas.filter((p) => p.isVegetarian).length}
              </span>
            </button>

            {/* Filter: Saved Favorites (if any) */}
            {favorites.length > 0 && (
              <button
                onClick={() => setSearchQuery(favorites.length ? '' : '')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 flex items-center gap-1.5 transition-all"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>Saved ({favorites.length})</span>
              </button>
            )}

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 px-3 rounded-xl bg-white text-stone-800 text-xs font-bold border border-orange-200 focus:outline-none focus:border-orange-500 cursor-pointer shadow-sm"
            >
              <option value="featured">Featured Chef Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* ── Catalog Grid with Staggered Entrance & Transitions ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-3xl bg-white border border-orange-200 animate-pulse shadow-sm"></div>
            ))}
          </div>
        ) : filteredPizzas.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-dashed border-orange-300 p-8">
            <span className="text-4xl">🍕</span>
            <h3 className="font-serif font-black text-xl text-stone-900">No artisan pizzas match your filter</h3>
            <p className="text-stone-500 text-xs max-w-sm mx-auto">
              We couldn't find any pizza matching "{searchQuery}". Try searching for San Marzano, Pesto, Thin Crust, or Mozzarella.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilter('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPizzas.map((pizza, idx) => {
              const inCartItem = cartItems.find((it) => it.pizzaVarietyId === pizza._id);
              const isFav = favorites.includes(pizza._id);

              return (
                <div
                  key={pizza._id}
                  className="animate-card-fade-in bg-white rounded-3xl overflow-hidden border border-orange-200/90 shadow-[0_4px_20px_rgba(234,88,12,0.06)] hover:shadow-[0_24px_50px_rgba(234,88,12,0.18)] hover:border-orange-400/90 transition-all duration-400 hover:-translate-y-2 flex flex-col group cursor-pointer relative"
                  style={{ animationDelay: `${idx * 80}ms` }}
                  onClick={() => setQuickViewPizza(pizza)}
                >
                  {/* Photo & Tag Badges */}
                  <div className="relative h-64 overflow-hidden bg-orange-100">
                    <img
                      src={pizza.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80'}
                      alt={pizza.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-85 group-hover:opacity-65 transition-opacity"></div>

                    {/* Top-Left: Pure Veg Badge */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-white/95 backdrop-blur-md text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        100% Veg
                      </span>
                    </div>

                    {/* Top-Right: Wishlist Heart & Bestseller Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-stone-950/80 backdrop-blur-md text-amber-300 border border-amber-400/30 flex items-center gap-1 shadow-sm">
                        <Flame className="w-3 h-3 text-amber-400" />
                        Stone-Baked
                      </span>

                      {/* Wishlist Heart Button */}
                      <button
                        onClick={(e) => toggleFavorite(pizza._id, e)}
                        className={`w-7 h-7 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 shadow-sm ${
                          isFav
                            ? 'bg-rose-500 text-white border-rose-400 scale-110 shadow-rose-500/40'
                            : 'bg-white/85 hover:bg-white text-stone-700 hover:text-rose-500 border-white/70'
                        }`}
                        title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                      >
                        <Heart className={`w-3.5 h-3.5 transition-transform ${isFav ? 'fill-current scale-110' : ''}`} />
                      </button>
                    </div>

                    {/* Quick Peek Button Overlay (appears on hover) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <span className="px-4 py-2 rounded-xl bg-stone-950/75 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/20">
                        <Eye className="w-3.5 h-3.5 text-amber-300" />
                        View Recipe Sheet
                      </span>
                    </div>

                    {/* Bottom-Left: Prep Time & Heat */}
                    <div className="absolute bottom-4 left-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/40 backdrop-blur-md text-white/90 border border-white/20 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-300" />
                        15-20 min bake
                      </span>
                    </div>

                    {/* Bottom-Right: Price Tag with Hover Transition */}
                    <div className="absolute bottom-4 right-4">
                      <span className="px-4 py-1.5 rounded-2xl text-base font-serif font-black bg-white text-stone-950 shadow-sunset-sm border border-orange-200 group-hover:scale-105 group-hover:border-orange-400 transition-all flex items-baseline gap-1">
                        <span>₹{pizza.basePrice}</span>
                        <span className="text-[10px] font-sans font-bold text-stone-500">/ 11"</span>
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-serif font-black text-xl text-stone-950 group-hover:text-orange-600 transition-colors duration-200 leading-tight">
                        {pizza.name}
                      </h3>
                      <p className="text-xs text-orange-600 font-extrabold italic flex items-center gap-1">
                        <span>✦</span>
                        <span>{pizza.tagline}</span>
                      </p>
                      <p className="text-stone-600 font-medium text-xs leading-relaxed line-clamp-2 pt-0.5">
                        {pizza.description}
                      </p>
                    </div>

                    {/* Gourmet Recipe Specifications Box */}
                    <div className="bg-orange-50/70 p-3.5 rounded-2xl text-[11px] space-y-2 border border-orange-200/70">
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-orange-700 border-b border-orange-200/60 pb-1.5">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-orange-500" />
                          Oven Recipe Specs
                        </span>
                        <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          In Kitchen Stock
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 font-bold">Crust Base:</span>
                        <span className="font-black text-stone-950">{pizza.defaultBase?.name || 'Hand Tossed Thin Crust'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 font-bold">Simmered Sauce:</span>
                        <span className="font-black text-stone-950">{pizza.defaultSauce?.name || 'Classic San Marzano'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 font-bold">Melted Cheese:</span>
                        <span className="font-black text-stone-950">{pizza.defaultCheese?.name || 'Fresh Mozzarella'}</span>
                      </div>
                    </div>

                    {/* Actions: In-Cart Counter OR Add Button + Studio Customize */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1" onClick={(e) => e.stopPropagation()}>
                      {inCartItem ? (
                        <div className="flex items-center justify-between bg-orange-50/90 border border-orange-300 rounded-xl p-1 shadow-inner">
                          <button
                            onClick={() => {
                              const idx = cartItems.findIndex((it) => it.pizzaVarietyId === pizza._id);
                              updateQuantity(idx, inCartItem.quantity - 1);
                            }}
                            className="w-8 h-8 rounded-lg bg-white hover:bg-orange-100 text-stone-900 font-black flex items-center justify-center border border-orange-200 transition-colors shadow-sm"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <div className="text-center px-1">
                            <div className="text-[11px] font-black text-stone-950 flex items-center justify-center gap-1 leading-none">
                              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                              <span>{inCartItem.quantity} in Box</span>
                            </div>
                            <div className="text-[10px] font-mono font-bold text-orange-700 mt-0.5">₹{inCartItem.itemTotal}</div>
                          </div>
                          <button
                            onClick={() => {
                              const idx = cartItems.findIndex((it) => it.pizzaVarietyId === pizza._id);
                              updateQuantity(idx, inCartItem.quantity + 1);
                            }}
                            className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-black flex items-center justify-center shadow-sm transition-all"
                            title="Add one more"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddVarietyToCart(pizza)}
                          className="py-3 px-3 rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:to-orange-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sunset-sm hover:shadow-sunset-md active:scale-95 group/btn"
                        >
                          <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-300" />
                          <span>Add to Box</span>
                        </button>
                      )}

                      <Link
                        to={`/custom-builder?variety=${pizza._id}`}
                        className="py-3 px-3 rounded-xl bg-white hover:bg-orange-50 text-stone-950 hover:text-orange-600 font-black text-xs flex items-center justify-center gap-1.5 transition-all duration-200 border border-orange-200 hover:border-orange-400 group/btn"
                      >
                        <Sliders className="w-3.5 h-3.5 text-orange-500 group-hover/btn:rotate-45 transition-transform duration-300" />
                        <span>Customize</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════
          ARTISANAL QUICK VIEW RECIPE MODAL
      ═══════════════════════════════════════════════════ */}
      {quickViewPizza && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setQuickViewPizza(null)}
        >
          <div
            className="animate-modal-zoom relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-orange-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setQuickViewPizza(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white flex items-center justify-center backdrop-blur-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Image Header */}
            <div className="relative h-72 overflow-hidden bg-orange-100">
              <img
                src={quickViewPizza.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80'}
                alt={quickViewPizza.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent"></div>

              <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-600 text-white">
                    🌱 100% Pure Vegetarian
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-black text-white mt-2">
                    {quickViewPizza.name}
                  </h3>
                  <p className="text-amber-300 text-xs font-bold mt-0.5">{quickViewPizza.tagline}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-serif font-black text-white">₹{quickViewPizza.basePrice}</div>
                  <div className="text-[11px] text-white/70 font-mono">11" Hand-Stretched</div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-700">Artisan Recipe Story</h4>
                <p className="text-stone-700 text-sm leading-relaxed mt-1">{quickViewPizza.description}</p>
              </div>

              {/* Recipe Specifications Table */}
              <div className="bg-orange-50/80 p-4 rounded-2xl border border-orange-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-orange-200/60 pb-2">
                  <span className="text-xs font-mono font-bold uppercase text-stone-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-orange-500" />
                    Bake & Kitchen Blueprint
                  </span>
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    ✓ All Ingredients In Stock
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                    <span className="text-[10px] font-mono text-orange-600 block">Dough Crust</span>
                    <span className="font-black text-stone-900 block mt-0.5">{quickViewPizza.defaultBase?.name || 'Hand Tossed'}</span>
                    <span className="text-[10px] text-stone-500">48h slow cold fermentation</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                    <span className="text-[10px] font-mono text-orange-600 block">Simmered Sauce</span>
                    <span className="font-black text-stone-900 block mt-0.5">{quickViewPizza.defaultSauce?.name || 'San Marzano'}</span>
                    <span className="text-[10px] text-stone-500">Crushed D.O.P. Italian tomatoes</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                    <span className="text-[10px] font-mono text-orange-600 block">Melted Cheese</span>
                    <span className="font-black text-stone-900 block mt-0.5">{quickViewPizza.defaultCheese?.name || 'Mozzarella'}</span>
                    <span className="text-[10px] text-stone-500">Fior di latte artisanal melt</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    handleAddVarietyToCart(quickViewPizza);
                    setQuickViewPizza(null);
                  }}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:to-orange-500 text-white font-black text-sm shadow-sunset-sm hover:shadow-sunset-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add to Box (₹{quickViewPizza.basePrice})</span>
                </button>

                <Link
                  to={`/custom-builder?variety=${quickViewPizza._id}`}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white hover:bg-orange-50 text-stone-950 font-black text-sm border border-orange-200 hover:border-orange-400 transition-all flex items-center justify-center gap-2"
                >
                  <Sliders className="w-4 h-4 text-orange-500" />
                  <span>Customize in Studio</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Pizza Builder Studio Banner with Sunset Gradient */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-500 via-sunset-500 to-amber-500 p-8 sm:p-14 text-white shadow-sunset-glow">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 bg-white/5 opacity-50 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="space-y-4 max-w-lg">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Live 4-Step Interactive Studio
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white leading-tight">
                Design Your Own Handcrafted Pizza
              </h2>
              <p className="text-white/90 text-sm leading-relaxed">
                Step up to the counter: Pick from 5 cold-fermented crusts, 5 simmered sauces, 5 gourmet cheeses, and 8 garden vegetables with live stock sync and instant price calculation.
              </p>
              <div className="pt-2">
                <Link
                  to="/custom-builder"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white hover:bg-orange-50 text-orange-900 font-extrabold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 text-sunset-500" />
                  Launch Pizza Studio
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-center">
                {[
                  { count: '5', label: 'Crust Bases' },
                  { count: '5', label: 'Artisan Sauces' },
                  { count: '5', label: 'Cheese Melts' },
                  { count: '8', label: 'Toppings' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/15 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                    <div className="text-2xl font-serif font-extrabold text-white">{item.count}</div>
                    <div className="text-[11px] font-bold text-white/90 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Pizza Visualizer Preview with Slice Pull Animation */}
            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl shrink-0">
              <PizzaPlateVisualizer
                selectedVeggies={[
                  { name: 'Bell Peppers' },
                  { name: 'Black Olives' },
                  { name: 'Red Onions' },
                  { name: 'Fresh Basil' },
                ]}
                autoAnimate={true}
                showControls={true}
                size="sm"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



