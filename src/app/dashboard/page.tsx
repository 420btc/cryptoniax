'use client';

import TradePanel from '@/components/TradePanel';

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">📊 Trading</h1>
        <p className="text-[#8888b0] text-sm mt-1">
          Charts en tiempo real con EMA/MACD. Tradeos simulados para construir tu reino.
        </p>
      </div>
      <TradePanel />
    </div>
  );
}
