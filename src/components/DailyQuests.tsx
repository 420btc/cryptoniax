'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Circle } from 'lucide-react';
import { usePortfolioStore } from '@/hooks/usePortfolio';

const QUESTS_KEY = 'hodlville_daily_quests';

interface Quest {
  id: string;
  label: string;
  reward: number;
  check: () => boolean;
}

export default function DailyQuests() {
  const { activeTrades, closedTrades, addCoins, addXp } = usePortfolioStore();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [collected, setCollected] = useState<Set<string>>(new Set());

  // Load quest state from localStorage each day
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(QUESTS_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date !== today) {
        // New day, reset
        localStorage.setItem(QUESTS_KEY, JSON.stringify({ date: today, completed: [], collected: [] }));
        setCompleted(new Set());
        setCollected(new Set());
      } else {
        setCompleted(new Set(data.completed || []));
        setCollected(new Set(data.collected || []));
      }
    } else {
      localStorage.setItem(QUESTS_KEY, JSON.stringify({ date: today, completed: [], collected: [] }));
    }
  }, []);

  const quests: Quest[] = [
    {
      id: 'open_trade',
      label: 'Abre 1 trade',
      reward: 10,
      check: () => activeTrades.length > 0,
    },
    {
      id: 'profit_trade',
      label: 'Cierra un trade con profit',
      reward: 25,
      check: () => closedTrades.some(t => {
        const today = new Date().toDateString();
        return t.closed_at && new Date(t.closed_at).toDateString() === today && (t.pnl || 0) > 0;
      }),
    },
    {
      id: 'visit_world',
      label: 'Visita el Mundo',
      reward: 5,
      check: () => false, // manual trigger from World page
    },
  ];

  // Mark completed
  useEffect(() => {
    const newCompleted = new Set(completed);
    let changed = false;
    quests.forEach(q => {
      if (!newCompleted.has(q.id) && q.check()) {
        newCompleted.add(q.id);
        changed = true;
      }
    });
    if (changed) {
      setCompleted(newCompleted);
      const today = new Date().toDateString();
      localStorage.setItem(QUESTS_KEY, JSON.stringify({ date: today, completed: Array.from(newCompleted), collected: Array.from(collected) }));
    }
  }, [activeTrades.length, closedTrades.length]);

  const collect = (quest: Quest) => {
    if (collected.has(quest.id) || !completed.has(quest.id)) return;
    addCoins(quest.reward);
    addXp(quest.reward * 2);
    const newCollected = new Set([...collected, quest.id]);
    setCollected(newCollected);
    const today = new Date().toDateString();
    localStorage.setItem(QUESTS_KEY, JSON.stringify({ date: today, completed: Array.from(completed), collected: Array.from(newCollected) }));
  };

  const completedCount = completed.size;
  const totalReward = quests.filter(q => collected.has(q.id)).reduce((s, q) => s + q.reward, 0);

  return (
    <div className="glass-card !p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={15} className="text-[#f59e0b]" />
          <span className="text-sm font-semibold text-white">Misiones Diarias</span>
        </div>
        <span className="text-[10px] text-[#5c5c80]">{completedCount}/{quests.length}</span>
      </div>

      <div className="space-y-1.5">
        {quests.map((quest) => {
          const isCompleted = completed.has(quest.id);
          const isCollected = collected.has(quest.id);

          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition ${
                isCollected
                  ? 'bg-[rgba(34,214,94,0.05)]'
                  : isCompleted
                  ? 'bg-[rgba(240,185,11,0.05)]'
                  : 'bg-[rgba(255,255,255,0.01)]'
              }`}
            >
              {/* Icon */}
              {isCollected ? (
                <CheckCircle2 size={16} className="text-[#22d65e]" />
              ) : isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <CheckCircle2 size={16} className="text-[#f0b90b]" />
                </motion.div>
              ) : (
                <Circle size={16} className="text-[#3c3c60]" />
              )}

              {/* Label */}
              <div className="flex-1">
                <div className={`text-xs font-medium ${isCollected ? 'text-[#5c5c80] line-through' : 'text-[#d0d0e0]'}`}>
                  {quest.label}
                </div>
                <div className="text-[10px] text-[#5c5c80]">
                  +${quest.reward} monedas · +{quest.reward * 2} XP
                </div>
              </div>

              {/* Collect button */}
              {isCompleted && !isCollected && (
                <motion.button
                  onClick={() => collect(quest)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[rgba(240,185,11,0.15)] text-[#f0b90b] hover:bg-[rgba(240,185,11,0.25)] transition"
                >
                  Cobrar
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>

      {totalReward > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 pt-3 border-t border-[rgba(99,102,241,0.08)] text-center"
        >
          <span className="text-[10px] text-[#22d65e]">+${totalReward} ganado hoy</span>
        </motion.div>
      )}
    </div>
  );
}
