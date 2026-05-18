'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuth';
import LoginModal from '@/components/LoginModal';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { TrendingUp, Shield, Sparkles, Users, Zap, Wallet, ChevronRight, ArrowRight, BarChart3, Globe2, Gamepad2 } from 'lucide-react';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const isGuest = useAuthStore((s) => s.isGuest);

  // Si ya hay sesión mientras estamos en landing, redirigir YA
  useEffect(() => {
    if (session) router.replace('/dashboard');
  }, [session, router]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a1a]">
        <AuroraBackground showRadialGradient={false} className="!bg-transparent">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Navbar — solo visible SIN sesión */}
        {!session && (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-[rgba(5,5,15,0.8)] backdrop-blur-2xl border-b border-[rgba(99,102,241,0.1)]' : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center text-lg shadow-lg shadow-[#6366f1]/25">
                🏡
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Hodl<span className="text-[#f0b90b]">Ville</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[#8888b0] hover:text-white transition text-sm font-medium hidden md:block"
              >
                Features
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[#8888b0] hover:text-white transition text-sm font-medium hidden md:block"
              >
                Cómo funciona
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="btn-primary text-sm !px-5 !py-2.5"
              >
                Jugar ahora
              </button>
            </div>
          </div>
        </nav>
        )}

        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 pt-20">
          {/* Cover art background */}
          <div className="absolute inset-0 z-0">
            <img
              src="/sprites/v2/cover_epic.png"
              alt="HodlVille"
              className="w-full h-full object-cover opacity-[0.12]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a]/80 via-transparent to-[#0a0a1a]" />
          </div>
          <div className="text-center max-w-5xl mx-auto z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-[#818cf8] mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-[#22d65e] animate-pulse" />
              Beta Cerrado — Paper Trading Gamificado
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-slide-up">
              <span className="text-white">Donde tus </span>
              <span className="text-gradient-gold">HODLs</span>
              <br />
              <span className="text-white">construyen tu </span>
              <span className="text-gradient">reino</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-[#8888b0] max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Paper trading con charts reales de BTC, ETH y SOL.
              <br className="hidden md:block" />
              Cada trade forja un héroe. Cada HODL construye tu casa en HodlVille.
            </p>

            {/* CTA */}
            <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={() => setShowLogin(true)}
                className="btn-primary text-base !px-8 !py-3.5 !rounded-2xl group"
              >
                <span className="flex items-center gap-2">
                  Construir mi reino
                  <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                </span>
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary text-base !px-8 !py-3.5 !rounded-2xl"
              >
                Ver más
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              {[
                { value: '3', label: 'Pares', sub: 'BTC · ETH · SOL' },
                { value: '5', label: 'Exchanges', sub: 'BingX · HL · Bybit · Uni' },
                { value: '100x', label: 'Apalanc.', sub: 'Paper trading real' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-[#8888b0] text-xs font-medium mt-0.5">{stat.label}</div>
                  <div className="text-[#5c5c80] text-xs mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-deep)] to-transparent pointer-events-none" />
        </section>
        </AuroraBackground>

        {/* Features Section */}
        <section id="features" className="relative px-6 py-24 md:py-32">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Así funciona <span className="text-gradient">HodlVille</span>
              </h2>
              <p className="text-[#8888b0] text-lg max-w-xl mx-auto">
                Trading simulado + mundo pixel. Ganas en el chart, crece tu reino.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: <BarChart3 size={22} />,
                  title: 'Paper Trade',
                  desc: 'Tradear BTC, ETH y SOL con charts reales, EMA, MACD, y apalancamiento hasta 100x.',
                  color: '#6366f1',
                },
                {
                  icon: <Sparkles size={22} />,
                  title: 'Trade → Héroe',
                  desc: 'Cada trade vivo crea un personaje único. Ganas → sube de nivel. Pierdes → se debilita.',
                  color: '#22d65e',
                },
                {
                  icon: <Wallet size={22} />,
                  title: 'Hold → Casa',
                  desc: 'Tus posiciones construyen tu hogar. De tienda de campaña a castillo según tu portfolio.',
                  color: '#f0b90b',
                },
                {
                  icon: <Globe2 size={22} />,
                  title: 'Exchange Style',
                  desc: 'Colores e insignias según el exchange: ⚡ BingX, 🌊 Hyperliquid, 🔥 Bybit, 🦄 Uniswap.',
                  color: '#00e6ff',
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="glass-card group p-6 md:p-7 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition group-hover:scale-110"
                    style={{ background: `${f.color}15`, color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-[#8888b0] text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="relative px-6 py-24 md:py-32">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Empieza en <span className="text-gradient-gold">3 pasos</span>
              </h2>
              <p className="text-[#8888b0] text-lg">No necesitas crypto real. Solo ganas y construyes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  title: 'Conecta',
                  desc: 'Login con MetaMask o como invitado. Recibes 10,000 monedas virtuales para empezar.',
                  icon: '🔗',
                },
                {
                  step: '02',
                  title: 'Tradear',
                  desc: 'Analiza los charts con EMA/MACD. Abre longs o shorts con apalancamiento realista.',
                  icon: '📊',
                },
                {
                  step: '03',
                  title: 'Construye',
                  desc: 'Gana trades para subir de nivel a tu héroe. Haz HODL para que tu casa crezca.',
                  icon: '🏗️',
                },
              ].map((s, i) => (
                <div key={i} className="glass-card p-7 text-center animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="text-4xl mb-4">{s.icon}</div>
                  <div className="text-[#6366f1] text-xs font-bold tracking-widest mb-2">{s.step}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-[#8888b0] text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass-card p-10 md:p-14 animated-border">
              <div className="text-5xl mb-6">🏡</div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                ¿Listo para construir tu{' '}
                <span className="text-gradient">reino</span>?
              </h2>
              <p className="text-[#8888b0] text-lg mb-8 max-w-lg mx-auto">
                Entra ahora. Sin registro complicado. Sin riesgos reales. Solo tú, los charts, y tu mundo pixel.
              </p>
              <button
                onClick={() => setShowLogin(true)}
                className="btn-primary text-base !px-10 !py-4 !rounded-2xl text-lg group"
              >
                <span className="flex items-center gap-2">
                  🚀 Empezar ahora
                  <ArrowRight size={20} className="transition group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </div>
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
