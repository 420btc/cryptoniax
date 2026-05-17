'use client';

import { useState } from 'react';
import { useAuthStore } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import Chart from './Chart';
import { CRYPTO_SYMBOLS, CryptoSymbol, ExchangeType, EXCHANGE_THEMES } from '@/types';
import { Activity, TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, Wallet, Clock, Zap } from 'lucide-react';

export default function TradePanel() {
  const { profile } = useAuthStore();
  const { trades, activeTrades, closedTrades, coins, openTrade } = usePortfolioStore();
  const [selectedSymbol, setSelectedSymbol] = useState<CryptoSymbol>('BTC');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [tradeType, setTradeType] = useState<'spot' | 'futures'>('spot');
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [leverage, setLeverage] = useState(1);
  const [amount, setAmount] = useState('');
  const [exchange, setExchange] = useState<ExchangeType>('bingx');

  const handlePriceUpdate = (price: number) => {
    setCurrentPrice(price);
  };

  const handleTrade = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || amt > coins) return;
    openTrade({
      symbol: selectedSymbol,
      type: tradeType,
      side,
      exchange,
      entryPrice: currentPrice || (selectedSymbol === 'BTC' ? 67500 : selectedSymbol === 'ETH' ? 3450 : 145),
      amount: amt,
      leverage,
    });
    setAmount('');
  };

  const winRate = closedTrades.length > 0
    ? Math.round((closedTrades.filter(t => t.pnl > 0).length / closedTrades.length) * 100)
    : 0;

  const totalPnl = closedTrades.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart + Symbol Selector */}
      <div className="lg:col-span-2 space-y-4">
        {/* Symbol Tabs */}
        <div className="flex gap-2">
          {CRYPTO_SYMBOLS.map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`px-5 py-2 rounded-xl font-medium text-sm transition ${
                selectedSymbol === sym
                  ? 'bg-[#7C3AED] text-white glow-purple'
                  : 'bg-[#1a1a3a] text-[#8888aa] hover:bg-[#2a2a5a] border border-[#2a2a5a]'
              }`}
            >
              {sym}/USDT
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-[#12122a] rounded-2xl p-4 pixel-border">
          <Chart symbol={selectedSymbol} onPriceUpdate={handlePriceUpdate} />
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#1a1a3a] rounded-xl p-3 pixel-border-sm">
            <div className="text-[#8888aa] text-xs">Balance</div>
            <div className="text-lg font-bold text-white">${coins.toFixed(2)}</div>
          </div>
          <div className="bg-[#1a1a3a] rounded-xl p-3 pixel-border-sm">
            <div className="text-[#8888aa] text-xs">Win Rate</div>
            <div className={`text-lg font-bold ${winRate >= 50 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{winRate}%</div>
          </div>
          <div className="bg-[#1a1a3a] rounded-xl p-3 pixel-border-sm">
            <div className="text-[#8888aa] text-xs">P&L Total</div>
            <div className={`text-lg font-bold ${totalPnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}$
            </div>
          </div>
        </div>
      </div>

      {/* Trade Panel */}
      <div className="space-y-4">
        {/* Active Trades */}
        <div className="bg-[#1a1a3a] rounded-2xl p-4 pixel-border">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-[#22c55e]" />
            <span className="font-semibold text-sm">Trades Activos</span>
            <span className="ml-auto bg-[#7C3AED]/20 text-[#7C3AED] text-xs px-2 py-0.5 rounded-full">{activeTrades.length}</span>
          </div>
          {activeTrades.length === 0 ? (
            <p className="text-[#8888aa] text-sm text-center py-6">No hay trades abiertos</p>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {activeTrades.map((t) => {
                const theme = EXCHANGE_THEMES[t.exchange];
                const isProfit = t.pnl >= 0;
                return (
                  <div key={t.id} className="bg-[#12122a] rounded-lg p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{t.symbol}</span>
                      <span className={isProfit ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                        {isProfit ? '+' : ''}{t.pnl?.toFixed(2)}$
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#8888aa] mt-1">
                      <span style={{ color: theme.color }}>{theme.insignia}</span>
                      <span>{t.type === 'futures' ? `${t.leverage}x` : 'Spot'}</span>
                      <span>{t.side === 'long' ? '▲ Long' : '▼ Short'}</span>
                      <span>{t.exchange}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* New Trade Form */}
        <div className="bg-[#1a1a3a] rounded-2xl p-4 pixel-border">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-[#F0B90B]" />
            <span className="font-semibold text-sm">Nuevo Trade</span>
          </div>

          {/* Type toggle */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTradeType('spot')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                tradeType === 'spot' ? 'bg-[#7C3AED] text-white' : 'bg-[#12122a] text-[#8888aa]'
              }`}
            >
              Spot
            </button>
            <button
              onClick={() => setTradeType('futures')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                tradeType === 'futures' ? 'bg-[#7C3AED] text-white' : 'bg-[#12122a] text-[#8888aa]'
              }`}
            >
              Futuros
            </button>
          </div>

          {/* Side */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSide('long')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                side === 'long' ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]' : 'bg-[#12122a] text-[#8888aa]'
              }`}
            >
              ▲ Long
            </button>
            <button
              onClick={() => setSide('short')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                side === 'short' ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]' : 'bg-[#12122a] text-[#8888aa]'
              }`}
            >
              ▼ Short
            </button>
          </div>

          {/* Amount */}
          <div className="mb-3">
            <label className="text-[#8888aa] text-xs block mb-1">Cantidad ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className="w-full bg-[#12122a] border border-[#2a2a5a] rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
              max={coins}
            />
          </div>

          {/* Leverage (only for futures) */}
          {tradeType === 'futures' && (
            <div className="mb-3">
              <label className="text-[#8888aa] text-xs block mb-1">Apalancamiento</label>
              <div className="flex gap-1">
                {[1, 2, 3, 5, 10, 20, 50, 100].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => setLeverage(lev)}
                    className={`flex-1 py-1.5 rounded text-xs transition ${
                      leverage === lev ? 'bg-[#7C3AED] text-white' : 'bg-[#12122a] text-[#8888aa]'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exchange */}
          <div className="mb-3">
            <label className="text-[#8888aa] text-xs block mb-1">Exchange</label>
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value as ExchangeType)}
              className="w-full bg-[#12122a] border border-[#2a2a5a] rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
            >
              <option value="bingx">BingX</option>
              <option value="hyperliquid">Hyperliquid</option>
              <option value="bybit">Bybit</option>
              <option value="uniswap">Uniswap</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Trade button */}
          <button
            onClick={handleTrade}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white hover:from-[#8B5CF6] hover:to-[#7C3AED] transition disabled:opacity-50 glow-purple"
          >
            {side === 'long' ? '🤝 Comprar' : '🤝 Vender'} {selectedSymbol}
          </button>
        </div>

        {/* Recent closed trades */}
        <div className="bg-[#1a1a3a] rounded-2xl p-4 pixel-border">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-[#8888aa]" />
            <span className="font-semibold text-sm">Últimos cierres</span>
          </div>
          <div className="space-y-1 max-h-[160px] overflow-y-auto">
            {closedTrades.slice(-10).reverse().map((t) => (
              <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b border-[#1a1a3a] last:border-0">
                <span className="text-[#8888aa]">
                  {t.symbol} {t.side === 'long' ? '▲' : '▼'}
                </span>
                <span className={t.pnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                  {t.pnl >= 0 ? '+' : ''}{t.pnl?.toFixed(2)}$
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
