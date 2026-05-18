'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Achievement, ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { toast } from '@/hooks/useToast';
import { sfx } from '@/lib/sfx';

interface AchievementsState {
  unlocked: Record<string, number>; // key -> timestamp
  unlock: (key: string) => void;
  checkAll: (state: any) => void;
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      unlocked: {},
      unlock: (key: string) => {
        const ach = ALL_ACHIEVEMENTS.find(a => a.key === key);
        if (!ach || get().unlocked[key]) return;

        set(state => ({
          unlocked: { ...state.unlocked, [key]: Date.now() }
        }));

        // Fire toast and sfx
        sfx.achievement();
        toast.reward('🏆 ¡Logro Desbloqueado!', `${ach.name}: ${ach.description}`);
        
        // Add rewards via Portfolio store if needed
        // Since we can't easily import usePortfolioStore without circular dependency issues sometimes,
        // we can handle it at the component level or use a custom event.
        if (ach.reward) {
          import('@/hooks/usePortfolio').then(({ usePortfolioStore }) => {
            const { addCoins, addXp } = usePortfolioStore.getState();
            addCoins(ach.reward!.coins);
            addXp(ach.reward!.xp);
          });
        }
      },
      checkAll: (state: any) => {
        // Implement logic to check all achievements based on current state
        const unlockedKeys = new Set(Object.keys(get().unlocked));
        for (const ach of ALL_ACHIEVEMENTS) {
          if (unlockedKeys.has(ach.key)) continue;

          let progress = 0;
          switch (ach.key) {
            case 'first_trade': progress = state.totalTrades || 0; break;
            case 'ten_trades': progress = state.totalTrades || 0; break;
            case 'fifty_trades': progress = state.totalTrades || 0; break;
            case 'hundred_trades': progress = state.totalTrades || 0; break;
            case 'first_win': progress = state.totalWins || 0; break;
            case 'streak_5': progress = state.currentStreak || 0; break;
            case 'streak_10': progress = state.currentStreak || 0; break;
            case 'first_battle': progress = state.battlesWon || 0; break;
            case 'battle_wins_10': progress = state.battlesWon || 0; break;
            case 'chat_10': progress = state.chatMessages || 0; break;
            case 'chat_50': progress = state.chatMessages || 0; break;
            // ... add others
          }

          if (progress >= ach.maxProgress) {
            get().unlock(ach.key);
          }
        }
      }
    }),
    {
      name: 'hodlville-achievements-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);