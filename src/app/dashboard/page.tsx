'use client';

import TradePanel from '@/components/TradePanel';

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">📊 Trading</h1>
        <p className="text-[#8888aa] text-sm mt-1">Charts reales, trades simulados. Gana para construir tu reino.</p>
      </div>
      <TradePanel />
    </div>
  );
}
