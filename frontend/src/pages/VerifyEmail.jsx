import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PizzaLogoIcon } from '../components/BrandLogo';
import { CheckCircle, AlertCircle, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

const VERIFY_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&auto=format&fit=crop&q=95',
    title: 'Wood-Fired Truffle Sourdough',
  },
  {
    img: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=1920&auto=format&fit=crop&q=95',
    title: 'Margherita Bella Classico',
  },
];

export default function VerifyEmail() {
  const { token } = useParams();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  // 3D Parallax & Depth State
  const [tilt, setTilt] = useState({ x: 0, y: 0, mouseX: 50, mouseY: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const animFrameRef = useRef(null);

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
    const doVerify = async () => {
      if (!token) {
        setLoading(false);
        setMessage('Missing verification token in URL');
        return;
      }

      try {
        const res = await verifyEmail(token);
        if (res.success) {
          setSuccess(true);
          setMessage(res.message || 'Email successfully verified!');
        } else {
          setMessage(res.message || 'Failed to verify email');
        }
      } catch (err) {
        setMessage(err.response?.data?.message || 'Invalid or expired verification token.');
      } finally {
        setLoading(false);
      }
    };

    doVerify();
  }, [token]);

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden select-none pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-stone-950 font-sans"
      style={{ perspective: '1200px' }}
    >
      {/* 3D FULL-SCREEN PIZZA STAGE */}
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
        <img
          src={VERIFY_SLIDES[0].img}
          alt="Artisanal Pizza Stage"
          className="w-full h-full object-cover object-center scale-[1.06]"
          loading="eager"
        />
      </div>

      {/* Dynamic 3D Sunset Glow Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: isHovering
            ? `radial-gradient(circle 650px at ${tilt.mouseX}% ${tilt.mouseY}%, rgba(249, 115, 22, 0.25) 0%, rgba(244, 63, 94, 0.12) 40%, transparent 75%)`
            : 'radial-gradient(circle 700px at 50% 50%, rgba(249, 115, 22, 0.18) 0%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-stone-950/60 z-10 pointer-events-none backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-stone-950/80 z-10 pointer-events-none" />

      {/* Glass Card */}
      <div className="relative z-20 max-w-md w-full glass-fade-card rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 overflow-hidden my-6 text-center">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sunset-rose via-sunset-500 to-amber-500" />

        <div className="space-y-3">
          <Link to="/" className="inline-flex flex-col items-center gap-1 group">
            <PizzaLogoIcon size={46} />
            <span className="text-[10px] font-mono tracking-widest uppercase font-black text-orange-600 block pt-1">
              Pizzeria Bella • Security Gateway
            </span>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4 py-6">
            <div className="w-12 h-12 border-4 border-sunset-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-serif font-black text-stone-950">Verifying Your Account...</h2>
            <p className="text-xs sm:text-sm text-stone-800 font-bold">Validating your email verification token with the stone oven cluster.</p>
          </div>
        ) : success ? (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-500/15 text-emerald-600 border border-emerald-300/50 rounded-3xl flex items-center justify-center mx-auto shadow-sm backdrop-blur-md">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif font-black text-stone-950">Verification Confirmed!</h2>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-bold">
              Your email is now verified. You are authenticated and ready to place slow-proofed sourdough pizza orders.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sunset-rose via-sunset-500 to-sunset-gold hover:from-rose-600 hover:to-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sunset-sm transition-all active:scale-95"
              >
                <span className="font-black">Enter Pizzeria Bella Menu</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 bg-rose-500/15 text-rose-600 border border-rose-300/50 rounded-3xl flex items-center justify-center mx-auto shadow-sm backdrop-blur-md">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif font-black text-stone-950">Verification Failed</h2>
            <p className="text-xs sm:text-sm text-rose-900 font-bold">{message}</p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full py-3 rounded-2xl bg-white/70 hover:bg-white/95 border border-white/80 text-stone-950 font-black text-xs backdrop-blur-md transition-all shadow-xs"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-orange-200/50 flex items-center justify-center gap-2 text-[10px] text-stone-700 font-mono font-black">
          <ShieldCheck className="w-3.5 h-3.5 text-sunset-500" />
          <span>256-Bit SSL Encrypted • Single-Use Token</span>
        </div>
      </div>
    </section>
  );
}
