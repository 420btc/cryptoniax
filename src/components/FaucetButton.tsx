'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Sparkles } from 'lucide-react';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { useParticles } from './ParticlesProvider';
import { sfx } from '@/lib/sfx';

const FAUCET_KEY = 'hodlville_faucet_last';
const FAUCET_COOLDOWN = 24 * 60 * 60 * 1000; // 24h
const FAUCET_AMOUNT = () => Math.floor(Math.random() * 26) + 25; // 25-50 coins

export default function FaucetButton() {
  const { coins, addCoins } = usePortfolioStore();
  const { burst, floatText } = useParticles();
  const [canClaim, setCanClaim] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [claimed, setClaimed] = useState(0);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    const check = () => {
      const last = localStorage.getItem(FAUCET_KEY);
      if (!last) { setCanClaim(true); return; }
      const elapsed = Date.now() - parseInt(last);
      if (elapsed >= FAUCET_COOLDOWN) {
        setCanClaim(true);
      } else {
        setCanClaim(false);
        const remaining = FAUCET_COOLDOWN - elapsed;
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        setTimeLeft(`${h}h ${m}m`);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const claim = () => {
    if (!canClaim) return;
    const amount = FAUCET_AMOUNT();
    addCoins(amount);
    localStorage.setItem(FAUCET_KEY, Date.now().toString());
    setCanClaim(false);
    setTimeLeft('24h 0m');
    setClaimed(amount);
    setShowParticles(true);
    // Canvas coin burst
    burst({ kind: 'coins', x: window.innerWidth / 2, y: window.innerHeight / 2, count: 20, spread: 4 });
    floatText(window.innerWidth / 2, window.innerHeight / 2 - 40, `+$${amount}`, '#fbbf24');
    sfx.coinClaim();
    setTimeout(() => {
      setShowParticles(false);
      setClaimed(0);
    }, 2500);
  };

  return (
    <div className="relative">
      {/* Coin particles */}
      <AnimatePresence>
        {showParticles && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                animate={{
                  opacity: 0,
                  y: -60 - Math.random() * 40,
                  x: (Math.random() - 0.5) * 80,
                  scale: 0.3,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 + Math.random() * 0.5, delay: i * 0.08 }}
                className="absolute top-1/2 left-1/2 text-lg pointer-events-none z-50"
              >
                🪙
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={claim}
        disabled={!canClaim}
        whileHover={canClaim ? { scale: 1.03 } : {}}
        whileTap={canClaim ? { scale: 0.97 } : {}}
        className={`glass-card !p-3.5 flex items-center gap-3 w-full transition-all ${
          canClaim
            ? 'cursor-pointer hover:border-[rgba(240,185,11,0.3)] hover:shadow-[0_0_20px_rgba(240,185,11,0.1)]'
            : 'cursor-not-allowed opacity-60'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
          canClaim ? 'bg-[rgba(240,185,11,0.15)] animate-pulse' : 'bg-[rgba(255,255,255,0.03)]'
        }`}>
          <Sparkles size={18} className={canClaim ? 'text-[#f0b90b]' : 'text-[#5c5c80]'} />
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Coins size={14} className="text-[#f0b90b]" />
            {canClaim ? 'Reclamar Faucet Diario' : 'Faucet Diario'}
          </div>
          <div className="text-[10px] text-[#5c5c80]">
            {canClaim
              ? `+25-50 monedas gratis · ¡Disponible!`
              : `Próximo en ${timeLeft}`}
          </div>
        </div>
        {canClaim && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs font-bold text-[#f0b90b] px-2 py-1 rounded-lg bg-[rgba(240,185,11,0.1)]"
          >
            Reclamar
          </motion.div>
        )}
        {claimed > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-bold text-[#22d65e]"
          >
            +${claimed}
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}
