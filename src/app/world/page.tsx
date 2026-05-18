'use client';

import dynamic from 'next/dynamic';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { Globe, Users, TrendingUp, Trophy } from 'lucide-react';

const WorldCanvas = dynamic(() => import('@/components/World'), {
  ssr: false,
  loading: () => (
    <div className="glass-card !p-16 text-center">
      <div className="text-4xl mb-4 animate-pulse">🌍</div>
      <div className="shimmer w-32 h-4 rounded mx-auto mb-2" />
      <div className="shimmer w-48 h-3 rounded mx-auto" />
    </div>
  ),
});

export default function WorldPage() {
  const { activeTrades, closedTrades, coins } = usePortfolioStore();

  const stats = [
    { icon: <TrendingUp size={14} />, label: 'Trades Activos', value: activeTrades.length.toString() },
    { icon: <Trophy size={14} />, label: 'Trades Totales', value: closedTrades.length.toString() },
    { icon: <Globe size={14} />, label: 'En HodlVille', value: 'Tú solo (beta)' },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">🌍 HodlVille</h1>
          <p className="text-[#8888b0] text-sm mt-1">Tu mundo pixel. Crece con tus trades y HODLs.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="glass-card !p-3 text-center">
            <div className="text-[#818cf8] flex justify-center mb-1">{s.icon}</div>
            <div className="text-lg font-bold text-white">{s.value}</div>
            <div className="text-[10px] text-[#5c5c80]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* World */}
      <WorldCanvas />
    </div>
  );
}
