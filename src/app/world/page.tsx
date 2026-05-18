'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { Globe, MapPin, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import BackButton from '@/components/BackButton';

const PixiWorld = dynamic(() => import('@/components/PixiWorld'), {
  ssr: false,
  loading: () => (
    <div className="glass-card !p-16 text-center" style={{ height: 500 }}>
      <div className="text-4xl mb-4 animate-pulse">🌍</div>
      <div className="shimmer w-32 h-4 rounded mx-auto mb-2" />
      <div className="shimmer w-48 h-3 rounded mx-auto" />
    </div>
  ),
});

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const cardAnim = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function WorldPage() {
  const { activeTrades, closedTrades, level, coins } = usePortfolioStore();

  // Mark daily quest
  useEffect(() => {
    try {
      const key = 'hodlville_daily_quests';
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        if (!data.completed?.includes('visit_world')) {
          data.completed = [...(data.completed || []), 'visit_world'];
          localStorage.setItem(key, JSON.stringify(data));
        }
      }
    } catch {}
  }, []);

  const winRate = closedTrades.length > 0
    ? Math.round((closedTrades.filter(t => (t.pnl || 0) > 0).length / closedTrades.length) * 100)
    : 0;

  const stats = [
    { icon: <TrendingUp size={14} />, label: 'Nivel', value: level.toString(), color: '#818cf8' },
    { icon: <MapPin size={14} />, label: 'Biomas', value: '6', color: '#22d65e' },
    { icon: <Globe size={14} />, label: 'Online', value: '6', color: '#00e6ff' },
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
        <h1 className="text-2xl md:text-3xl font-bold text-white mt-2">🌍 Mapa de HodlVille</h1>
        <p className="text-[#8888b0] text-sm mt-1">
          Explora biomas, encuentra traders, conquista territorios.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <motion.div key={i} variants={cardAnim} whileHover={{ y: -2 }} className="glass-card !p-3 text-center">
            <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
            <div className="text-lg font-bold text-white tabular-nums">{s.value}</div>
            <div className="text-[10px] text-[#5c5c80]">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Interactive Pixi World */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PixiWorld />
      </motion.div>

      {/* Player activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <div className="glass-card !p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-[#f0b90b]" />
            <span className="text-sm font-bold text-white">Tu actividad</span>
          </div>
          <div className="space-y-2 text-[11px] text-[#8888b0]">
            <div className="flex justify-between">
              <span>Trades totales</span>
              <span className="text-white font-bold">{closedTrades.length + activeTrades.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Win Rate</span>
              <span className={winRate >= 50 ? 'text-[#22d65e] font-bold' : 'text-[#ef4466] font-bold'}>{winRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Balance</span>
              <span className="text-white font-bold">${coins.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Activos ahora</span>
              <span className="text-[#22d65e] font-bold">{activeTrades.length}</span>
            </div>
          </div>
        </div>

        <div className="glass-card !p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={14} className="text-[#818cf8]" />
            <span className="text-sm font-bold text-white">Biomas disponibles</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {[
              { name: 'Ciudad Central', icon: '🏰', color: '#6366f1' },
              { name: 'Bosque Encantado', icon: '🌲', color: '#22d65e' },
              { name: 'Montañas de Hielo', icon: '🏔️', color: '#00e6ff' },
              { name: 'Desierto Ardiente', icon: '🏜️', color: '#ef4466' },
              { name: 'Volcán', icon: '🌋', color: '#f59e0b' },
              { name: 'Playa Dorada', icon: '🏖️', color: '#f0b90b' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-1.5 glass !rounded-lg px-2 py-1.5">
                <span>{b.icon}</span>
                <span className="text-[#8888b0]">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
