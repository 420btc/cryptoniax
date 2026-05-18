'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { useAuthStore } from '@/hooks/useAuth';
import BattleArena from '@/components/BattleArena';
import BattleAIChat from '@/components/BattleAIChat';
import { Swords, Shield, Zap, TrendingUp, Users, MessageCircle } from 'lucide-react';

export default function BattlesPage() {
  const { activeTrades, closedTrades } = usePortfolioStore();
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'arena' | 'chat'>('arena');
  const [log, setLog] = useState<string[]>([]);
  const [playerTurn, setPlayerTurn] = useState(true);

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

    let w = 0, l = 0;
    for (let i = closedTrades.length - 1; i >= 0; i--) {
      if ((closedTrades[i].pnl || 0) > 0) { w++; if (l > 0) break; }
      else { l++; if (w > 0) break; }
    }
    const streak = w > l ? `W${w}` : l > w ? `L${l}` : '-';

    const xpToday = closedTrades
      .filter((t) => t.closed_at && new Date(t.closed_at).toDateString() === today)
      .reduce((sum, t) => sum + Math.floor(Math.abs(t.pnl || 0) * 10), 0);

    return { battlesToday, battleWinRate, streak, xpToday };
  }, [closedTrades]);

  const opponent = {
    name: 'CryptoKing',
    exchange: 'Hyperliquid',
    type: 'warrior' as const,
    level: 5,
    hp: 85,
    maxHp: 100,
    atk: 18,
    def: 8,
    color: '#00e6ff',
    spriteEmoji: '🦹',
  };

  const player = {
    name: profile?.email?.split('@')[0] || 'Trader',
    exchange: 'BingX',
    type: 'warrior' as const,
    level: 1,
    hp: 92,
    maxHp: 100,
    atk: 12,
    def: 5,
    color: '#22d65e',
    spriteEmoji: '⚔️',
  };

  const handleAttack = () => {
    if (!playerTurn) return;
    setPlayerTurn(false);

    const dmg = Math.max(1, player.atk - opponent.def + Math.floor(Math.random() * 6));
    setLog((prev) => [...prev, `⚔️ ${player.name} ataca a ${opponent.name} por ${dmg} de daño!`]);

    setTimeout(() => {
      const enemyDmg = Math.max(1, opponent.atk - player.def + Math.floor(Math.random() * 6));
      setLog((prev) => [...prev, `🛡️ ${opponent.name} contraataca por ${enemyDmg} de daño!`]);
      setPlayerTurn(true);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">⚔️ Zona de Batallas</h1>
        <p className="text-[#8888b0] text-sm mt-1">
          Enfréntate a otros traders. Tus personajes luchan según sus stats de exchange.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Swords size={14} />, label: 'Batallas Hoy', value: stats.battlesToday.toString(), color: '#f0b90b' },
          { icon: <Shield size={14} />, label: 'Win Rate', value: `${stats.battleWinRate}%`, color: stats.battleWinRate >= 50 ? '#22d65e' : '#ef4466' },
          { icon: <Zap size={14} />, label: 'Racha', value: stats.streak, color: '#6366f1' },
          { icon: <TrendingUp size={14} />, label: 'XP Hoy', value: `+${stats.xpToday}`, color: '#f59e0b' },
        ].map((stat, i) => (
          <motion.div key={i} className="glass-card !p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="flex items-center gap-2 text-[10px] text-[#5c5c80] mb-2">{stat.icon}{stat.label}</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Active warriors */}
      {activeTrades.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card !p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-[#f0b90b]" />
            <span className="text-xs font-medium text-white">{activeTrades.length} guerrero{activeTrades.length > 1 ? 's' : ''} disponibles</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeTrades.map((trade, i) => (
              <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg glass text-[#d0d0e0] flex items-center gap-1.5">
                <span style={{ color: trade.side === 'long' ? '#22d65e' : '#ef4466' }}>{trade.side === 'long' ? '▲' : '▼'}</span>
                {trade.symbol} {trade.type === 'futures' ? `${trade.leverage}x` : 'Spot'}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab toggle */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('arena')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'arena' ? 'glass text-[#f0b90b]' : 'text-[#5c5c80] hover:text-white'
          }`}>
          <Swords size={16} /> Arena de Batalla
        </button>
        <button onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'chat' ? 'glass text-[#818cf8]' : 'text-[#5c5c80] hover:text-white'
          }`}>
          <MessageCircle size={16} /> Chat IA
        </button>
      </div>

      {/* Arena or Chat */}
      {activeTab === 'arena' ? (
        <motion.div key="arena" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <BattleArena
            player={player}
            opponent={opponent}
            log={log}
            playerTurn={playerTurn}
            onAttack={handleAttack}
          />
        </motion.div>
      ) : (
        <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card !p-0 overflow-hidden">
            <div className="h-[500px]">
              <BattleAIChat />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
