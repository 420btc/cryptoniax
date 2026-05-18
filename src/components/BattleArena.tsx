'use client';

import { motion } from 'framer-motion';
import { Swords, Shield, Heart, Zap } from 'lucide-react';

interface Fighter {
  name: string;
  exchange: string;
  type: 'warrior' | 'merchant';
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  color: string;
  spriteEmoji: string;
}

interface Props {
  player: Fighter;
  opponent: Fighter;
  log: string[];
  playerTurn: boolean;
  onAttack?: () => void;
}

export default function BattleArena({ player, opponent, log, playerTurn, onAttack }: Props) {
  return (
    <div className="glass-card !p-0 overflow-hidden">
      {/* Battle background */}
      <div className="relative w-full" style={{
        minHeight: 420,
        background: 'linear-gradient(180deg, #0a0b2e 0%, #0d0d1a 40%, #1a0a0a 100%)',
      }}>
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3"
          style={{ background: 'linear-gradient(0deg, #1a1a0a 0%, transparent 100%)' }} />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        {/* VS divider */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="text-4xl font-black text-white/10 select-none">VS</div>
        </div>

        {/* ── LEFT: Player ── */}
        <div className="absolute left-8 md:left-16 bottom-20 flex flex-col items-center">
          {/* Sprite */}
          <motion.div
            animate={playerTurn ? { x: [0, 20, 0], transition: { duration: 0.4, repeat: Infinity, repeatDelay: 2 } } : {}}
            className="text-7xl mb-2 filter drop-shadow-lg"
          >
            {player.spriteEmoji}
          </motion.div>

          {/* HP bar */}
          <div className="w-32 h-2 rounded-full bg-[rgba(239,68,102,0.2)] overflow-hidden mb-1">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#ef4466] to-[#ff6b6b]"
              animate={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </div>

          {/* Name + stats */}
          <div className="text-center">
            <div className="text-sm font-bold text-white">{player.name}</div>
            <div className="text-[10px] text-[#5c5c80]">
              Lv.{player.level} · {player.exchange}
            </div>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="flex items-center gap-0.5 text-[10px] text-[#ef4466]">
                <Heart size={10} /> {player.hp}/{player.maxHp}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-[#f59e0b]">
                <Swords size={10} /> {player.atk}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-[#818cf8]">
                <Shield size={10} /> {player.def}
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Opponent ── */}
        <div className="absolute right-8 md:right-16 bottom-20 flex flex-col items-center">
          <motion.div
            animate={!playerTurn ? { x: [0, -20, 0], transition: { duration: 0.4, repeat: Infinity, repeatDelay: 2 } } : {}}
            className="text-7xl mb-2 filter drop-shadow-lg"
            style={{ transform: 'scaleX(-1)' }}
          >
            {opponent.spriteEmoji}
          </motion.div>

          <div className="w-32 h-2 rounded-full bg-[rgba(239,68,102,0.2)] overflow-hidden mb-1">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#ef4466] to-[#ff6b6b]"
              animate={{ width: `${(opponent.hp / opponent.maxHp) * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </div>

          <div className="text-center">
            <div className="text-sm font-bold text-white">{opponent.name}</div>
            <div className="text-[10px] text-[#5c5c80]">
              Lv.{opponent.level} · {opponent.exchange}
            </div>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="flex items-center gap-0.5 text-[10px] text-[#ef4466]">
                <Heart size={10} /> {opponent.hp}/{opponent.maxHp}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-[#f59e0b]">
                <Swords size={10} /> {opponent.atk}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-[#818cf8]">
                <Shield size={10} /> {opponent.def}
              </span>
            </div>
          </div>
        </div>

        {/* Attack button */}
        {onAttack && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <motion.button
              onClick={onAttack}
              disabled={!playerTurn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                playerTurn
                  ? 'bg-gradient-to-r from-[#ef4466] to-[#ff6b6b] text-white shadow-lg shadow-[rgba(239,68,102,0.3)] hover:shadow-xl cursor-pointer'
                  : 'bg-[rgba(255,255,255,0.03)] text-[#5c5c80] cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-2">
                <Zap size={14} />
                {playerTurn ? '¡ATACAR!' : 'Esperando...'}
              </span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Battle log */}
      {log.length > 0 && (
        <div className="border-t border-[rgba(99,102,241,0.08)] p-3 max-h-[120px] overflow-y-auto">
          <div className="text-[10px] text-[#5c5c80] mb-1.5 font-medium">📜 Registro de batalla</div>
          <div className="space-y-1">
            {log.slice(-8).map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-[11px] text-[#8888b0]"
              >
                {entry}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
