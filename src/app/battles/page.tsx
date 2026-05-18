'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { useAuthStore } from '@/hooks/useAuth';
import BattleArena from '@/components/BattleArena';
import BattleTavernChat from '@/components/BattleTavernChat';
import { Swords, Shield, Zap, TrendingUp, Users, MessageCircle } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { ENEMIES, Fighter, calculateDamage, getBattleRewards } from '@/lib/battleEngine';
import { sfx } from '@/lib/sfx';

export default function BattlesPage() {
  const { activeTrades, closedTrades, addCoins, addXp } = usePortfolioStore();
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'arena' | 'chat'>('arena');
  const [log, setLog] = useState<string[]>([]);
  const [playerTurn, setPlayerTurn] = useState(true);
  
  const [currentEnemyIdx, setCurrentEnemyIdx] = useState(0);
  const [playerHp, setPlayerHp] = useState(0);
  const [enemyHp, setEnemyHp] = useState(0);
  const [isBattling, setIsBattling] = useState(false);
  const [battleResult, setBattleResult] = useState<'win' | 'loss' | null>(null);

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

  const playerExchange = (activeTrades[0]?.exchange || 'bingx') as string;
  const playerLevel = Math.min(10, Math.max(1, Math.ceil(stats.battlesToday / 2) || 1));
  const playerSpritePath = `/sprites/v2/hero_${playerExchange.toLowerCase()}_warrior_lv${Math.min(5, playerLevel)}.png`;

  const opponentBase = ENEMIES[currentEnemyIdx];
  const opponent: Fighter = {
    ...opponentBase,
    hp: enemyHp > 0 || isBattling ? enemyHp : opponentBase.maxHp,
  };

  const player: Fighter = {
    id: 'player_1',
    name: profile?.email?.split('@')[0] || 'Trader',
    exchange: playerExchange,
    type: 'warrior',
    level: playerLevel,
    maxHp: 80 + playerLevel * 20,
    hp: playerHp > 0 || isBattling ? playerHp : 80 + playerLevel * 20,
    atk: 10 + playerLevel * 5,
    def: 5 + playerLevel * 2,
    color: '#22d65e',
    spritePath: playerSpritePath,
    spriteEmoji: '⚔️',
  };

  // Initialize HP when not battling
  useEffect(() => {
    if (!isBattling && !battleResult) {
      setPlayerHp(player.maxHp);
      setEnemyHp(opponentBase.maxHp);
    }
  }, [isBattling, battleResult, player.maxHp, opponentBase.maxHp]);

  const startBattle = () => {
    setIsBattling(true);
    setBattleResult(null);
    setLog([`¡Comienza la batalla contra ${opponent.name}!`, '¡Es tu turno!']);
    setPlayerHp(player.maxHp);
    setEnemyHp(opponent.maxHp);
    setPlayerTurn(true);
  };

  const handleAttack = () => {
    if (!playerTurn || !isBattling) return;
    setPlayerTurn(false);
    sfx.attack();

    const { damage, isCrit } = calculateDamage(player, opponentBase);
    const newEnemyHp = Math.max(0, enemyHp - damage);
    setEnemyHp(newEnemyHp);
    
    setLog((prev) => [...prev, `⚔️ ${player.name} ataca a ${opponent.name} por ${damage} de daño! ${isCrit ? '(CRÍTICO)' : ''}`]);
    setTimeout(() => sfx.hit(), 200);

    if (newEnemyHp <= 0) {
      setTimeout(() => {
        sfx.tradeWin();
        const rewards = getBattleRewards(opponent.level);
        setLog((prev) => [...prev, `🏆 ¡Has derrotado a ${opponent.name}!`, `Recompensas: +${rewards.xp} XP, +${rewards.coins} Monedas`]);
        setBattleResult('win');
        setIsBattling(false);
        addXp(rewards.xp);
        addCoins(rewards.coins);
      }, 1000);
      return;
    }

    setTimeout(() => {
      sfx.attack();
      const { damage: enemyDmg, isCrit: enemyCrit } = calculateDamage(opponentBase, player);
      const newPlayerHp = Math.max(0, playerHp - enemyDmg);
      setPlayerHp(newPlayerHp);
      
      setLog((prev) => [...prev, `🛡️ ${opponent.name} contraataca por ${enemyDmg} de daño! ${enemyCrit ? '(CRÍTICO)' : ''}`]);
      setTimeout(() => sfx.hit(), 200);

      if (newPlayerHp <= 0) {
        setTimeout(() => {
          sfx.tradeLose();
          setLog((prev) => [...prev, `💀 ¡Has sido derrotado por ${opponent.name}!`, 'Vuelve a intentarlo cuando seas más fuerte.']);
          setBattleResult('loss');
          setIsBattling(false);
        }, 1000);
        return;
      }

      setPlayerTurn(true);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div>
        <BackButton />
        <h1 className="text-2xl font-bold text-white mt-2">⚔️ Zona de Batallas</h1>
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
          <MessageCircle size={16} /> Taberna (20 traders)
        </button>
      </div>

      {/* Arena or Chat */}
      {activeTab === 'arena' ? (
        <motion.div key="arena" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-battle-forest rounded-xl p-4">
          {!isBattling && !battleResult && (
            <div className="flex justify-between items-center mb-4">
              <div className="text-white font-bold">Oponente actual: {opponent.name} (Nv.{opponent.level})</div>
              <button onClick={startBattle} className="bg-[#22d65e] hover:bg-[#1db851] text-black px-4 py-2 rounded-lg font-bold transition">
                Comenzar Batalla
              </button>
            </div>
          )}
          {battleResult && (
            <div className="flex justify-between items-center mb-4">
              <div className="text-white font-bold">
                {battleResult === 'win' ? '¡Victoria!' : 'Derrota'}
              </div>
              <button 
                onClick={() => {
                  if (battleResult === 'win') {
                    setCurrentEnemyIdx(prev => Math.min(ENEMIES.length - 1, prev + 1));
                  }
                  startBattle();
                }} 
                className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-lg font-bold transition"
              >
                {battleResult === 'win' ? 'Siguiente Oponente' : 'Reintentar'}
              </button>
            </div>
          )}
          <BattleArena
            player={player}
            opponent={opponent}
            log={log}
            playerTurn={playerTurn && isBattling}
            onAttack={handleAttack}
          />
        </motion.div>
      ) : (
        <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card !p-0 overflow-hidden bg-tavern-interior">
            <div className="h-[550px]">
              <BattleTavernChat />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
