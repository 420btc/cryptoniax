'use client';

import { motion } from 'framer-motion';
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';
import { Swords, Zap, Shield } from 'lucide-react';

export default function BattlesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
          ⚔️ Zona de Batallas
        </h1>
        <p className="text-[#8888b0] text-sm mt-1">
          Tus guerreros luchan aquí. El chat IA te ayuda con estrategia.
        </p>
      </div>

      {/* Battle Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: <Swords size={14} />, label: 'Batallas Hoy', value: '3', color: '#f0b90b' },
          { icon: <Shield size={14} />, label: 'Win Rate', value: '67%', color: '#22d65e' },
          { icon: <Zap size={14} />, label: 'Racha', value: 'W2', color: '#6366f1' },
          { icon: <Swords size={14} />, label: 'XP Ganado', value: '+45', color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} className="glass-card !p-4 animate-scale-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center gap-2 text-[10px] text-[#5c5c80] mb-2">
              {stat.icon}
              {stat.label}
            </div>
            <div className="text-2xl font-bold text-white tabular-nums" style={{ color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* AI Chat */}
      <div className="glass-card !p-0 overflow-hidden">
        <div className="h-[500px]">
          <AnimatedAIChat />
        </div>
      </div>
    </motion.div>
  );
}
