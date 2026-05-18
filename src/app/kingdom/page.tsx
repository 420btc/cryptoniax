'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { useAuthStore } from '@/hooks/useAuth';
import { Gem, Pickaxe, Crown, Users, TrendingUp, ArrowRight, Globe } from 'lucide-react';
import KingdomCanvas from '@/components/KingdomCanvas';
import BackButton from '@/components/BackButton';
import Link from 'next/link';

const EXCHANGE_THEMES: Record<string, { color: string; name: string }> = {
  bingx: { color: '#f0b90b', name: 'BingX' },
  hyperliquid: { color: '#00e6ff', name: 'Hyperliquid' },
  bybit: { color: '#ef4466', name: 'Bybit' },
  uniswap: { color: '#f7a600', name: 'Uniswap' },
  other: { color: '#5c5c80', name: 'Exchange' },
};

export default function KingdomPage() {
  const { activeTrades, closedTrades, level, house, coins } = usePortfolioStore();
  const { profile } = useAuthStore();
  const username = profile?.email?.split('@')[0] || 'Trader';

  const totalTrades = closedTrades.length + activeTrades.length;
  const winRate = closedTrades.length > 0
    ? Math.round((closedTrades.filter(t => (t.pnl || 0) > 0).length / closedTrades.length) * 100)
    : 0;
  const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl || 0), 0);

  const gold = coins;
  const materials = totalTrades * 2;
  const influence = level * 10 + Math.floor(totalPnl);

  // Generate heroes from trades
  const heroes = useMemo(() => {
    const active = activeTrades.slice(0, 8).map((t: any, i: number) => ({
      id: `active_${i}`,
      symbol: t.symbol,
      exchange: t.exchange || 'other',
      side: t.side,
      type: t.type === 'futures' ? 'warrior' : 'merchant',
      level: Math.min(5, Math.ceil((closedTrades.filter((ct: any) => ct.symbol === t.symbol).length + 1) / 3)),
      working: true,
      pnl: t.pnl || 0,
    }));
    return active;
  }, [activeTrades, closedTrades]);

  const citizens = heroes.filter(h => h.working);
  const totalGoldPerTick = heroes.reduce((s, h) => s + h.level * 0.5, 0);

  const resourceBars = [
    { icon: <Gem size={16} />, label: 'Oro', value: gold.toLocaleString(), color: '#f0b90b', sub: `+${totalGoldPerTick.toFixed(1)}/tick` },
    { icon: <Pickaxe size={16} />, label: 'Materiales', value: materials.toLocaleString(), color: '#f59e0b', sub: `${totalTrades} trades` },
    { icon: <Crown size={16} />, label: 'Influencia', value: influence.toString(), color: '#818cf8', sub: `Nv.${level}` },
    { icon: <TrendingUp size={16} />, label: 'Win Rate', value: `${winRate}%`, color: winRate >= 50 ? '#22d65e' : '#ef4466', sub: totalPnl >= 0 ? `+$${totalPnl.toFixed(2)}` : `-$${Math.abs(totalPnl).toFixed(2)}` },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <BackButton />
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-2">🏰 Reino de {username}</h1>
          <p className="text-[#8888b0] text-sm mt-1">
            Tu reino crece con cada trade. Explora, construye, conquista.
          </p>
        </div>
        <Link
          href="/world"
          className="hidden sm:flex items-center gap-2 glass !rounded-xl px-4 py-2 text-xs font-medium text-[#818cf8] hover:text-white transition"
        >
          <Globe size={14} />
          Mundo
          <ArrowRight size={13} />
        </Link>
      </motion.div>

      {/* Resources */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-2"
      >
        {resourceBars.map((r, i) => (
          <motion.div
            key={i}
            className="glass-card !p-3 text-center"
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex justify-center mb-1" style={{ color: r.color }}>{r.icon}</div>
            <div className="text-lg font-bold text-white tabular-nums">{r.value}</div>
            <div className="text-[10px] text-[#5c5c80]">{r.label}</div>
            <div className="text-[8px] text-[#3c3c60]">{r.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Interactive Kingdom Canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <KingdomCanvas />
      </motion.div>

      {/* Heroes trabajando */}
      {citizens.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card !p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Users size={15} className="text-[#22d65e]" />
            <span className="text-sm font-bold text-white">Héroes activos ({citizens.length})</span>
            <span className="text-[10px] text-[#5c5c80]">+{totalGoldPerTick.toFixed(1)} oro/s</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {citizens.map((h) => {
              const theme = EXCHANGE_THEMES[h.exchange] || EXCHANGE_THEMES.other;
              return (
                <motion.div
                  key={h.id}
                  className="glass !rounded-lg p-2 flex items-center gap-2"
                  whileHover={{ y: -1 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-[rgba(99,102,241,0.1)] flex items-center justify-center text-sm">
                    {h.side === 'long' ? '📈' : '📉'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-white truncate">{h.symbol}</div>
                    <div className="text-[9px]" style={{ color: theme.color }}>{theme.name} · Lv.{h.level}</div>
                    <div className="text-[8px] text-[#5c5c80]">{h.side.toUpperCase()}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard" className="glass-card !p-3 flex items-center gap-3 hover:bg-[rgba(255,255,255,0.03)] transition group">
          <TrendingUp size={28} className="text-[#f0b90b]" />
          <div className="flex-1">
            <div className="text-xs font-bold text-white">📊 Ir a Trading</div>
            <div className="text-[9px] text-[#5c5c80]">Abre nuevas posiciones</div>
          </div>
          <ArrowRight size={14} className="text-[#5c5c80] group-hover:translate-x-0.5 transition" />
        </Link>
        <Link href="/housing" className="glass-card !p-3 flex items-center gap-3 hover:bg-[rgba(255,255,255,0.03)] transition group">
          <Gem size={28} className="text-[#c084fc]" />
          <div className="flex-1">
            <div className="text-xs font-bold text-white">🏠 Mejorar Casa</div>
            <div className="text-[9px] text-[#5c5c80]">{house?.style?.replace('_', ' ') || 'Sin casa'} · Nv.{house?.level || 1}</div>
          </div>
          <ArrowRight size={14} className="text-[#5c5c80] group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </motion.div>
  );
}
