'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ShieldOff, Skull, AlertTriangle } from 'lucide-react';

interface Props {
  show: boolean;
  pnl: number;
  symbol: string;
  onDismiss: () => void;
}

type Phase = 'crash' | 'skull' | 'message' | 'done';

export default function LossOverlay({ show, pnl, symbol, onDismiss }: Props) {
  const [phase, setPhase] = useState<Phase>('crash');

  useEffect(() => {
    if (!show) return;
    setPhase('crash');
    const t1 = setTimeout(() => setPhase('skull'), 600);
    const t2 = setTimeout(() => setPhase('message'), 1400);
    const t3 = setTimeout(() => setPhase('done'), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [show, pnl, symbol]);

  if (!show) return null;

  const color = pnl < -5 ? '#ef4466' : pnl < -2 ? '#f59e0b' : '#ef4466';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        {/* Red vignette background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'crash' ? 0.85 : 0.7 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, ${color}22 0%, transparent 70%)`,
          }}
        />

        {/* Screen shake */}
        <motion.div
          animate={phase === 'crash' ? {
            x: [0, -8, 6, -4, 2, 0],
            y: [0, 4, -3, 2, -1, 0],
          } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 text-center"
        >
          {/* Skull */}
          {phase !== 'done' && (
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{
                scale: phase === 'crash' ? 3 : phase === 'skull' ? 1.5 : 1,
                rotate: phase === 'crash' ? 0 : 0,
                opacity: (phase as string) === 'done' ? 0 : 1,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mb-6"
            >
              <Skull size={80} className="mx-auto" color={color} />
            </motion.div>
          )}

          {/* Message */}
          {phase === 'message' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-3xl font-bold text-white mb-3 font-['Space_Grotesk']">
                ¡SIN STOP LOSS!
              </h2>
              <p className="text-lg text-[#ef4466] mb-1 font-bold tabular-nums">
                -${Math.abs(pnl).toFixed(2)}
              </p>
              <p className="text-sm text-[#8888b0] mb-4">
                {symbol} te ha liquidado sin protección
              </p>
              <div className="flex items-center justify-center gap-2 text-[#f59e0b]">
                <AlertTriangle size={16} />
                <span className="text-xs">Próxima vez pon STOP LOSS</span>
              </div>
            </motion.div>
          )}

          {/* Dismiss button */}
          {phase === 'done' && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onDismiss}
              className="pointer-events-auto glass-card !px-6 !py-3 text-white font-medium hover:bg-[rgba(239,68,102,0.1)] transition"
            >
              Entendido 🔥
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
