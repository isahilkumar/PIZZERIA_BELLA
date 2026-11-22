import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import BrandLogo from './BrandLogo';
import {
  Pizza,
  ShoppingBag,
  User,
  LogOut,
  ShieldCheck,
  Flame,
  Menu as MenuIcon,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const isOverDarkHero =
    (location.pathname === '/' ||
      location.pathname === '/welcome' ||
      location.pathname === '/login' ||
      location.pathname === '/register' ||
      location.pathname === '/admin/login' ||
      location.pathname === '/join-club') &&
    !scrolled;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div
          className={`rounded-full px-5 sm:px-8 h-18 sm:h-20 flex items-center justify-between relative transition-all duration-500 ${
            isOverDarkHero ? 'glass-nav-dark' : 'glass-nav'
          }`}
        >
          {/* Brand Identity with Proper Logo & Advanced Telemetry Features */}
          <BrandLogo isOverDark={isOverDarkHero} />

          {/* Desktop Navigation */}
          <nav className={`hidden lg:flex items-center gap-1.5 p-1 rounded-full backdrop-blur-md border transition-all duration-300 ${
            isOverDarkHero
              ? 'bg-black/30 border-white/20'
              : 'bg-orange-100/35 border-orange-200/50'
          }`}>
            <Link
              to="/"
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 ${
                isActive('/')
                  ? 'bg-gradient-to-r from-sunset-rose via-sunset-500 to-sunset-gold text-white shadow-sunset-sm'
                  : isOverDarkHero
                    ? 'text-white/80 hover:text-white hover:bg-white/15'
                    : 'text-orange-800 hover:text-orange-950 hover:bg-white/50'
              }`}
            >
              Menu Catalog
            </Link>

            <Link
              to="/custom-builder"
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all duration-200 ${
                isActive('/custom-builder')
                  ? 'bg-gradient-to-r from-sunset-rose via-sunset-500 to-sunset-gold text-white shadow-sunset-sm'
                  : isOverDarkHero
                    ? 'text-amber-300 hover:text-amber-100 hover:bg-white/15'
                    : 'text-sunset-700 hover:text-sunset-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sunset-500 animate-pulse" />
              Custom Pizza Studio
            </Link>

            {isAuthenticated && (
              <Link
                to="/orders"
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all duration-200 ${
                  isActive('/orders')
                    ? 'bg-gradient-to-r from-sunset-rose via-sunset-500 to-sunset-gold text-white shadow-sunset-sm'
                    : isOverDarkHero
                      ? 'text-white/80 hover:text-white hover:bg-white/15'
                      : 'text-orange-800 hover:text-orange-950 hover:bg-white/50'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                Track Orders
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/inventory"
                className={`ml-1 px-3 py-1.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase flex items-center gap-1.5 transition-all border ${
                  isOverDarkHero
                    ? 'bg-white/10 border-white/20 text-amber-300 hover:bg-white/20'
                    : 'bg-sunset-50 border-sunset-300 text-sunset-700 hover:bg-orange-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sunset-500" />
                Admin
              </Link>
            )}
          </nav>

          {/* Desktop Right: Cart + Auth */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/checkout"
              className={`relative p-2.5 rounded-full backdrop-blur-md border transition-all flex items-center gap-2 ${
                isOverDarkHero
                  ? 'bg-white/15 border-white/25 text-white hover:bg-white/25 hover:border-white/40'
                  : 'bg-orange-500/10 border-orange-300/40 text-orange-800 hover:bg-orange-500/20 hover:border-orange-400 hover:text-sunset-600'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sunset-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sunset-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className={`flex items-center gap-2 pl-3 border-l ${isOverDarkHero ? 'border-white/20' : 'border-orange-200/70'}`}>
                <div className="text-right hidden xl:block">
                  <div className={`text-xs font-bold ${isOverDarkHero ? 'text-white' : 'text-orange-800'}`}>{user?.name}</div>
                  <div className={`text-[10px] font-mono ${isOverDarkHero ? 'text-amber-300' : 'text-orange-400'}`}>{isAdmin ? 'Kitchen Admin' : 'Customer'}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sunset-rose to-sunset-gold flex items-center justify-center text-white font-bold text-sm shadow-sunset-sm">
                  {user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                </div>
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    isOverDarkHero
                      ? 'bg-white/10 border-white/20 text-white/80 hover:bg-rose-500/30 hover:border-rose-400 hover:text-white'
                      : 'bg-orange-50/80 border-orange-200 text-orange-500 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600'
                  }`}
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className={`flex items-center gap-2 pl-3 border-l ${isOverDarkHero ? 'border-white/20' : 'border-orange-200/70'}`}>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isOverDarkHero
                      ? 'text-white/90 hover:text-white hover:bg-white/15'
                      : 'text-orange-700 hover:text-orange-950 hover:bg-orange-500/10'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/join-club"
                  className="px-5 py-2.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-sunset-rose via-sunset-500 to-sunset-gold hover:from-rose-600 hover:to-orange-500 text-white transition-all shadow-sunset-sm hover:shadow-sunset-md hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                  <span>Join Club</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex items-center gap-2.5 sm:hidden">
            <Link
              to="/checkout"
              className={`relative p-2 rounded-full backdrop-blur-md border ${
                isOverDarkHero
                  ? 'bg-white/15 border-white/25 text-white'
                  : 'bg-orange-500/10 border-orange-300/40 text-orange-800'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sunset-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-full backdrop-blur-md border cursor-pointer ${
                isOverDarkHero
                  ? 'bg-white/15 border-white/25 text-white'
                  : 'bg-orange-500/10 border-orange-300/40 text-orange-800'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 max-w-7xl mx-auto glass-nav rounded-3xl p-5 shadow-2xl space-y-3 animate-slide-up border border-white/70">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-xs font-bold text-orange-800 hover:bg-orange-50"
          >
            Menu Catalog
          </Link>
          <Link
            to="/custom-builder"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-50 text-sunset-700 border border-orange-200"
          >
            ✨ Custom Pizza Studio
          </Link>
          {isAuthenticated && (
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-xs font-bold text-orange-800 hover:bg-orange-50"
            >
              Track Orders
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/inventory"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-xs font-bold text-sunset-700 bg-orange-50 border border-orange-200"
            >
              🛡️ Admin Operations
            </Link>
          )}

          <div className="pt-3 border-t border-orange-200 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                Sign Out ({user?.name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/join-club"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sunset-rose to-sunset-500 text-white shadow-sm flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Join Club</span>
                </Link>
              </div>
            )}
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center text-[11px] text-orange-400 hover:text-sunset-600 py-1"
            >
              Kitchen Staff Portal →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
