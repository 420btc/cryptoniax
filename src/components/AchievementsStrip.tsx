'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { ALL_ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, checkAchievements } from '@/lib/achievements';

export default function AchievementsStrip() {
  const { closedTrades, activeTrades, house, level, coins } = usePortfolioStore();

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

  const { unlocked, latest } = useMemo(() => {
    const unlockedKeys = new Set<string>();
    for (const ach of ALL_ACHIEVEMENTS) {
      let progress = 0;
      switch (ach.key) {
        case 'first_trade': progress = playerState.totalTrades; break;
        case 'ten_trades': progress = playerState.totalTrades; break;
        case 'fifty_trades': progress = playerState.totalTrades; break;
        case 'hundred_trades': progress = playerState.totalTrades; break;
        case 'first_win': progress = playerState.totalWins; break;
        case 'streak_5': progress = playerState.currentStreak; break;
        case 'streak_10': progress = playerState.currentStreak; break;
        case 'big_win': progress = playerState.maxWinAmount >= 100 ? 1 : 0; break;
        case 'mega_win': progress = playerState.maxWinAmount >= 500 ? 1 : 0; break;
        case 'profit_1000': progress = Math.min(playerState.totalProfit, 1000); break;
        case 'first_house': progress = playerState.houseLevel >= 2 ? 1 : 0; break;
        case 'mansion': progress = playerState.houseLevel >= 8 ? 1 : 0; break;
        case 'castle': progress = playerState.houseLevel >= 16 ? 1 : 0; break;
        case 'decorator': progress = playerState.decorations; break;
        case 'vault_lv3': progress = playerState.vaultLevel >= 3 ? 1 : 0; break;
        case 'vault_lv5': progress = playerState.vaultLevel >= 5 ? 1 : 0; break;
        case 'first_battle': progress = playerState.battlesWon; break;
        case 'battle_wins_10': progress = playerState.battlesWon; break;
        case 'level_5': progress = playerState.playerLevel >= 5 ? 1 : 0; break;
        case 'level_10': progress = playerState.playerLevel >= 10 ? 1 : 0; break;
        case 'collect_items_5': progress = playerState.ownedItemCount; break;
        case 'collect_items_15': progress = playerState.ownedItemCount; break;
        case 'all_pets': progress = playerState.petCount; break;
        case 'full_equip': progress = playerState.equippedSlots >= 9 ? 1 : 0; break;
        case 'chat_10': progress = playerState.chatMessages; break;
        case 'chat_50': progress = playerState.chatMessages; break;
        case 'daily_7': progress = playerState.loginStreak; break;
      }
      if (progress >= ach.maxProgress) unlockedKeys.add(ach.key);
    }

    const unlocked = ALL_ACHIEVEMENTS.filter(a => unlockedKeys.has(a.key));
    return { 
      unlocked: unlocked.slice(-5).reverse(), // últimas 5 conseguidas
      latest: unlocked.length,
      total: ALL_ACHIEVEMENTS.length 
    };
  }, [playerState]);

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
        {unlocked.length === 0 && (
          <div className="flex items-center gap-2 text-[10px] text-[#5c5c80] py-2">
            <Lock size={11} />
            Abre tu primer trade para desbloquear logros
          </div>
        )}
        {unlocked.map((ach, i) => {
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
