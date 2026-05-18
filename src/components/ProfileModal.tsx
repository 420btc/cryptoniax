'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import {
  X, User, Home, Swords, TrendingUp, Wallet, Target,
  Zap, Shield, Heart, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { EXCHANGE_THEMES, ExchangeType } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: Props) {
  const { profile } = useAuthStore();
  const {
    coins, level, xp, house, activeTrades, closedTrades, holdings
  } = usePortfolioStore();

  const username = profile?.email?.split('@')[0] || 'Trader';
  const levelXp = level * level * 100;
  const xpProgress = Math.min(100, (xp / levelXp) * 100);

  const winRate = closedTrades.length > 0
    ? Math.round((closedTrades.filter(t => (t.pnl || 0) > 0).length / closedTrades.length) * 100)
    : 0;
  const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  const bestTrade = closedTrades.length > 0 ? Math.max(...closedTrades.map(t => t.pnl || 0)) : 0;

  // Determine character type from active trades
  const charType = activeTrades.length > 0
    ? (activeTrades[0].type === 'futures' ? 'Guerrero' : 'Mercader')
    : 'Aventurero';
  const charEmoji = charType === 'Guerrero' ? '⚔️' : charType === 'Mercader' ? '🛡️' : '🧭';
  const charExchange = (activeTrades[0]?.exchange || 'bingx') as ExchangeType;
  const charColor = EXCHANGE_THEMES[charExchange]?.color || '#6366f1';

  const houseEmoji = house?.style === 'tent' ? '🏕️'
    : house?.style === 'wood_house' ? '🪵'
    : house?.style === 'stone_house' ? '🏠'
    : house?.style === 'mansion' ? '🏛️'
    : house?.style === 'castle' ? '🏰'
    : '🏚️';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[rgba(5,5,15,0.7)] backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative glass-card !p-0 w-full max-w-sm overflow-hidden"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-lg flex items-center justify-center text-[#5c5c80] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition"
            >
              <X size={14} />
            </button>

            {/* ── Header Banner ── */}
            <div className="relative h-24 bg-gradient-to-br from-[#6366f1]/20 via-[#4f46e5]/10 to-transparent">
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(99,102,241,0.3) 0%, transparent 50%)',
                }}
              />
              <div className="absolute bottom-3 left-4 flex items-end gap-3">
                <div className="w-12 h-12 rounded-xl bg-[rgba(99,102,241,0.2)] flex items-center justify-center text-2xl border border-[rgba(99,102,241,0.15)]"
                  style={{ boxShadow: `0 0 20px ${charColor}20` }}>
                  {charEmoji}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{username}</div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span style={{ color: charColor }}>
                      {charType} · {EXCHANGE_THEMES[charExchange]?.name}
                    </span>
                    <span className="text-[#5c5c80]">Nv.{level}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Content ── */}
            <div className="p-4 space-y-4">
              {/* XP Bar */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#5c5c80]">Experiencia</span>
                  <span className="text-[#818cf8]">{xp}/{levelXp} XP</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[rgba(99,102,241,0.1)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#818cf8]"
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>

              {/* Character Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: <Zap size={12} />, label: 'HP', value: '100', color: '#22d65e' },
                  { icon: <Swords size={12} />, label: 'ATK', value: `${10 + level * 2}`, color: '#ef4466' },
                  { icon: <Shield size={12} />, label: 'DEF', value: `${5 + level}`, color: '#818cf8' },
                ].map((s, i) => (
                  <div key={i} className="glass !rounded-lg p-2 text-center">
                    <div className="flex justify-center mb-0.5" style={{ color: s.color }}>{s.icon}</div>
                    <div className="text-sm font-bold text-white">{s.value}</div>
                    <div className="text-[9px] text-[#5c5c80]">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* House */}
              <div className="glass !rounded-lg p-3 flex items-center gap-3">
                <div className="text-2xl">{houseEmoji}</div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white">
                    {house?.style?.replace('_', ' ')?.replace(/\b\w/g, c => c.toUpperCase()) || 'Sin casa'}
                  </div>
                  <div className="text-[10px] text-[#5c5c80]">
                    Nivel {house?.level || 1} · {Object.entries(holdings).filter(([_, v]) => v > 0).length} holdings
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#5c5c80]">Valor</div>
                  <div className="text-xs font-bold text-[#22d65e] tabular-nums">
                    ${coins.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <Target size={11} />, label: 'Win Rate', value: `${winRate}%`, color: winRate >= 50 ? '#22d65e' : '#ef4466' },
                  { icon: <TrendingUp size={11} />, label: 'P&L Total', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? '#22d65e' : '#ef4466' },
                  { icon: <Clock size={11} />, label: 'Trades Hoy', value: closedTrades.filter(t => t.closed_at && new Date(t.closed_at).toDateString() === new Date().toDateString()).length.toString(), color: '#f59e0b' },
                  { icon: <Wallet size={11} />, label: 'Mejor Trade', value: bestTrade > 0 ? `+$${bestTrade.toFixed(2)}` : '—', color: '#22d65e' },
                ].map((s, i) => (
                  <div key={i} className="glass !rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 text-[9px] text-[#5c5c80] mb-1">
                      <span style={{ color: s.color }}>{s.icon}</span>
                      {s.label}
                    </div>
                    <div className="text-xs font-bold text-white">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Active Trades Mini-list */}
              {activeTrades.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#5c5c80] mb-2">
                    <Swords size={11} className="text-[#f0b90b]" />
                    Trades Activos ({activeTrades.length})
                  </div>
                  <div className="space-y-1">
                    {activeTrades.slice(0, 3).map((t, i) => (
                      <div key={i} className="glass !rounded-lg px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold ${t.side === 'long' ? 'text-[#22d65e]' : 'text-[#ef4466]'}`}>
                            {t.side === 'long' ? '▲' : '▼'}
                          </span>
                          <span className="text-[11px] text-white font-medium">{t.symbol}</span>
                          <span className="text-[10px] text-[#5c5c80]">{t.type === 'futures' ? `${t.leverage}x` : 'Spot'}</span>
                        </div>
                        <span className={`text-[11px] font-medium tabular-nums ${(t.pnl || 0) >= 0 ? 'text-[#22d65e]' : 'text-[#ef4466]'}`}>
                          {(t.pnl || 0) >= 0 ? '+' : ''}${(t.pnl || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {activeTrades.length > 3 && (
                      <div className="text-center text-[10px] text-[#5c5c80] pt-1">
                        +{activeTrades.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
