'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import Chart from './Chart';
import LossOverlay from './LossOverlay';
import { CRYPTO_SYMBOLS, CryptoSymbol, ExchangeType, EXCHANGE_THEMES } from '@/types';
import {
  Activity, TrendingUp, BarChart3, Wallet, Clock, Zap, ArrowUpRight, ArrowDownRight,
  CandlestickChart, Gauge, Target, ListOrdered, Plus, X
} from 'lucide-react';

// Animation variants
const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10, scale: 0.95 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const cardHover = { whileHover: { y: -2, transition: { type: 'spring', stiffness: 400, damping: 25 } } };
const pulse = { animate: { scale: [1, 1.02, 1], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } } };

export default function TradePanel() {
  const { profile } = useAuthStore();
  const { trades, activeTrades, closedTrades, coins, level, xp, house, openTrade, checkTradeLimits } = usePortfolioStore();
  const [selectedSymbol, setSelectedSymbol] = useState<CryptoSymbol>('BTC');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [tradeType, setTradeType] = useState<'spot' | 'futures'>('futures');
  const [lossOverlay, setLossOverlay] = useState<{ show: boolean; pnl: number; symbol: string }>({ show: false, pnl: 0, symbol: '' });

  // Detect loss without SL
  useEffect(() => {
    if (closedTrades.length === 0) return;
    const last = closedTrades[closedTrades.length - 1];
    if (last && (last.pnl || 0) < 0 && !last.sl_price) {
      const delay = setTimeout(() => {
        setLossOverlay({ show: true, pnl: last.pnl || 0, symbol: last.symbol });
      }, 200);
      return () => clearTimeout(delay);
    }
  }, [closedTrades.length]);
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [leverage, setLeverage] = useState(5);
  const [amount, setAmount] = useState('');
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [exchange, setExchange] = useState<ExchangeType>('bingx');

  const handlePriceUpdate = (price: number) => {
    setCurrentPrice(price);
    checkTradeLimits(selectedSymbol, price);
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
      tpPrice: tpPrice ? parseFloat(tpPrice) : undefined,
      slPrice: slPrice ? parseFloat(slPrice) : undefined,
    });
    setAmount('');
    setTpPrice('');
    setSlPrice('');
  };

  const winRate = closedTrades.length > 0
    ? Math.round((closedTrades.filter(t => (t.pnl ?? 0) > 0).length / closedTrades.length) * 100)
    : 0;
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalVolume = closedTrades.reduce((sum, t) => sum + t.amount, 0) + activeTrades.reduce((sum, t) => sum + t.amount, 0);
  const bestTrade = closedTrades.length > 0 ? Math.max(...closedTrades.map(t => t.pnl || 0)) : 0;

  const quickAmounts = [10, 25, 50, 100, 500, 1000];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* ===== LEFT: Chart + Stats ===== */}
      <div className="lg:col-span-2 space-y-4">
        {/* Symbol Tabs + Trading info */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {CRYPTO_SYMBOLS.map((sym) => (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedSymbol === sym
                    ? 'glass text-[#818cf8] shadow-sm'
                    : 'text-[#5c5c80] hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {sym}/USDT
              </button>
            ))}
          </div>
          {currentPrice > 0 && (
            <div className="text-right">
              <div className="text-xs text-[#5c5c80]">Mark Price</div>
              <div className="text-sm font-bold text-white tabular-nums">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="glass-card !p-4">
            <Chart symbol={selectedSymbol} onPriceUpdate={handlePriceUpdate} activeTrades={activeTrades} />
        </div>

        {/* Stats grid */}
        <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <Wallet size={14} />, label: 'Balance', value: `$${coins.toFixed(2)}`, color: '#818cf8' },
            { icon: <Gauge size={14} />, label: 'Win Rate', value: `${winRate}%`, color: winRate >= 50 ? '#22d65e' : '#ef4466' },
            { icon: <Target size={14} />, label: 'P&L Total', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? '#22d65e' : '#ef4466' },
            { icon: <Activity size={14} />, label: 'Mejor Trade', value: bestTrade > 0 ? `+$${bestTrade.toFixed(2)}` : '—', color: '#22d65e' },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeIn} whileHover={{ y: -2, transition: { type: 'spring', stiffness: 500 } }} className="glass-card !p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <span style={{ color: s.color }}>{s.icon}</span>
                <span className="text-[10px] text-[#5c5c80] font-medium">{s.label}</span>
              </div>
              <motion.div
                key={`${s.label}-${s.value}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="text-lg font-bold text-white tabular-nums"
              >
                {s.value}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Active Trades */}
        <div className="glass-card !p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-[#22d65e]" />
              <span className="text-sm font-semibold text-white">Trades Activos</span>
            </div>
            <span className="glass text-[10px] font-bold px-2 py-0.5 rounded-md text-[#818cf8]">
              {activeTrades.length}
            </span>
          </div>
          {activeTrades.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <motion.div animate={{ rotate: [0, 10, -10, 0], transition: { duration: 2, repeat: Infinity } }} className="text-3xl mb-2 opacity-30">📭</motion.div>
              <p className="text-[#5c5c80] text-sm">No hay trades abiertos</p>
              <p className="text-[#3c3c60] text-xs mt-1">Abre un trade desde el panel derecho</p>
            </motion.div>
          ) : (
            <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              <AnimatePresence>
                {activeTrades.map((t) => {
                  const theme = EXCHANGE_THEMES[t.exchange];
                  const isProfit = (t.pnl || 0) >= 0;
                  return (
                    <motion.div
                      key={t.id}
                      variants={fadeIn}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      whileHover={{ scale: 1.01, borderColor: 'rgba(99,102,241,0.2)' }}
                      className="glass !rounded-lg p-3 flex items-center justify-between transition-colors group"
                    >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: `${theme.color}15`, color: theme.color }}>
                        {theme.insignia}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{t.symbol}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            t.side === 'long' ? 'text-[#22d65e] bg-[rgba(34,214,94,0.1)]' : 'text-[#ef4466] bg-[rgba(239,68,102,0.1)]'
                          }`}>
                            {t.side === 'long' ? '▲' : '▼'} {t.type === 'futures' ? `${t.leverage}x` : 'Spot'}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#5c5c80] mt-0.5">
                          {theme.name} · ${t.amount.toFixed(2)}
                          {t.tp_price ? ` · TP: $${t.tp_price.toFixed(2)}` : ''}
                          {t.sl_price ? ` · SL: $${t.sl_price.toFixed(2)}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className={`text-right ${isProfit ? 'text-[#22d65e]' : 'text-[#ef4466]'}`}>
                      <div className="text-sm font-bold tabular-nums">
                        {isProfit ? '+' : ''}{(t.pnl ?? 0).toFixed(2)}$
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Closed trades */}
        <div className="glass-card !p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListOrdered size={15} className="text-[#5c5c80]" />
              <span className="text-sm font-semibold text-white">Historial</span>
            </div>
          </div>
          <div className="space-y-1 max-h-[140px] overflow-y-auto">
            {closedTrades.length === 0 ? (
              <p className="text-center text-[#5c5c80] text-xs py-4">Aún no hay trades cerrados</p>
            ) : (
              closedTrades.slice(-15).reverse().map((t) => (
                <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-[rgba(99,102,241,0.05)] last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white font-medium">{t.symbol}</span>
                    <span className={`text-[10px] ${t.side === 'long' ? 'text-[#22d65e]' : 'text-[#ef4466]'}`}>
                      {t.side === 'long' ? '▲' : '▼'}
                    </span>
                    <span className="text-[10px] text-[#5c5c80]">{t.type === 'futures' ? `${t.leverage}x` : 'Spot'}</span>
                  </div>
                  <span className={`text-xs font-medium tabular-nums ${(t.pnl || 0) >= 0 ? 'text-[#22d65e]' : 'text-[#ef4466]'}`}>
                    {(t.pnl || 0) >= 0 ? '+' : ''}{(t.pnl || 0).toFixed(2)}$
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ===== RIGHT: New Trade Form ===== */}
      <div className="space-y-4">
        {/* Profile Card */}
        <div className="glass-card !p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center text-lg">
              🏡
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">{profile?.email?.split('@')[0] || 'Trader'}</div>
              <div className="text-[10px] text-[#5c5c80]">Nv.{level} · {closedTrades.length} trades</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#5c5c80]">Monedas</div>
              <div className="text-base font-bold text-white tabular-nums">${coins.toFixed(2)}</div>
            </div>
          </div>
          {/* House preview */}
          {house && (
            <div className="glass !rounded-lg p-2.5 flex items-center gap-2">
              <span className="text-lg">{house.style === 'tent' ? '🏕️' : house.style === 'wood_house' ? '🪵' : house.style === 'stone_house' ? '🏠' : house.style === 'mansion' ? '🏛️' : '🏰'}</span>
              <div>
                <div className="text-xs font-medium text-white">Casa Lv.{house.level}</div>
                <div className="text-[10px] text-[#5c5c80] capitalize">{house.style.replace('_', ' ')}</div>
              </div>
            </div>
          )}
        </div>

        {/* New Trade */}
        <div className="glass-card !p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-[#f0b90b]" />
            <span className="text-sm font-bold text-white">Nuevo Trade</span>
          </div>

          {/* Type toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTradeType('spot')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                tradeType === 'spot' ? 'glass text-[#818cf8]' : 'text-[#5c5c80] hover:text-white'
              }`}
            >
              Spot
            </button>
            <button
              onClick={() => setTradeType('futures')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                tradeType === 'futures' ? 'glass text-[#818cf8]' : 'text-[#5c5c80] hover:text-white'
              }`}
            >
              Futuros Perp.
            </button>
          </div>

          {/* Side */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSide('long')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                side === 'long'
                  ? 'bg-[rgba(34,214,94,0.12)] text-[#22d65e] border border-[rgba(34,214,94,0.2)]'
                  : 'text-[#5c5c80] hover:bg-[rgba(34,214,94,0.05)]'
              }`}
            >
              ▲ Long
            </button>
            <button
              onClick={() => setSide('short')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                side === 'short'
                  ? 'bg-[rgba(239,68,102,0.12)] text-[#ef4466] border border-[rgba(239,68,102,0.2)]'
                  : 'text-[#5c5c80] hover:bg-[rgba(239,68,102,0.05)]'
              }`}
            >
              ▼ Short
            </button>
          </div>

          {/* Exchange */}
          <div className="mb-4">
            <label className="text-[10px] text-[#5c5c80] font-medium mb-1.5 block">Exchange</label>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.entries(EXCHANGE_THEMES) as [ExchangeType, typeof EXCHANGE_THEMES[ExchangeType]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setExchange(key)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    exchange === key
                      ? 'border text-white'
                      : 'text-[#5c5c80] hover:text-white border border-transparent'
                  }`}
                  style={exchange === key ? { borderColor: `${val.color}40`, background: `${val.color}10`, color: val.color } : {}}
                >
                  {val.insignia} {val.name}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="text-[10px] text-[#5c5c80] font-medium mb-1.5 block">Cantidad ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full glass !rounded-lg py-2.5 px-3 text-white text-sm font-medium tabular-nums focus:outline-none focus:border-[#6366f1] transition placeholder:text-[#3c3c60]"
              max={coins}
              step="any"
            />
            {/* Quick amounts */}
            <div className="flex gap-1 mt-2">
              {quickAmounts.map(qa => (
                <button
                  key={qa}
                  onClick={() => setAmount(qa.toString())}
                  className={`flex-1 py-1 rounded text-[10px] font-medium transition ${
                    parseFloat(amount) === qa ? 'glass text-[#818cf8]' : 'text-[#5c5c80] hover:text-white'
                  }`}
                >
                  ${qa}
                </button>
              ))}
            </div>
          </div>

          {/* Leverage */}
          {tradeType === 'futures' && (
            <div className="mb-4">
              <label className="text-[10px] text-[#5c5c80] font-medium mb-1.5 block">Apalancamiento</label>
              <div className="flex gap-1">
                {[1, 2, 3, 5, 10, 20, 50, 100].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => setLeverage(lev)}
                    className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-all ${
                      leverage === lev ? 'glass text-[#818cf8]' : 'text-[#5c5c80] hover:text-white'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TP / SL */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[10px] text-[#5c5c80] font-medium mb-1.5 block">
                🎯 Take Profit
              </label>
              <input
                type="number"
                value={tpPrice}
                onChange={(e) => setTpPrice(e.target.value)}
                placeholder={selectedSymbol === 'BTC' ? '69000' : selectedSymbol === 'ETH' ? '3550' : '150'}
                className="w-full glass !rounded-lg py-2.5 px-3 text-white text-sm font-medium tabular-nums focus:outline-none focus:border-[#22d65e] transition placeholder:text-[#3c3c60]"
                step="any"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#5c5c80] font-medium mb-1.5 block">
                🛑 Stop Loss
              </label>
              <input
                type="number"
                value={slPrice}
                onChange={(e) => setSlPrice(e.target.value)}
                placeholder={selectedSymbol === 'BTC' ? '66000' : selectedSymbol === 'ETH' ? '3350' : '140'}
                className="w-full glass !rounded-lg py-2.5 px-3 text-white text-sm font-medium tabular-nums focus:outline-none focus:border-[#ef4466] transition placeholder:text-[#3c3c60]"
                step="any"
              />
            </div>
          </div>

          {/* Position size preview */}
          {parseFloat(amount) > 0 && (
            <div className="glass !rounded-lg p-2.5 mb-4 space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#5c5c80]">Tamaño posición</span>
                <span className="text-white font-medium">${(parseFloat(amount) * (tradeType === 'futures' ? leverage : 1)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#5c5c80]">Fee estimado (0.1%)</span>
                <span className="text-white font-medium">${(parseFloat(amount) * 0.001).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Trade button */}
          <button
            onClick={handleTrade}
            disabled={!amount || parseFloat(amount) <= 0}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
              side === 'long'
                ? 'bg-gradient-to-r from-[#22d65e] to-[#16a34a] text-white hover:shadow-lg hover:shadow-[rgba(34,214,94,0.3)]'
                : 'bg-gradient-to-r from-[#ef4466] to-[#dc2626] text-white hover:shadow-lg hover:shadow-[rgba(239,68,102,0.3)]'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {side === 'long' ? 'Abrir Long' : 'Abrir Short'} {selectedSymbol}
          </button>
        </div>
      </div>

      {/* Loss Overlay */}
      <LossOverlay
        show={lossOverlay.show}
        pnl={lossOverlay.pnl}
        symbol={lossOverlay.symbol}
        onDismiss={() => setLossOverlay({ show: false, pnl: 0, symbol: '' })}
      />
    </div>
  );
}
