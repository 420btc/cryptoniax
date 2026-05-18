'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { Swords, Shield, Zap, TrendingUp } from 'lucide-react';

const BattleAIChat = dynamic(() => import('@/components/BattleAIChat'), {
  ssr: false,
  loading: () => (
    <div className="glass-card !p-16 text-center h-[500px] flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl mb-3 animate-pulse">⚔️</div>
        <p className="text-[#8888b0] text-sm">Invocando al oráculo de batalla...</p>
      </div>
    </div>
  ),
});

export default function BattlesPage() {
  const { activeTrades, closedTrades, xp } = usePortfolioStore();

  const stats = useMemo(() => {
    const today = new Date().toDateString();

    const wonToday = closedTrades.filter((t) => {
      const isToday = t.closed_at && new Date(t.closed_at).toDateString() === today;
      return isToday && (t.pnl || 0) > 0;
    }).length;

    const lostToday = closedTrades.filter((t) => {
      const isToday = t.closed_at && new Date(t.closed_at).toDateString() === today;
      return isToday && (t.pnl || 0) <= 0;
    }).length;

    const battlesToday = wonToday + lostToday;
    const battleWinRate = battlesToday > 0 ? Math.round((wonToday / battlesToday) * 100) : 0;

    // Streak calculation
    let w = 0, l = 0;
    for (let i = closedTrades.length - 1; i >= 0; i--) {
      if ((closedTrades[i].pnl || 0) > 0) { w++; if (l > 0) break; }
      else { l++; if (w > 0) break; }
    }
    const streak = w > l ? `W${w}` : l > w ? `L${l}` : '-';

    // XP gained today
    const xpToday = closedTrades
      .filter((t) => t.closed_at && new Date(t.closed_at).toDateString() === today)
      .reduce((sum, t) => sum + Math.floor(Math.abs(t.pnl || 0) * 10), 0);

    return { battlesToday, battleWinRate, streak, xpToday };
  }, [closedTrades]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">⚔️ Zona de Batallas</h1>
        <p className="text-[#8888b0] text-sm mt-1">
          Tus guerreros luchan aquí. El chat IA analiza tu rendimiento y te da estrategia en tiempo real.
        </p>
      </div>

      {/* Battle Stats — dynamic */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: <Swords size={14} />, label: 'Batallas Hoy', value: stats.battlesToday.toString(), color: '#f0b90b' },
          { icon: <Shield size={14} />, label: 'Win Rate', value: `${stats.battleWinRate}%`, color: '#22d65e' },
          { icon: <Zap size={14} />, label: 'Racha', value: stats.streak, color: '#6366f1' },
          { icon: <TrendingUp size={14} />, label: 'XP Hoy', value: `+${stats.xpToday}`, color: '#f59e0b' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="glass-card !p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center gap-2 text-[10px] text-[#5c5c80] mb-2">
              {stat.icon}
              {stat.label}
            </div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active warriors summary */}
      {activeTrades.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card !p-4 mb-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Swords size={14} className="text-[#f0b90b]" />
            <span className="text-xs font-medium text-white">
              {activeTrades.length} guerrero{activeTrades.length > 1 ? 's' : ''} en batalla
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeTrades.map((trade, i) => (
              <span
                key={i}
                className="text-[11px] px-2.5 py-1 rounded-lg glass text-[#d0d0e0] flex items-center gap-1.5"
              >
                <span style={{ color: trade.side === 'long' ? '#22d65e' : '#ef4466' }}>
                  {trade.side === 'long' ? '▲' : '▼'}
                </span>
                {trade.symbol} {trade.type === 'futures' ? `${trade.leverage}x` : 'Spot'}
                <span className="text-[#5c5c80]">|</span>
                <span className={trade.pnl && trade.pnl >= 0 ? 'text-[#22d65e]' : 'text-[#ef4466]'}>
                  {trade.pnl ? (trade.pnl >= 0 ? '+' : '') + '$' + trade.pnl.toFixed(2) : '...'}
                </span>
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Chat */}
      <div className="glass-card !p-0 overflow-hidden">
        <div className="h-[500px]">
          <BattleAIChat />
        </div>
      </div>
    </motion.div>
  );
}
