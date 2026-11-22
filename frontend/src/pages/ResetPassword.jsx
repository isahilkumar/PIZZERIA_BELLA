import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PizzaLogoIcon } from '../components/BrandLogo';
import { Lock, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const RESET_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&auto=format&fit=crop&q=95',
    title: 'Wood-Fired Truffle Sourdough',
  },
  {
    img: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=1920&auto=format&fit=crop&q=95',
    title: 'Margherita Bella Classico',
  },
];

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 3D Parallax & Depth State
  const [tilt, setTilt] = useState({ x: 0, y: 0, mouseX: 50, mouseY: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const animFrameRef = useRef(null);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % RESET_SLIDES.length);
    }, 10000);
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
      const res = await resetPassword(token, password);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden select-none pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-stone-950 font-sans"
      style={{ perspective: '1200px' }}
    >
      {/* 3D FULL-SCREEN ARTISANAL PIZZA STAGE */}
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
        {RESET_SLIDES.map((slide, idx) => {
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

      {/* Dynamic 3D Sunset Glow Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-700"
        style={{
          background: isHovering
            ? `radial-gradient(circle 650px at ${tilt.mouseX}% ${tilt.mouseY}%, rgba(249, 115, 22, 0.25) 0%, rgba(244, 63, 94, 0.12) 40%, transparent 75%)`
            : 'radial-gradient(circle 700px at 50% 50%, rgba(249, 115, 22, 0.18) 0%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Floating Embers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-15">
        {[
          { left: '15%', delay: '0s', dur: '12s', size: 'w-2 h-2', bg: 'bg-amber-400' },
          { left: '40%', delay: '3s', dur: '15s', size: 'w-1.5 h-1.5', bg: 'bg-orange-400' },
          { left: '75%', delay: '1.5s', dur: '14s', size: 'w-2.5 h-2.5', bg: 'bg-rose-400' },
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

      {/* Vignette */}
      <div className="absolute inset-0 bg-stone-950/60 z-10 pointer-events-none backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-stone-950/80 z-10 pointer-events-none" />

      {/* Glass Card */}
      <div className="relative z-20 max-w-md w-full glass-fade-card rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 overflow-hidden my-6">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sunset-rose via-sunset-500 to-amber-500" />

        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex flex-col items-center gap-1 group">
            <PizzaLogoIcon size={46} />
            <span className="text-[10px] font-mono tracking-widest uppercase font-black text-orange-600 block pt-1">
              Pizzeria Bella • Security Gateway
            </span>
          </Link>

          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-950 tracking-tight">
              Create New Password
            </h1>
            <p className="text-xs sm:text-sm text-stone-800 font-bold max-w-xs mx-auto mt-1.5 leading-relaxed">
              Choose a strong, secure password for your artisan pizza account.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-300/60 text-rose-900 text-xs flex items-center gap-2.5 backdrop-blur-md font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/15 text-emerald-600 border border-emerald-300/50 rounded-3xl flex items-center justify-center mx-auto shadow-sm backdrop-blur-md">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-serif font-black text-stone-950">Password Updated!</h2>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-bold">
              Your password has been successfully reset. You are now verified and logged in.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/')}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sunset-rose via-sunset-500 to-sunset-gold hover:from-rose-600 hover:to-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sunset-sm transition-all active:scale-95 cursor-pointer"
              >
                <span className="font-black">Continue to Pizza Studio</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-stone-900 text-xs font-mono font-black uppercase tracking-wider block mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-orange-500 absolute left-4 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-white/65 hover:bg-white/85 focus:bg-white/95 backdrop-blur-md border border-white/90 focus:border-sunset-500 rounded-2xl pl-11 pr-11 py-3 text-stone-950 font-black placeholder:text-stone-500 placeholder:font-bold focus:outline-none transition-all shadow-inner text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-stone-600 hover:text-stone-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-stone-900 text-xs font-mono font-black uppercase tracking-wider block mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-orange-500 absolute left-4 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-white/65 hover:bg-white/85 focus:bg-white/95 backdrop-blur-md border border-white/90 focus:border-sunset-500 rounded-2xl pl-11 pr-4 py-3 text-stone-950 font-black placeholder:text-stone-500 placeholder:font-bold focus:outline-none transition-all shadow-inner text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sunset-rose via-sunset-500 to-sunset-gold hover:from-rose-600 hover:to-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sunset-sm hover:shadow-sunset-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="font-black">Updating Password...</span>
                </>
              ) : (
                <>
                  <span className="font-black">Update Password &amp; Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Security badge footer */}
        <div className="pt-3 border-t border-orange-200/50 flex items-center justify-center gap-2 text-[10px] text-stone-700 font-mono font-black">
          <ShieldCheck className="w-3.5 h-3.5 text-sunset-500" />
          <span>256-Bit SSL Encrypted • Argon2/Bcrypt Security</span>
        </div>
      </div>
    </section>
  );
}
