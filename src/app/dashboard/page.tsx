'use client';

import { motion } from 'framer-motion';
import TradePanel from '@/components/TradePanel';
import FaucetButton from '@/components/FaucetButton';
import DailyQuests from '@/components/DailyQuests';

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white">📊 Trading</h1>
        <p className="text-[#8888b0] text-sm mt-1">
          Charts en tiempo real con EMA, MACD, RSI, Bollinger. Datos reales de Binance.
        </p>
      </motion.div>

      {/* Earning Zone: Faucet + Quests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5"
      >
        <FaucetButton />
        <DailyQuests />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <TradePanel />
      </motion.div>
    </motion.div>
  );
}
