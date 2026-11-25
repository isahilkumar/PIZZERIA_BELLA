import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

export default function FloatingCartBar() {
  const { itemCount, total, cartItems } = useCart();
  const location = useLocation();

  // Hide on checkout / cart page or auth pages
  const shouldHide =
    location.pathname === '/cart' ||
    location.pathname === '/checkout' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/admin/login' ||
    location.pathname.startsWith('/admin');

  if (shouldHide || itemCount === 0) {
    return null;
  }

  // Preview first 2 items
  const itemsSnippet = cartItems
    .slice(0, 2)
    .map((item) => item.name)
    .join(', ') + (cartItems.length > 2 ? ` +${cartItems.length - 2} more` : '');

  return (
    <aside aria-label="Cart Notification" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg animate-bounce-in">
      <div className="glass-nav-dark rounded-full px-5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-orange-500/30 flex items-center justify-between gap-3 text-white">
        {/* Left: Bag & Count */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-sunset-rose via-sunset-500 to-sunset-gold flex items-center justify-center shrink-0 shadow-sunset-sm">
            <ShoppingBag className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 bg-white text-stone-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
              {itemCount}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-black">
              <span className="text-amber-300">₹{total}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/90 truncate">{itemCount} {itemCount === 1 ? 'item' : 'items'} in cart</span>
            </div>
            <p className="text-[10px] text-white/60 truncate font-mono">
              {itemsSnippet}
            </p>
          </div>
        </div>

        {/* Right: View Cart Action */}
        <Link
          to="/cart"
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-sunset-rose via-sunset-500 to-sunset-gold hover:from-rose-600 hover:to-orange-500 text-white text-xs font-black shrink-0 flex items-center gap-1.5 shadow-sunset-sm hover:scale-105 active:scale-95 transition-all"
        >
          <span>View Cart</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
        </Link>
      </div>
    </aside>
  );
}
