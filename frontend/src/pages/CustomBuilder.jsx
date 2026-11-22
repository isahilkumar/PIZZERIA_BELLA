import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import PizzaPlateVisualizer from '../components/PizzaPlateVisualizer';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Plus,
  Minus,
  ShoppingBag,
  Flame,
  Layers,
  Droplets,
  Star,
  Leaf,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  RotateCcw,
} from 'lucide-react';

const STEP_ITEMS = [
  { num: 1, key: 'base',   label: 'Crust Base',    sub: '5 Hand-Stretched', icon: Layers   },
  { num: 2, key: 'sauce',  label: 'Artisan Sauce', sub: '5 Simmered Flavors', icon: Droplets },
  { num: 3, key: 'cheese', label: 'Cheese Melts',  sub: 'Dairy & Vegan',     icon: Star     },
  { num: 4, key: 'veggie', label: 'Fresh Toppings', sub: 'Garden Picked',   icon: Leaf     },
  { num: 5, key: 'review', label: 'Review & Bake', sub: 'Chef Oven Prep',    icon: Flame    },
];

// Veggie icon helper
const getVeggieEmoji = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('bell') || n.includes('pepper')) return '🫑';
  if (n.includes('olive')) return '🫒';
  if (n.includes('onion')) return '🧅';
  if (n.includes('jalape') || n.includes('chili')) return '🌶️';
  if (n.includes('mushroom')) return '🍄';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('corn')) return '🌽';
  if (n.includes('spinach') || n.includes('basil')) return '🌿';
  return '🥗';
};

export default function CustomBuilder() {
  const [searchParams] = useSearchParams();
  const varietyId = searchParams.get('variety');

  const [inventory, setInventory] = useState({ base: [], sauce: [], cheese: [], veggie: [] });
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  // Selections
  const [selectedBase,    setSelectedBase]    = useState(null);
  const [selectedSauce,   setSelectedSauce]   = useState(null);
  const [selectedCheese,  setSelectedCheese]  = useState(null);
  const [selectedVeggies, setSelectedVeggies] = useState([]);
  const [quantity,        setQuantity]        = useState(1);
  const [customName,      setCustomName]      = useState('My Custom Masterpiece');

  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Load inventory
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await API.get('/inventory');
        if (res.data.success) {
          setInventory(res.data.grouped);

          // Defaults
          if (res.data.grouped.base.length > 0)   setSelectedBase(res.data.grouped.base[0]);
          if (res.data.grouped.sauce.length > 0)  setSelectedSauce(res.data.grouped.sauce[0]);
          if (res.data.grouped.cheese.length > 0) setSelectedCheese(res.data.grouped.cheese[0]);
          if (res.data.grouped.veggie.length > 0) setSelectedVeggies([res.data.grouped.veggie[0]]);

          if (varietyId) {
            try {
              const pRes = await API.get('/pizzas');
              const found = pRes.data.pizzas.find((p) => p._id === varietyId);
              if (found) {
                setCustomName(`Custom ${found.name}`);
                if (found.defaultBase)    setSelectedBase(found.defaultBase);
                if (found.defaultSauce)   setSelectedSauce(found.defaultSauce);
                if (found.defaultCheese)  setSelectedCheese(found.defaultCheese);
                if (found.defaultVeggies) setSelectedVeggies(found.defaultVeggies);
              }
            } catch (err) {
              console.error('Error fetching variety details:', err);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load inventory for builder:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [varietyId]);

  // Live prices
  const unitPrice =
    (selectedBase?.price || 0) +
    (selectedSauce?.price || 0) +
    (selectedCheese?.price || 0) +
    selectedVeggies.reduce((sum, v) => sum + (v.price || 0), 0);

  const totalPrice = unitPrice * quantity;

  // Toggle Veggie
  const handleToggleVeggie = (veg) => {
    if (selectedVeggies.some((v) => v._id === veg._id)) {
      setSelectedVeggies((prev) => prev.filter((v) => v._id !== veg._id));
    } else {
      setSelectedVeggies((prev) => [...prev, veg]);
    }
  };

  // Add to cart & checkout
  const handleAddToCartAndCheckout = (goToCheckout = false) => {
    if (!selectedBase || !selectedSauce || !selectedCheese) {
      alert('Please select a base, sauce, and cheese before proceeding.');
      return;
    }

    const item = {
      itemType: 'custom',
      name: customName || 'Custom Handcrafted Pizza',
      base: {
        id: selectedBase._id,
        name: selectedBase.name,
        price: selectedBase.price,
      },
      sauce: {
        id: selectedSauce._id,
        name: selectedSauce.name,
        price: selectedSauce.price,
      },
      cheese: {
        id: selectedCheese._id,
        name: selectedCheese.name,
        price: selectedCheese.price,
      },
      veggies: selectedVeggies.map((v) => ({
        id: v._id,
        name: v.name,
        price: v.price || 0,
      })),
      quantity,
      unitPrice,
      itemTotal: totalPrice,
    };

    addToCart(item);

    if (goToCheckout) {
      navigate('/checkout');
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-orange-500 font-mono text-xs tracking-wider uppercase">Firing up the kitchen inventory...</p>
      </div>
    );
  }

  // Count selected layers
  const chosenLayersCount = 3 + selectedVeggies.length;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-orange-950 pb-24">

      {/* ════════════════════════════════════════════════════
          STUDIO HERO BANNER
      ════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-b from-orange-100/70 via-white to-transparent pt-8 pb-6 border-b border-orange-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* Left Header Info */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-700 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>INTERACTIVE CRAFT STUDIO</span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span className="text-orange-600 font-medium">Stone Oven 900°F</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-orange-950">
                Sculpt Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500">
                  Signature Pizza
                </span>
              </h1>
              <p className="text-sm text-orange-800/70 max-w-xl leading-relaxed">
                Choose hand-kneaded crusts, slow-simmered sauces, and fresh toppings. Ingredients sync in real time with live kitchen stock.
              </p>
            </div>

            {/* Right Live Price & Checkout CTA */}
            <div className="flex items-center gap-4 bg-white rounded-3xl p-4 sm:p-5 shadow-sunset-sm border border-orange-200/80">
              <div className="pr-4 border-r border-orange-100">
                <span className="text-[10px] font-mono uppercase tracking-widest text-orange-500 font-black block">
                  Running Total
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-serif font-black text-orange-900">₹{totalPrice}</span>
                  <span className="text-xs text-orange-600 font-medium">({quantity} × ₹{unitPrice})</span>
                </div>
                <span className="text-[11px] text-orange-500 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> {chosenLayersCount} ingredients stacked
                </span>
              </div>

              <button
                onClick={() => handleAddToCartAndCheckout(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sunset-rose via-sunset-500 to-amber-500 hover:from-rose-600 hover:to-orange-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-sunset-sm hover:shadow-sunset-md hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                Checkout
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STEPPER NAVIGATION TABS
      ════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-orange-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-3 gap-2 no-scrollbar">
            {STEP_ITEMS.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isPast = step > s.num;

              return (
                <button
                  key={s.num}
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500/15 via-rose-500/10 to-amber-500/15 border border-orange-400 text-orange-900 shadow-sunset-xs ring-1 ring-orange-400/40'
                      : isPast
                      ? 'bg-orange-50/70 border border-orange-200/60 text-orange-800 hover:bg-orange-100/60'
                      : 'border border-transparent text-orange-600/70 hover:text-orange-900 hover:bg-orange-50/50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm'
                        : isPast
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-200/80 text-orange-700'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-serif font-black leading-tight flex items-center gap-1.5">
                      <span>{s.label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
                    </div>
                    <div className="text-[10px] text-orange-600/80 font-medium">{s.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          MAIN BUILDER STUDIO GRID
      ════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ══ LEFT: Interactive Sticky Visualizer Card ══ */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl p-6 shadow-sunset-sm border border-orange-200/80 overflow-hidden relative">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-orange-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-700">
                    Live Assembly Visualizer
                  </span>
                </div>
                <span className="text-xs font-medium text-orange-600 bg-orange-100/70 px-2.5 py-0.5 rounded-full">
                  Step {step} of 5
                </span>
              </div>

              {/* Pizza Visualizer Component */}
              <div className="py-6 flex justify-center">
                <PizzaPlateVisualizer
                  selectedBase={selectedBase}
                  selectedSauce={selectedSauce}
                  selectedCheese={selectedCheese}
                  selectedVeggies={selectedVeggies}
                />
              </div>

              {/* Live Composition Ingredient Chips */}
              <div className="space-y-3 pt-3 border-t border-orange-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-600 font-medium">Selected Base:</span>
                  <span className="font-serif font-bold text-orange-950">
                    {selectedBase?.name} <span className="text-orange-500 font-mono">(₹{selectedBase?.price})</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-600 font-medium">Selected Sauce:</span>
                  <span className="font-serif font-bold text-orange-950">
                    {selectedSauce?.name} <span className="text-orange-500 font-mono">(₹{selectedSauce?.price})</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-600 font-medium">Selected Cheese:</span>
                  <span className="font-serif font-bold text-orange-950">
                    {selectedCheese?.name} <span className="text-orange-500 font-mono">(₹{selectedCheese?.price})</span>
                  </span>
                </div>
                <div className="flex items-start justify-between text-xs pt-1">
                  <span className="text-orange-600 font-medium">Toppings ({selectedVeggies.length}):</span>
                  <span className="font-semibold text-orange-950 text-right max-w-[210px] leading-tight">
                    {selectedVeggies.length > 0
                      ? selectedVeggies.map((v) => v.name).join(', ')
                      : 'None selected yet'}
                  </span>
                </div>
              </div>

              {/* Quantity Selector Bar */}
              <div className="mt-5 pt-4 border-t border-orange-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-orange-900 block">Pizza Quantity</span>
                  <span className="text-[11px] text-orange-500">Portions to prepare</span>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 p-1.5 rounded-2xl border border-orange-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-xl bg-white text-orange-700 hover:bg-orange-100 flex items-center justify-center font-bold shadow-xs transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-sm text-orange-900 w-7 text-center font-mono">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-xl bg-white text-orange-700 hover:bg-orange-100 flex items-center justify-center font-bold shadow-xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Kitchen Guarantee Pill */}
            <div className="flex items-center justify-around p-3.5 rounded-2xl bg-white/80 border border-orange-200/60 shadow-xs text-xs text-orange-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-500" /> 35 Min Delivery
              </span>
              <span className="text-orange-300">•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500" /> Razorpay Safe
              </span>
              <span className="text-orange-300">•</span>
              <span className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-orange-500" /> Fresh Oven Guarantee
              </span>
            </div>
          </div>

          {/* ══ RIGHT: Redesigned Step Options Cards ══ */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sunset-sm border border-orange-200/80 space-y-6">

            {/* ─── STEP 1: CHOOSE PIZZA BASE ─── */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-orange-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-mono font-bold uppercase">
                        Step 01
                      </span>
                      <h2 className="text-2xl font-serif font-black text-orange-950">Choose Pizza Base</h2>
                    </div>
                    <p className="text-xs text-orange-600">5 authentic slow-fermented, hand-stretched crusts</p>
                  </div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                    5 Options
                  </span>
                </div>

                <div className="space-y-3.5">
                  {inventory.base.map((item) => {
                    const isSelected = selectedBase?._id === item._id;
                    const isLow = item.stockQuantity < item.threshold;
                    const isOut = item.stockQuantity === 0;

                    return (
                      <button
                        key={item._id}
                        disabled={isOut}
                        onClick={() => setSelectedBase(item)}
                        className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative group flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-gradient-to-r from-orange-50/90 via-amber-50/50 to-rose-50/40 border-orange-500 shadow-sunset-sm ring-2 ring-orange-500/25 scale-[1.01]'
                            : isOut
                            ? 'opacity-40 cursor-not-allowed bg-orange-50/40 border-orange-200/60'
                            : 'bg-white hover:bg-orange-50/50 border-orange-200 hover:border-orange-400 hover:shadow-xs'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-serif font-bold text-base text-orange-950">
                              {item.name}
                            </span>
                            {item.badge && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-300">
                                {item.badge}
                              </span>
                            )}
                            {isLow && !isOut && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                Only {item.stockQuantity} left
                              </span>
                            )}
                            {isOut && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-orange-700/80 leading-relaxed max-w-lg">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-5 self-end sm:self-center shrink-0">
                          <span className="text-xl font-serif font-black text-orange-900 font-mono">
                            ₹{item.price}
                          </span>
                          <div
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-orange-500 bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-xs'
                                : 'border-orange-300 bg-white group-hover:border-orange-400'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── STEP 2: CHOOSE ARTISAN SAUCE ─── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-orange-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-mono font-bold uppercase">
                        Step 02
                      </span>
                      <h2 className="text-2xl font-serif font-black text-orange-950">Choose Artisan Sauce</h2>
                    </div>
                    <p className="text-xs text-orange-600">5 slow-simmered, herb-infused Italian sauces</p>
                  </div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                    5 Options
                  </span>
                </div>

                <div className="space-y-3.5">
                  {inventory.sauce.map((item) => {
                    const isSelected = selectedSauce?._id === item._id;
                    const isLow = item.stockQuantity < item.threshold;
                    const isOut = item.stockQuantity === 0;

                    return (
                      <button
                        key={item._id}
                        disabled={isOut}
                        onClick={() => setSelectedSauce(item)}
                        className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative group flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-gradient-to-r from-orange-50/90 via-amber-50/50 to-rose-50/40 border-orange-500 shadow-sunset-sm ring-2 ring-orange-500/25 scale-[1.01]'
                            : isOut
                            ? 'opacity-40 cursor-not-allowed bg-orange-50/40 border-orange-200/60'
                            : 'bg-white hover:bg-orange-50/50 border-orange-200 hover:border-orange-400 hover:shadow-xs'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-serif font-bold text-base text-orange-950">
                              {item.name}
                            </span>
                            {item.badge && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-300">
                                {item.badge}
                              </span>
                            )}
                            {isLow && !isOut && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                Only {item.stockQuantity} left
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-orange-700/80 leading-relaxed max-w-lg">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-5 self-end sm:self-center shrink-0">
                          <span className="text-xl font-serif font-black text-orange-900 font-mono">
                            ₹{item.price}
                          </span>
                          <div
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-orange-500 bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-xs'
                                : 'border-orange-300 bg-white group-hover:border-orange-400'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── STEP 3: CHOOSE CHEESE TYPE ─── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-orange-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-mono font-bold uppercase">
                        Step 03
                      </span>
                      <h2 className="text-2xl font-serif font-black text-orange-950">Choose Cheese Melt</h2>
                    </div>
                    <p className="text-xs text-orange-600">Signature whole-milk Italian melts & plant-based dairy blends</p>
                  </div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                    {inventory.cheese.length} Types
                  </span>
                </div>

                <div className="space-y-3.5">
                  {inventory.cheese.map((item) => {
                    const isSelected = selectedCheese?._id === item._id;
                    const isLow = item.stockQuantity < item.threshold;
                    const isOut = item.stockQuantity === 0;

                    return (
                      <button
                        key={item._id}
                        disabled={isOut}
                        onClick={() => setSelectedCheese(item)}
                        className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative group flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-gradient-to-r from-orange-50/90 via-amber-50/50 to-rose-50/40 border-orange-500 shadow-sunset-sm ring-2 ring-orange-500/25 scale-[1.01]'
                            : isOut
                            ? 'opacity-40 cursor-not-allowed bg-orange-50/40 border-orange-200/60'
                            : 'bg-white hover:bg-orange-50/50 border-orange-200 hover:border-orange-400 hover:shadow-xs'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-serif font-bold text-base text-orange-950">
                              {item.name}
                            </span>
                            {item.badge && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-300">
                                {item.badge}
                              </span>
                            )}
                            {isLow && !isOut && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                Only {item.stockQuantity} left
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-orange-700/80 leading-relaxed max-w-lg">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-5 self-end sm:self-center shrink-0">
                          <span className="text-xl font-serif font-black text-orange-900 font-mono">
                            ₹{item.price}
                          </span>
                          <div
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-orange-500 bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-xs'
                                : 'border-orange-300 bg-white group-hover:border-orange-400'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── STEP 4: CHOOSE FRESH VEGETABLES ─── */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-orange-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-mono font-bold uppercase">
                        Step 04
                      </span>
                      <h2 className="text-2xl font-serif font-black text-orange-950">Add Fresh Garden Toppings</h2>
                    </div>
                    <p className="text-xs text-orange-600">Select multiple items to layer your artisanal pizza</p>
                  </div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                    {selectedVeggies.length} Picked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {inventory.veggie.map((item) => {
                    const isSelected = selectedVeggies.some((v) => v._id === item._id);
                    const isLow = item.stockQuantity < item.threshold;
                    const isOut = item.stockQuantity === 0;
                    const emoji = getVeggieEmoji(item.name);

                    return (
                      <button
                        key={item._id}
                        disabled={isOut}
                        onClick={() => handleToggleVeggie(item)}
                        className={`text-left p-4 rounded-2xl border transition-all duration-300 flex items-start justify-between gap-3 relative group ${
                          isSelected
                            ? 'bg-gradient-to-br from-orange-50 via-amber-50/60 to-white border-orange-500 shadow-sunset-xs ring-2 ring-orange-500/20'
                            : isOut
                            ? 'opacity-40 cursor-not-allowed bg-orange-50/50 border-orange-200'
                            : 'bg-white hover:bg-orange-50/50 border-orange-200 hover:border-orange-400'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-2xl select-none pt-0.5">{emoji}</span>
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="font-serif font-bold text-sm text-orange-950 truncate">
                              {item.name}
                            </div>
                            <p className="text-[11px] text-orange-600/80 line-clamp-1">{item.description}</p>
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-xs font-serif font-black text-orange-800 font-mono">
                                +₹{item.price}
                              </span>
                              {isLow && !isOut && (
                                <span className="text-[10px] text-amber-700 font-bold bg-amber-100/70 px-2 py-0.5 rounded-full">
                                  Only {item.stockQuantity} left
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-xs'
                              : 'border-orange-300 bg-white group-hover:border-orange-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── STEP 5: REVIEW & CONFIRM ─── */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="border-b border-orange-100 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-mono font-bold uppercase">
                      Step 05
                    </span>
                    <h2 className="text-2xl font-serif font-black text-orange-950">Review & Send to Oven</h2>
                  </div>
                  <p className="text-xs text-orange-600">Personalize your recipe card before the chef starts baking</p>
                </div>

                {/* Pizza Name Input */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest font-black text-orange-700">
                    Give Your Pizza A Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Nonna's Sunset Special"
                    className="w-full bg-orange-50/60 border border-orange-200 rounded-2xl px-5 py-3.5 text-orange-950 font-serif font-bold text-base focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                {/* Artisanal Ticket Breakdown */}
                <div className="bg-gradient-to-b from-orange-50/80 to-amber-50/30 p-6 rounded-3xl border border-orange-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-orange-200 pb-3">
                    <h3 className="font-serif font-black text-sm text-orange-950 uppercase tracking-wider">
                      📋 Chef Kitchen Order Ticket
                    </h3>
                    <span className="text-[11px] font-mono text-orange-600 font-bold">TABLE #01</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-orange-700 font-medium">1. Handcrafted Base:</span>
                      <span className="font-bold text-orange-950">
                        {selectedBase?.name} <span className="font-mono text-orange-600">(₹{selectedBase?.price})</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-orange-700 font-medium">2. Simmered Sauce:</span>
                      <span className="font-bold text-orange-950">
                        {selectedSauce?.name} <span className="font-mono text-orange-600">(₹{selectedSauce?.price})</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-orange-700 font-medium">3. Melted Cheese:</span>
                      <span className="font-bold text-orange-950">
                        {selectedCheese?.name} <span className="font-mono text-orange-600">(₹{selectedCheese?.price})</span>
                      </span>
                    </div>
                    {selectedVeggies.map((veg) => (
                      <div key={veg._id} className="flex justify-between items-center text-orange-700 pl-4 border-l-2 border-orange-300">
                        <span>+ {veg.name}</span>
                        <span className="font-bold text-orange-900 font-mono">₹{veg.price}</span>
                      </div>
                    ))}

                    <div className="pt-3 border-t border-orange-200 flex justify-between text-sm">
                      <span className="font-bold text-orange-950">Unit Pizza Price:</span>
                      <span className="font-serif font-black text-orange-900 font-mono">₹{unitPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-700 font-medium">Quantity Portions:</span>
                      <span className="font-bold text-orange-950 font-mono">x {quantity}</span>
                    </div>
                    <div className="pt-2 border-t-2 border-dashed border-orange-300 flex justify-between text-base font-extrabold">
                      <span className="text-orange-950 font-serif">Grand Total Payable:</span>
                      <span className="text-orange-600 font-serif text-2xl font-black font-mono">₹{totalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Final Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => handleAddToCartAndCheckout(false)}
                    className="py-4 px-5 rounded-2xl bg-white hover:bg-orange-50 text-orange-900 font-bold text-xs flex items-center justify-center gap-2 border border-orange-200 shadow-xs hover:border-orange-300 transition-all"
                  >
                    <Plus className="w-4 h-4 text-orange-600" />
                    Save & Continue Browsing
                  </button>

                  <button
                    onClick={() => handleAddToCartAndCheckout(true)}
                    className="py-4 px-5 rounded-2xl bg-gradient-to-r from-sunset-rose via-sunset-500 to-amber-500 hover:from-rose-600 hover:to-orange-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sunset-sm hover:shadow-sunset-md hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── Stepper Bottom Navigation Footer ─── */}
            <div className="flex items-center justify-between pt-6 border-t border-orange-100">
              <button
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
                className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                  step === 1
                    ? 'opacity-30 cursor-not-allowed text-orange-400 bg-orange-50'
                    : 'bg-orange-100 text-orange-800 hover:bg-orange-200 active:scale-95'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </button>

              {step < 5 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-7 py-3 rounded-2xl bg-gradient-to-r from-sunset-rose via-sunset-500 to-amber-500 hover:from-rose-600 hover:to-orange-500 text-white font-black text-xs flex items-center gap-2 transition-all shadow-sunset-sm hover:shadow-sunset-md hover:scale-105 active:scale-95"
                >
                  Next: {STEP_ITEMS[step]?.label}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleAddToCartAndCheckout(true)}
                  className="px-7 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-black text-xs flex items-center gap-2 transition-all shadow-sunset-md active:scale-95"
                >
                  Bake & Checkout Pizza
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
