import React from 'react';
import { Link } from 'react-router-dom';
import { PizzaLogoIcon } from './BrandLogo';
import { Heart, Shield, Lock, Flame, Award, Clock, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="glass-fade-footer pt-14 pb-10 text-orange-950 mt-20 relative overflow-hidden">
      {/* Top ambient glowing sunset sweep line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-sunset-500/60 to-transparent" />

      {/* Decorative ambient glass glows */}
      <div className="absolute -bottom-10 right-0 w-80 h-80 bg-gradient-to-tl from-orange-400/10 via-rose-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-amber-300/10 via-orange-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-orange-200/50">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3.5 group">
              <PizzaLogoIcon size={46} />
              <div>
                <span className="font-serif font-black text-2xl text-stone-950 block leading-tight group-hover:text-sunset-600 transition-colors">
                  Pizzeria <span className="text-sunset-gradient">Bella</span>
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase font-black text-orange-600 block">
                  Wood-Fired Artisanal Hearth • Est. Napoli 1889
                </span>
              </div>
            </Link>

            <p className="text-stone-700 text-xs sm:text-sm max-w-md leading-relaxed font-medium">
              Slow-crafted Neapolitan pizzas baked at 900°F in volcanic stone ovens. 48-hour cold-fermented sourdough, authentic D.O.P. San Marzano plum tomatoes, and live kitchen dispatch.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 backdrop-blur-md border border-white/70 text-orange-900 font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                900°F Stone Oven Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 backdrop-blur-md border border-white/70 text-orange-900 font-bold shadow-xs">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                35 Min Handcrafted Guarantee
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-black text-stone-950 text-sm tracking-wide">
              Customer Experience
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/" className="text-stone-700 hover:text-sunset-600 hover:translate-x-1 inline-block transition-all">
                  Signature Catalog
                </Link>
              </li>
              <li>
                <Link to="/custom-builder" className="text-stone-700 hover:text-sunset-600 hover:translate-x-1 inline-block transition-all">
                  Custom Pizza Studio
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-stone-700 hover:text-sunset-600 hover:translate-x-1 inline-block transition-all">
                  Live Order Tracker
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="text-stone-700 hover:text-sunset-600 hover:translate-x-1 inline-block transition-all">
                  Cart &amp; Fast Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Kitchen & Operations */}
          <div className="space-y-3">
            <h4 className="font-serif font-black text-stone-950 text-sm tracking-wide flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-sunset-500" />
              Kitchen &amp; Operations
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 text-stone-700 hover:text-sunset-600 hover:translate-x-1 transition-all"
                >
                  <Lock className="w-3.5 h-3.5 text-sunset-500" />
                  Admin Login Gateway
                </Link>
              </li>
              <li>
                <Link to="/admin/inventory" className="text-stone-700 hover:text-sunset-600 hover:translate-x-1 inline-block transition-all">
                  Live Stock Engine
                </Link>
              </li>
              <li>
                <Link to="/admin/orders" className="text-stone-700 hover:text-sunset-600 hover:translate-x-1 inline-block transition-all">
                  Kitchen Dispatch Panel
                </Link>
              </li>
              <li>
                <span className="text-[10px] text-orange-600 font-mono font-bold block pt-1">
                  ⚡ WebSocket Dispatch: Connected
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-600 gap-4 font-medium">
          <p>© {new Date().getFullYear()} Pizzeria Bella Inc. Artisanal Handcrafted Pizzas.</p>
          <p className="flex items-center gap-1">
            Handcrafted with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> React.js, Express, MongoDB &amp; Razorpay
          </p>
        </div>
      </div>
    </footer>
  );
}
