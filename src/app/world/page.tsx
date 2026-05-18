'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { Globe, MapPin, Users, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import BackButton from '@/components/BackButton';

const MapboxGlobe = dynamic(() => import('@/components/MapboxGlobe'), {
  ssr: false,
  loading: () => (
    <div className="glass-card !p-16 text-center" style={{ height: 540 }}>
      <div className="text-4xl mb-4 animate-pulse">🌍</div>
      <div className="shimmer w-32 h-4 rounded mx-auto mb-2" />
      <div className="shimmer w-48 h-3 rounded mx-auto" />
    </div>
  ),
});

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const cardAnim = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function WorldPage() {
  const { activeTrades, closedTrades } = usePortfolioStore();

  // Mark daily quest "visit_world"
  useEffect(() => {
    const key = 'hodlville_daily_quests';
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      if (!data.completed.includes('visit_world')) {
        data.completed.push('visit_world');
        localStorage.setItem(key, JSON.stringify(data));
      }
    }
  }, []);

  const stats = [
    { icon: <TrendingUp size={14} />, label: 'Trades Activos', value: activeTrades.length.toString(), color: '#22d65e' },
    { icon: <Users size={14} />, label: 'Jugadores Online', value: '9', color: '#818cf8' },
    { icon: <MapPin size={14} />, label: 'Ubicaciones', value: '10', color: '#f59e0b' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <BackButton />
        <h1 className="text-2xl md:text-3xl font-bold text-white mt-2">🌍 HodlVille World</h1>
        <p className="text-[#8888b0] text-sm mt-1">
          Mapa global con traders en tiempo real. Conecta, desafía, conquista.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <motion.div key={i} variants={cardAnim} whileHover={{ y: -2 }} className="glass-card !p-3 text-center">
            <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
            <div className="text-lg font-bold text-white">{s.value}</div>
            <div className="text-[10px] text-[#5c5c80]">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Mapbox Globe */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <MapboxGlobe />
      </motion.div>

      {/* Player list */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card !p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={15} className="text-[#818cf8]" />
          <span className="text-sm font-semibold text-white">Jugadores en el mundo</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { name: 'CryptoKing', lvl: 5, color: '#00e6ff', online: true },
            { name: 'HodlQueen', lvl: 3, color: '#f7a600', online: true },
            { name: 'SolanaWolf', lvl: 4, color: '#ff007a', online: true },
            { name: 'EthSurfer', lvl: 2, color: '#00e6ff', online: true },
            { name: 'TradeWizard', lvl: 7, color: '#f0b90b', online: true },
            { name: 'CryptoNinja', lvl: 4, color: '#00e6ff', online: true },
            { name: 'MoonBoy', lvl: 1, color: '#ff007a', online: true },
            { name: 'BTCMaxi', lvl: 6, color: '#f0b90b', online: false },
            { name: 'DiamondHands', lvl: 3, color: '#f7a600', online: false },
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-2 glass !rounded-lg px-3 py-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${p.online ? 'bg-[#22d65e]' : ''}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${p.online ? 'bg-[#22d65e]' : 'bg-[#5c5c80]'}`} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">{p.name}</div>
                <div className="text-[10px] text-[#5c5c80]">Lv.{p.lvl}</div>
              </div>
              <button className="text-[10px] px-2 py-1 rounded-md glass text-[#818cf8] hover:text-white transition">
                Retar
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
