'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { ALL_ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, checkAchievements } from '@/lib/achievements';

import { useAchievementsStore } from '@/hooks/useAchievements';
import { useEffect } from 'react';

export default function AchievementsStrip() {
  const { closedTrades, activeTrades, house, level, coins } = usePortfolioStore();
  const { unlocked, checkAll } = useAchievementsStore();

  // Compute player state for achievement checking
  const playerState = useMemo(() => {
    const totalTrades = closedTrades.length;
    const totalWins = closedTrades.filter(t => (t.pnl || 0) > 0).length;
    
    // Current streak
    let streak = 0;
    for (let i = closedTrades.length - 1; i >= 0; i--) {
      if ((closedTrades[i].pnl || 0) > 0) streak++;
      else break;
    }

    const maxWinAmount = closedTrades.reduce((max, t) => Math.max(max, t.pnl || 0), 0);
    const totalProfit = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const houseLevel = house?.level || 1;
    const decorations = house?.decorations?.length || 0;
    const vaultLevel = coins < 50 ? 1 : coins < 200 ? 2 : coins < 500 ? 3 : coins < 1000 ? 4 : 5;

    return {
      totalTrades, totalWins, currentStreak: streak,
      maxWinAmount, totalProfit, houseLevel, decorations, vaultLevel,
      battlesWon: totalWins, playerLevel: level,
      ownedItemCount: 0, petCount: 0, equippedSlots: 0,
      chatMessages: 0, loginStreak: 0,
    };
  }, [closedTrades, house, level, coins]);

  useEffect(() => {
    checkAll(playerState);
  }, [playerState, checkAll]);

  const { unlockedList, latest } = useMemo(() => {
    const sorted = Object.entries(unlocked)
      .sort(([, timeA], [, timeB]) => timeB - timeA)
      .map(([key]) => ALL_ACHIEVEMENTS.find(a => a.key === key))
      .filter(Boolean) as typeof ALL_ACHIEVEMENTS;
    return {
      unlockedList: sorted.slice(0, 5),
      latest: sorted.length,
      total: ALL_ACHIEVEMENTS.length
    };
  }, [unlocked]);

  if (ALL_ACHIEVEMENTS.length === 0) return null;

  return (
    <div className="glass-card !p-3 sm:!p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy size={15} className="text-[#fbbf24]" />
          <span className="text-sm font-semibold text-white">Logros</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#5c5c80]">{latest}/{ALL_ACHIEVEMENTS.length}</span>
          <div className="w-16 h-1.5 rounded-full bg-[rgba(99,102,241,0.1)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#818cf8]"
              animate={{ width: `${(latest / ALL_ACHIEVEMENTS.length) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {unlockedList.length === 0 && (
          <div className="flex items-center gap-2 text-[10px] text-[#5c5c80] py-2">
            <Lock size={11} />
            Abre tu primer trade para desbloquear logros
          </div>
        )}
        {unlockedList.map((ach, i) => {
          const cat = ACHIEVEMENT_CATEGORIES[ach.category];
          return (
            <motion.div
              key={ach.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 glass !rounded-lg p-2 flex items-center gap-2 min-w-[140px]"
              style={{ borderColor: `${cat?.color || '#6366f1'}20` }}
            >
              <span className="text-lg">{ach.icon}</span>
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-white truncate">{ach.name}</div>
                {ach.reward && (
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span style={{ color: cat?.color || '#6366f1' }}>+{ach.reward.xp} XP</span>
                    <span className="text-[#f0b90b]">+{ach.reward.coins}🪙</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
