'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, HistogramData, LineData } from 'lightweight-charts';
import { CryptoSymbol } from '@/types';

interface Props {
  symbol: CryptoSymbol;
  onPriceUpdate?: (price: number) => void;
}

// ===================== INDICADORES =====================

function calcEMA(data: number[], period: number): (number | null)[] {
  const multiplier = 2 / (period + 1);
  const result: (number | null)[] = [];
  let ema: number | null = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); continue; }
    if (ema === null) {
      // SMA for first value
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += data[j];
      ema = sum / period;
    } else {
      ema = (data[i] - ema) * multiplier + ema;
    }
    result.push(ema);
  }
  return result;
}

// Mock OHLCV data generator with trend
function generateMockData(symbol: CryptoSymbol, days: number = 60): { time: string; open: number; high: number; low: number; close: number; volume: number }[] {
  const basePrices: Record<string, number> = { BTC: 67500, ETH: 3450, SOL: 145 };
  const base = basePrices[symbol] || 100;
  const data: any[] = [];
  const now = new Date();
  let prevClose = base;
  let trend = Math.random() > 0.5 ? 1 : -1;
  let trendDays = 0;

  for (let i = days * 24; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000);
    const timeStr = t.toISOString().slice(0, 10);
    if (data.length > 0 && data[data.length - 1].time === timeStr) continue;

    // Trend changes every 5-10 candles
    trendDays++;
    if (trendDays > 5 + Math.floor(Math.random() * 6)) {
      trend = Math.random() > 0.5 ? 1 : -1;
      trendDays = 0;
    }

    const volatility = base * 0.015;
    const trendFactor = trend * volatility * 0.3;
    const open = prevClose;
    const change = (Math.random() - 0.48) * volatility + trendFactor;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.4;
    const low = Math.min(open, close) - Math.random() * volatility * 0.4;
    const volume = Math.floor(Math.random() * 8000 + 2000 + Math.abs(change) * 50000);

    data.push({ time: timeStr, open, high, low, close, volume });
    prevClose = close;
  }
  return data;
}

export default function Chart({ symbol, onPriceUpdate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ema9Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ema21Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0b1e' },
        textColor: '#5c5c80',
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(99,102,241,0.05)' },
        horzLines: { color: 'rgba(99,102,241,0.05)' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: 'rgba(99,102,241,0.3)', width: 1, style: 2, labelBackgroundColor: '#6366f1' },
        horzLine: { color: 'rgba(99,102,241,0.3)', width: 1, style: 2, labelBackgroundColor: '#6366f1' },
      },
      width: containerRef.current.clientWidth,
      height: 420,
      timeScale: {
        borderColor: 'rgba(99,102,241,0.1)',
        timeVisible: false,
        tickMarkFormatter: (time: number) => {
          const d = new Date(time * 1000);
          return `${d.getDate()}/${d.getMonth() + 1}`;
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(99,102,241,0.1)',
        borderVisible: true,
      },
    });

    // Candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22d65e',
      downColor: '#ef4466',
      borderDownColor: '#ef4466',
      borderUpColor: '#22d65e',
      wickDownColor: '#ef446644',
      wickUpColor: '#22d65e44',
    });

    // Volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#6366f144',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    // EMA lines
    const ema9 = chart.addLineSeries({
      color: '#818cf8',
      lineWidth: 1 as any,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    const ema21 = chart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 1 as any,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    const data = generateMockData(symbol);
    candleSeries.setData(data as CandlestickData[]);

    // Volume colors
    volumeSeries.setData(data.map((d) => ({
      time: d.time,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(34,214,94,0.2)' : 'rgba(239,68,102,0.2)',
    })) as HistogramData[]);

    // EMA calculations
    const closes = data.map((d) => d.close);
    const times = data.map((d) => d.time);
    const ema9Data: LineData[] = [];
    const ema21Data: LineData[] = [];
    const ema9Vals = calcEMA(closes, 9);
    const ema21Vals = calcEMA(closes, 21);

    ema9Vals.forEach((val, i) => {
      if (val !== null) ema9Data.push({ time: times[i], value: val });
    });
    ema21Vals.forEach((val, i) => {
      if (val !== null) ema21Data.push({ time: times[i], value: val });
    });

    ema9.setData(ema9Data);
    ema21.setData(ema21Data);

    // Current price
    const lastPrice = data[data.length - 1].close;
    const firstPrice = data[0].close;
    setCurrentPrice(lastPrice);
    setPriceChange(((lastPrice - firstPrice) / firstPrice) * 100);
    if (onPriceUpdate) onPriceUpdate(lastPrice);

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    ema9Ref.current = ema9;
    ema21Ref.current = ema21;

    // Crosshair -> price update
    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.point && onPriceUpdate) {
        const data = param.seriesData.get(candleSeries);
        if (data && typeof data === 'object' && 'close' in data) {
          onPriceUpdate((data as any).close);
        }
      }
    });

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol]);

  return (
    <div className="space-y-2">
      {/* Price info bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white tabular-nums">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            priceChange >= 0 ? 'text-[#22d65e] bg-[rgba(34,214,94,0.1)]' : 'text-[#ef4466] bg-[rgba(239,68,102,0.1)]'
          }`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#5c5c80]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 rounded-full bg-[#818cf8]" /> EMA 9
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 rounded-full bg-[#f59e0b]" /> EMA 21
          </span>
        </div>
      </div>
      {/* Chart */}
      <div ref={containerRef} className="w-full rounded-xl overflow-hidden" />
    </div>
  );
}
