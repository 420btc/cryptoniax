'use client';

import LoginModal from '@/components/LoginModal';
import { useState } from 'react';
import { TrendingUp, Shield, Sparkles, Users } from 'lucide-react';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#1a0a3a] to-[#0a0a1a]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#7C3AED] rounded-full blur-[128px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#F0B90B] rounded-full blur-[128px]" />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <span className="font-pixel text-lg text-[#F0B90B]">HodlVille</span>
          </div>
          <button
            onClick={() => setShowLogin(true)}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-2.5 rounded-xl font-medium text-sm transition glow-purple"
          >
            Jugar ahora
          </button>
        </nav>

        {/* Hero */}
        <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32">
          <div className="text-6xl mb-4 animate-float">🏡</div>
          <h1 className="text-5xl md:text-7xl font-pixel text-white mb-4">
            Hodl<span className="text-[#F0B90B]">Ville</span>
          </h1>
          <p className="text-xl text-[#8888aa] mb-8 max-w-lg">
            Donde tus <span className="text-white font-bold">HODLs</span> construyen tu reino
            y tus <span className="text-[#22c55e] font-bold">trades</span> forjan tus héroes
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white px-10 py-4 rounded-2xl font-bold text-lg transition glow-purple"
          >
            🚀 Construir mi reino
          </button>
        </section>

        {/* Features */}
        <section className="relative z-10 max-w-5xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <TrendingUp size={24} />, title: 'Paper Trade', desc: 'Tradear BTC, ETH y SOL con charts reales y apalancamiento' },
            { icon: <Shield size={24} />, title: 'Hold → Casa', desc: 'Tus holdings construyen tu hogar en el mundo pixel' },
            { icon: <Sparkles size={24} />, title: 'Trade → Héroe', desc: 'Cada trade crea un personaje que sube de nivel' },
            { icon: <Users size={24} />, title: 'Exchange Style', desc: 'Colores e insignias de BingX, Hyperliquid y más' },
          ].map((f, i) => (
            <div key={i} className="bg-[#1a1a3a]/80 border border-[#2a2a5a] rounded-2xl p-5 hover:border-[#7C3AED]/50 transition">
              <div className="text-[#F0B90B] mb-3">{f.icon}</div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-[#8888aa] text-xs">{f.desc}</p>
            </div>
          ))}
        </section>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
