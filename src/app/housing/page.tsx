'use client';

import { motion } from 'framer-motion';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { getHouseStyle, HOUSE_LEVELS } from '@/lib/gameLogic';
import { Home, TrendingUp, Star, ArrowUp, Crown, Sparkles, Gem, Shield, Warehouse } from 'lucide-react';
import { useState, useMemo } from 'react';

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const cardAnim = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const STYLE_INFO: Record<string, { emoji: string; name: string; color: string; desc: string }> = {
  tent: { emoji: '🏕️', name: 'Tienda', color: '#a3a3a3', desc: 'Un humilde comienzo en el reino' },
  wood_house: { emoji: '🪵', name: 'Cabaña', color: '#d4a574', desc: 'Madera firme, cimientos de trader' },
  stone_house: { emoji: '🏠', name: 'Casa de Piedra', color: '#94a3b8', desc: 'Muros sólidos, profits crecientes' },
  mansion: { emoji: '🏛️', name: 'Mansión', color: '#c084fc', desc: 'Lujo y poder en HodlVille' },
  castle: { emoji: '🏰', name: 'Castillo', color: '#fbbf24', desc: 'La cima del reino. Leyenda viva.' },
};

const DECORATIONS_SHOP = [
  { id: 'garden', name: 'Jardín Zen', emoji: '🌿', cost: 25, minStyle: 'wood_house', desc: 'Un jardín que crece con tus profits' },
  { id: 'fence', name: 'Valla Dorada', emoji: '🏗️', cost: 50, minStyle: 'stone_house', desc: 'Protege tu territorio' },
  { id: 'fountain', name: 'Fuente BTC', emoji: '⛲', cost: 100, minStyle: 'mansion', desc: 'El símbolo ₿ fluye eternamente' },
  { id: 'statue', name: 'Estatua del Toro', emoji: '🐂', cost: 150, minStyle: 'mansion', desc: 'Wall Street en tu jardín' },
  { id: 'throne', name: 'Trono del Rey', emoji: '👑', cost: 250, minStyle: 'castle', desc: 'Solo para la realeza de HodlVille' },
];

export default function HousingPage() {
  const { house, coins, holdings, level, xp } = usePortfolioStore();
  const [selectedTab, setSelectedTab] = useState<'house' | 'upgrade' | 'decorate'>('house');

  const currentStyle = house?.style || 'tent';
  const currentLevel = house?.level || 1;
  const info = STYLE_INFO[currentStyle] || STYLE_INFO.tent;

  // Calculate sprite level (1-5) based on house level (1-20)
  const spriteLevel = useMemo(() => {
    return Math.min(5, Math.max(1, Math.ceil(currentLevel / 4)));
  }, [currentLevel]);

  // Total holdings value
  const totalHoldings = useMemo(() => {
    return Object.values(holdings || {}).reduce((sum: number, v: unknown) => sum + (Number(v) || 0), 0);
  }, [holdings]);

  // Next upgrade info
  const nextUpgrade = useMemo(() => {
    const levels = Object.entries(HOUSE_LEVELS).sort((a, b) => Number(a[0]) - Number(b[0]));
    for (const [lvl, info] of levels) {
      if (info.style !== currentStyle && Number(lvl) > 1) {
        // Find the lowest level that upgrades style
        if ((info.min || 0) > totalHoldings) {
          return {
            style: info.style,
            name: STYLE_INFO[info.style]?.name || info.style,
            emoji: STYLE_INFO[info.style]?.emoji || '🏠',
            cost: info.min || 0,
            progress: Math.min(100, (totalHoldings / (info.min || 1)) * 100),
          };
        }
      }
    }
    // Already at max
    return null;
  }, [currentStyle, totalHoldings]);

  const spritePath = `/sprites/v2/house_${currentStyle}_lv${spriteLevel}.png`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 bg-housing-cabin rounded-xl p-4 sm:p-6"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {info.emoji} Mi Casa
        </h1>
        <p className="text-[#8888b0] text-sm mt-1">
          Tu hogar en HodlVille crece con cada trade. Cuanto más ganas, más grande es tu reino.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 glass !rounded-xl !p-1 w-fit">
        {[
          { id: 'house' as const, label: '🏠 Mi Casa', icon: <Home size={13} /> },
          { id: 'upgrade' as const, label: '⬆️ Mejorar', icon: <TrendingUp size={13} /> },
          { id: 'decorate' as const, label: '✨ Decorar', icon: <Sparkles size={13} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedTab === tab.id
                ? 'bg-[rgba(99,102,241,0.15)] text-[#818cf8]'
                : 'text-[#5c5c80] hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── HOUSE VIEW ─── */}
      {selectedTab === 'house' && (
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">
          {/* Main house card with sprite */}
          <motion.div variants={cardAnim} className="glass-card !p-0 overflow-hidden">
            {/* Banner */}
            <div
              className="relative h-40 sm:h-48 flex items-center justify-center"
              style={{
                background: `radial-gradient(ellipse at center, ${info.color}15 0%, transparent 70%)`,
              }}
            >
              {/* Background particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      background: info.color,
                      left: `${15 + i * 15}%`,
                      top: `${20 + (i % 3) * 25}%`,
                      opacity: 0.3,
                    }}
                    animate={{ y: [-8, 8, -8], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2 + i * 0.5, repeat: Infinity }}
                  />
                ))}
              </div>

              {/* House sprite */}
              <motion.img
                src={spritePath}
                alt={info.name}
                className="relative z-10 object-contain max-h-36 sm:max-h-44 pixel-art"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                onError={(e) => {
                  // Fallback if sprite not found
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />

              {/* Level badge */}
              <motion.div
                className="absolute top-4 right-4 glass !rounded-xl px-3 py-1.5 flex items-center gap-1.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                <Star size={12} className="text-[#fbbf24]" fill="#fbbf24" />
                <span className="text-xs font-bold text-white">Nv.{currentLevel}</span>
              </motion.div>
            </div>

            {/* Info bar */}
            <div className="p-4 border-t border-[rgba(99,102,241,0.06)]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-white capitalize">
                    {info.name}
                  </h2>
                  <p className="text-[11px] text-[#5c5c80]">{info.desc}</p>
                </div>
                <div
                  className="text-3xl sm:text-4xl"
                  style={{ filter: 'drop-shadow(0 0 12px currentColor)' }}
                >
                  {info.emoji}
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: <Warehouse size={12} />, label: 'Holdings', value: `$${totalHoldings.toFixed(2)}`, color: '#22d65e' },
                  { icon: <Gem size={12} />, label: 'Estilo', value: info.name, color: info.color },
                  { icon: <Crown size={12} />, label: 'Rango', value: currentStyle === 'castle' ? 'Rey' : currentStyle === 'mansion' ? 'Noble' : currentStyle === 'stone_house' ? 'Burgués' : 'Aldeano', color: '#fbbf24' },
                ].map((s, i) => (
                  <div key={i} className="glass !rounded-lg p-2.5 text-center">
                    <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                    <div className="text-[11px] font-bold text-white truncate">{s.value}</div>
                    <div className="text-[9px] text-[#5c5c80]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Decorations */}
          {(house?.decorations?.length ?? 0) > 0 && (
            <motion.div variants={cardAnim} className="glass-card !p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-[#fbbf24]" />
                <span className="text-sm font-semibold text-white">Decoraciones</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(house?.decorations || []).map((d, i) => {
                  const deco = DECORATIONS_SHOP.find(x => x.id === d);
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ y: -2 }}
                      className="glass !rounded-lg px-3 py-1.5 flex items-center gap-1.5"
                    >
                      <span className="text-sm">{deco?.emoji || '✨'}</span>
                      <span className="text-[11px] text-white">{deco?.name || d}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ─── UPGRADE VIEW ─── */}
      {selectedTab === 'upgrade' && (
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
          {/* Upgrade path */}
          <motion.div variants={cardAnim} className="glass-card !p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <ArrowUp size={14} className="text-[#22d65e]" />
              Camino de Mejora
            </h3>

            <div className="space-y-3">
              {Object.entries(HOUSE_LEVELS)
                .sort((a, b) => Number(a[0]) - Number(b[0]))
                .map(([lvl, info], idx, arr) => {
                  const styleInfo = STYLE_INFO[info.style];
                  const isCurrent = info.style === currentStyle;
                  const isAchieved = (info.min || 0) <= totalHoldings;
                  const nextInfo = arr[idx + 1];
                  const progressToNext = nextInfo
                    ? Math.min(100, ((totalHoldings - (info.min || 0)) / ((nextInfo[1].min || 1) - (info.min || 0))) * 100)
                    : 100;

                  return (
                    <div key={lvl}>
                      <div className="flex items-center gap-3">
                        {/* Milestone dot */}
                        <div className="relative flex items-center justify-center w-8 h-8">
                          <div
                            className={`w-full h-full rounded-full flex items-center justify-center text-sm ${
                              isCurrent
                                ? 'bg-gradient-to-br from-[#6366f1] to-[#4f46e5] shadow-lg shadow-[#6366f1]/30'
                                : isAchieved
                                ? 'bg-[#22d65e]/20 border border-[#22d65e]/30'
                                : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]'
                            }`}
                          >
                            {isCurrent ? <Crown size={12} className="text-white" /> : isAchieved ? '✓' : styleInfo.emoji}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isCurrent ? 'text-white' : isAchieved ? 'text-[#22d65e]' : 'text-[#5c5c80]'}`}>
                              {styleInfo.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#6366f1]/20 text-[#818cf8] font-medium">
                                Actual
                              </span>
                            )}
                            {isAchieved && !isCurrent && idx < arr.length - 1 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#22d65e]/15 text-[#22d65e] font-medium">
                                Desbloqueado
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#5c5c80] mt-0.5">
                            {info.min === 0 ? 'Inicio' : `$${info.min} en holdings`}
                          </div>

                          {/* Progress bar to next */}
                          {nextInfo && isAchieved && !isCurrent && (
                            <div className="mt-2">
                              <div className="w-full h-1 rounded-full bg-[rgba(99,102,241,0.08)] overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#818cf8]"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressToNext}%` }}
                                  transition={{ duration: 0.8 }}
                                />
                              </div>
                              <div className="flex justify-between text-[9px] mt-0.5">
                                <span className="text-[#5c5c80]">${totalHoldings.toFixed(0)}</span>
                                <span className="text-[#818cf8]">${nextInfo[1].min}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Connector line */}
                      {nextInfo && (
                        <div className="ml-4 mt-1 mb-1">
                          <div className="w-px h-4 bg-[rgba(99,102,241,0.1)] ml-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ─── DECORATE VIEW ─── */}
      {selectedTab === 'decorate' && (
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
          <motion.div variants={cardAnim} className="glass-card !p-5">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles size={14} className="text-[#fbbf24]" />
              Tienda de Decoraciones
            </h3>
            <p className="text-[11px] text-[#5c5c80] mb-4">
              Embellece tu casa. Las decoraciones se desbloquean al alcanzar el estilo requerido.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DECORATIONS_SHOP.map((deco, i) => {
                const styleRank = Object.keys(STYLE_INFO).indexOf(currentStyle);
                const requiredRank = Object.keys(STYLE_INFO).indexOf(deco.minStyle);
                const isUnlocked = styleRank >= requiredRank;
                const isBought = (house?.decorations || []).includes(deco.id);
                const canAfford = coins >= deco.cost;

                return (
                  <motion.div
                    key={i}
                    whileHover={isUnlocked && !isBought ? { y: -2 } : {}}
                    className={`glass !rounded-xl p-3.5 flex items-start gap-3 transition-all ${
                      !isUnlocked ? 'opacity-40' : isBought ? 'border border-[#22d65e]/20' : ''
                    }`}
                  >
                    <div className="text-2xl">{deco.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-white">{deco.name}</span>
                        {isBought && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#22d65e]/15 text-[#22d65e]">✓</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#5c5c80] mt-0.5">{deco.desc}</div>
                      <div className="flex items-center justify-between mt-2">
                        {!isUnlocked ? (
                          <span className="text-[10px] text-[#ef4466]">
                            🔒 Necesitas {STYLE_INFO[deco.minStyle]?.name}
                          </span>
                        ) : isBought ? (
                          <span className="text-[10px] text-[#22d65e]">Comprado</span>
                        ) : (
                          <span className={`text-[11px] font-bold ${canAfford ? 'text-[#fbbf24]' : 'text-[#5c5c80]'}`}>
                            ${deco.cost}
                          </span>
                        )}
                        {isUnlocked && !isBought && (
                          <button
                            disabled={!canAfford}
                            className={`text-[10px] px-3 py-1.5 rounded-lg font-medium transition ${
                              canAfford
                                ? 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-black hover:from-[#f59e0b] hover:to-[#fbbf24]'
                                : 'bg-[rgba(255,255,255,0.03)] text-[#5c5c80] cursor-not-allowed'
                            }`}
                          >
                            Comprar
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Holdings summary footer */}
      <motion.div variants={cardAnim} initial="initial" animate="animate" className="glass-card !p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[#818cf8]" />
            <span className="text-xs text-[#5c5c80]">Tu fortuna total:</span>
          </div>
          <motion.span
            key={totalHoldings.toFixed(2)}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-sm font-bold text-white tabular-nums"
          >
            ${totalHoldings.toFixed(2)}
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}
