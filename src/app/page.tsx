'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import LoginModal from '@/components/LoginModal';
import { ArrowRight, ChevronRight, BarChart3, Globe2, Gamepad2 } from 'lucide-react';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Quitamos la redirección automática al dashboard
  // useEffect(() => {
  //   if (session) router.replace('/dashboard');
  // }, [session, router]);

  return (
    <>
      <div className="relative min-h-screen bg-[#000000] selection:bg-indigo-500/30 overflow-hidden">
        {/* Prisma Hero Video Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center w-full h-full">
          <div className="absolute inset-0 bg-black/60 z-10" /> {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60 scale-105 mix-blend-screen"
            src="https://website-v3-assets.s3.amazonaws.com/assets/video/hero-dark.mp4"
            poster="/sprites/v2/cover_epic.png"
          />
        </div>

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg shadow-lg shadow-indigo-500/25">
                🏡
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Hodl<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Ville</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => setShowLogin(true)} className="text-sm font-medium text-white/80 hover:text-white transition">
                Log in
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="group relative px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-full overflow-hidden transition-all duration-300 ease-out border border-white/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  Empezar a jugar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <section className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-medium text-white/80">HodlVille v2.5 ya está disponible</span>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
              Tus trades forjan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400">tus héroes</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Juego 2D pixel art donde tus posiciones en Binance se convierten en personajes. 
              Sube de nivel, construye tu reino y domina la taberna en tiempo real.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => setShowLogin(true)}
                className="w-full sm:w-auto group relative px-8 py-4 text-base font-semibold text-white bg-white/10 hover:bg-white/20 rounded-full overflow-hidden transition-all duration-300 ease-out border border-white/10 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.5)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  Jugar Gratis <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button
                onClick={() => setShowLogin(true)}
                className="w-full sm:w-auto px-8 py-4 text-base font-medium text-white/80 hover:text-white rounded-full transition-colors flex items-center justify-center gap-2"
              >
                <Gamepad2 size={18} />
                Explorar features
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            style={{ y }}
            className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-black to-transparent pointer-events-none" 
          />
        </section>

        {/* Footer */}
        <footer className="px-6 py-10 border-t border-[rgba(99,102,241,0.08)]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏡</span>
              <span className="text-sm font-bold text-white">Hodl<span className="text-[#f0b90b]">Ville</span></span>
            </div>
            <p className="text-[#5c5c80] text-xs">
              HodlVille — Juego de trading simulado. Sin valor real. No es asesoramiento financiero.
            </p>
          </div>
        </footer>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}

