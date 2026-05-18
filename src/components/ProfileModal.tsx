'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import {
  X, User, Home, Swords, TrendingUp, Wallet, Target,
  Zap, Shield, Clock, Star, Gem, Crown
} from 'lucide-react';
import { EXCHANGE_THEMES, ExchangeType, TradeType } from '@/types';

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

  // Determine character from active trades
  const firstTrade = activeTrades[0];
  const charType: TradeType = firstTrade?.type || 'spot';
  const charRole = charType === 'futures' ? 'warrior' : 'merchant';
  const charLevel = Math.min(5, Math.max(1, Math.ceil(level / 4)));
  const charExchange = (firstTrade?.exchange || 'bingx') as ExchangeType;
  const charColor = EXCHANGE_THEMES[charExchange]?.color || '#6366f1';

  // Hero sprite path
  const heroSprite = `/sprites/v2/hero_${charExchange}_${charRole}_lv${charLevel}.png`;

  // Equipment (basado en nivel)
  const equipmentByLevel: Record<number, { name: string; sprite: string }[]> = {
    1: [{ name: 'Espada Madera', sprite: 'item_wooden_sword.png' }, { name: 'Armadura Cuero', sprite: 'item_leather_armor.png' }],
    2: [{ name: 'Espada Hierro', sprite: 'item_iron_sword.png' }, { name: 'Cota Malla', sprite: 'item_chainmail.png' }, { name: 'Casco Básico', sprite: 'item_basic_helmet.png' }],
    3: [{ name: 'Mandoble', sprite: 'item_steel_broadsword.png' }, { name: 'Placa Acero', sprite: 'item_steel_plate.png' }, { name: 'Casco Cuernos', sprite: 'item_horned_helmet.png' }, { name: 'Escudo Madera', sprite: 'item_wooden_shield.png' }],
    4: [{ name: 'Espada Llameante', sprite: 'item_flaming_sword.png' }, { name: 'Armadura Mithril', sprite: 'item_mithril_armor.png' }, { name: 'Casco Alado', sprite: 'item_winged_helmet.png' }, { name: 'Escudo Hierro', sprite: 'item_iron_shield.png' }, { name: 'Capa Simple', sprite: 'item_simple_cape.png' }],
    5: [{ name: 'Gran Espada Cristal', sprite: 'item_crystal_greatsword.png' }, { name: 'Armadura Radiante', sprite: 'item_radiant_armor.png' }, { name: 'Casco Corona', sprite: 'item_crown_helmet.png' }, { name: 'Escudo Cristal', sprite: 'item_crystal_shield.png' }, { name: 'Capa Real', sprite: 'item_royal_cape.png' }],
  };
  const equipment = equipmentByLevel[charLevel] || equipmentByLevel[1];

  const houseEmoji = house?.style === 'tent' ? '🏕️'
    : house?.style === 'wood_house' ? '🪵'
    : house?.style === 'stone_house' ? '🏠'
    : house?.style === 'mansion' ? '🏛️'
    : house?.style === 'castle' ? '🏰'
    : '🏚️';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[rgba(5,5,15,0.75)] backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal — bigger on desktop */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative glass-card !p-0 w-full max-w-md sm:max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-[#5c5c80] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition"
            >
              <X size={16} />
            </button>

            {/* ── Hero Banner with Sprite ── */}
            <div className="relative h-44 sm:h-52 bg-gradient-to-b from-[#6366f1]/15 via-[#4f46e5]/5 to-transparent flex items-center justify-center">
              <div className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, ${charColor}40 0%, transparent 60%)`,
                }}
              />
              {/* Hero sprite */}
              <motion.img
                src={heroSprite}
                alt="Hero"
                className="relative z-10 object-contain max-h-32 sm:max-h-40 drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Fallback emoji if sprite fails */}
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10 pointer-events-none">
                {charRole === 'warrior' ? '⚔️' : '🛡️'}
              </div>

              {/* Level badge */}
              <motion.div
                className="absolute top-4 left-4 glass !rounded-xl px-3 py-1.5 flex items-center gap-1.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <Star size={13} className="text-[#fbbf24]" fill="#fbbf24" />
                <span className="text-sm font-bold text-white">Nv.{level}</span>
              </motion.div>

              {/* Exchange badge */}
              <motion.div
                className="absolute top-4 right-12 glass !rounded-xl px-3 py-1.5 flex items-center gap-1.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.35, type: 'spring' }}
                style={{ borderColor: `${charColor}30` }}
              >
                <span style={{ color: charColor }}>{EXCHANGE_THEMES[charExchange]?.insignia}</span>
                <span className="text-xs font-medium text-white">{EXCHANGE_THEMES[charExchange]?.name}</span>
              </motion.div>
            </div>

            {/* ── Identity ── */}
            <div className="px-5 pb-5 space-y-4">
              <div className="text-center -mt-6 relative z-10">
                <h2 className="text-lg font-bold text-white">{username}</h2>
                <p className="text-[11px] text-[#5c5c80]">
                  {charRole === 'warrior' ? '⚔️ Guerrero' : '🛡️ Mercader'} · {EXCHANGE_THEMES[charExchange]?.name}
                </p>
              </div>

              {/* XP Bar */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#5c5c80]">Experiencia</span>
                  <span className="text-[#818cf8] tabular-nums">{xp}/{levelXp} XP</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[rgba(99,102,241,0.1)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#818cf8]"
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>

              {/* RPG Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Zap, label: 'HP', value: `${Math.floor(100 * (1 + level * 0.2))}`, color: '#22d65e' },
                  { icon: Swords, label: 'ATK', value: `${Math.floor(10 * (1 + level * 0.3))}`, color: '#ef4466' },
                  { icon: Shield, label: 'DEF', value: `${Math.floor(5 * (1 + level * 0.25))}`, color: '#818cf8' },
                ].map((s, i) => (
                  <div key={i} className="glass !rounded-lg p-2.5 text-center">
                    <div className="flex justify-center mb-1">{<s.icon size={13} style={{ color: s.color }} />}</div>
                    <div className="text-sm font-bold text-white">{s.value}</div>
                    <div className="text-[9px] text-[#5c5c80]">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Wallet, label: 'Saldo', value: `$${coins.toFixed(0)}`, color: '#f0b90b' },
                  { icon: Target, label: 'Win Rate', value: `${winRate}%`, color: winRate >= 50 ? '#22d65e' : '#ef4466' },
                  { icon: TrendingUp, label: 'P&L Total', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? '#22d65e' : '#ef4466' },
                  { icon: Crown, label: 'Mejor Trade', value: bestTrade > 0 ? `+$${bestTrade.toFixed(2)}` : '—', color: '#fbbf24' },
                ].map((s, i) => (
                  <div key={i} className="glass !rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 text-[9px] text-[#5c5c80] mb-1">
                      <span style={{ color: s.color }}>{<s.icon size={11} />}</span>
                      {s.label}
                    </div>
                    <div className="text-xs font-bold text-white">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Equipment (items equipados) */}
              {equipment.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#5c5c80] mb-2">
                    <Swords size={11} className="text-[#f59e0b]" />
                    Equipamiento
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {equipment.map((eq, i) => (
                      <div key={i} className="glass !rounded-lg p-1.5 flex items-center gap-1.5" title={eq.name}>
                        <img
                          src={`/sprites/v2/${eq.sprite}`}
                          alt={eq.name}
                          className="w-6 h-6 sm:w-7 sm:h-7 object-contain pixelated"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <span className="text-[10px] text-[#d0d0e0] hidden sm:inline">{eq.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* House */}
              <div className="glass !rounded-lg p-3 flex items-center gap-3">
                <span className="text-2xl">{houseEmoji}</span>
                <div className="flex-1">
                  <div className="text-xs font-bold text-white">
                    {house?.style?.replace(/_/g, ' ')?.replace(/\b\w/g, c => c.toUpperCase()) || 'Sin casa'}
                  </div>
                  <div className="text-[10px] text-[#5c5c80]">
                    Nivel {house?.level || 1} · {house?.decorations?.length || 0} decoraciones
                  </div>
                </div>
                <Gem size={14} className="text-[#818cf8]" />
              </div>

              {/* Active Trades Mini-list */}
              {activeTrades.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#5c5c80] mb-2">
                    <Swords size={12} className="text-[#f0b90b]" />
                    Trades Activos ({activeTrades.length})
                  </div>
                  <div className="space-y-1">
                    {activeTrades.slice(0, 4).map((t, i) => (
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
                    {activeTrades.length > 4 && (
                      <div className="text-center text-[10px] text-[#5c5c80] pt-1">
                        +{activeTrades.length - 4} más
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
