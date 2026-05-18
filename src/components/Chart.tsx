'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart, ColorType, IChartApi, ISeriesApi,
  CandlestickData, HistogramData, LineData, Time
} from 'lightweight-charts';
import { CryptoSymbol } from '@/types';

interface Props {
  symbol: CryptoSymbol;
  onPriceUpdate?: (price: number) => void;
}

// ===================== HELPERS =====================

function calcSMA(data: number[], period: number): (number | null)[] {
  const r: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { r.push(null); continue; }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j];
    r.push(sum / period);
  }
  return r;
}

function calcEMA(data: number[], period: number): (number | null)[] {
  const mul = 2 / (period + 1);
  const r: (number | null)[] = [];
  let ema: number | null = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { r.push(null); continue; }
    if (ema === null) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += data[j];
      ema = sum / period;
    } else {
      ema = (data[i] - ema) * mul + ema;
    }
    r.push(ema);
  }
  return r;
}

function calcRSI(data: number[], period: number = 14): (number | null)[] {
  const r: (number | null)[] = [];
  const changes = data.map((v, i) => i > 0 ? v - data[i - 1] : 0);
  let avgGain = 0, avgLoss = 0;
  for (let i = 0; i < data.length; i++) {
    if (i < period) { r.push(null); continue; }
    if (i === period) {
      let g = 0, l = 0;
      for (let j = 1; j <= period; j++) {
        if (changes[j] > 0) g += changes[j]; else l += Math.abs(changes[j]);
      }
      avgGain = g / period;
      avgLoss = l / period;
    } else {
      const c = changes[i];
      avgGain = (avgGain * (period - 1) + (c > 0 ? c : 0)) / period;
      avgLoss = (avgLoss * (period - 1) + (c < 0 ? Math.abs(c) : 0)) / period;
    }
    r.push(avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss)));
  }
  return r;
}

function calcMACD(data: number[]): { macd: (number | null)[]; signal: (number | null)[]; hist: (number | null)[] } {
  const ema12 = calcEMA(data, 12);
  const ema26 = calcEMA(data, 26);
  const macd: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (ema12[i] !== null && ema26[i] !== null) {
      macd.push(ema12[i]! - ema26[i]!);
    } else {
      macd.push(null);
    }
  }
  const signal = calcEMA(macd.map(v => v ?? 0), 9);
  // Fix signal: only have values where we have enough MACD data
  for (let i = 0; i < signal.length; i++) {
    if (macd[i] === null) signal[i] = null;
  }
  const hist = macd.map((v, i) =>
    v !== null && signal[i] !== null ? v - signal[i]! : null
  );
  return { macd, signal, hist };
}

function calcBollinger(data: number[], period: number = 20, stdDev: number = 2): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } {
  const middle = calcSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (middle[i] === null) { upper.push(null); lower.push(null); continue; }
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sumSq += (data[j] - middle[i]!) ** 2;
    }
    const sd = Math.sqrt(sumSq / period);
    upper.push(middle[i]! + stdDev * sd);
    lower.push(middle[i]! - stdDev * sd);
  }
  return { upper, middle, lower };
}

// ===================== MOCK DATA =====================

function generateMockData(symbol: CryptoSymbol, days: number = 90): { time: string; open: number; high: number; low: number; close: number; volume: number }[] {
  const basePrices: Record<string, number> = { BTC: 67500, ETH: 3450, SOL: 145 };
  const base = basePrices[symbol] || 100;
  const data: any[] = [];
  const now = new Date();
  let prevClose = base;
  let trend = Math.random() > 0.5 ? 1 : -1;
  let trendDays = 0;

  for (let i = days; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000 * 24);
    const timeStr = t.toISOString().slice(0, 10);
    if (data.length > 0 && data[data.length - 1].time === timeStr) continue;

    trendDays++;
    if (trendDays > 5 + Math.floor(Math.random() * 8)) {
      trend = Math.random() > 0.5 ? 1 : -1;
      trendDays = 0;
    }
    const vol = base * 0.015;
    const tf = trend * vol * 0.3;
    const open = prevClose;
    const change = (Math.random() - 0.48) * vol + tf;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * vol * 0.4;
    const low = Math.min(open, close) - Math.random() * vol * 0.4;
    const volume = Math.floor(Math.random() * 8000 + 2000 + Math.abs(change) * 50000);
    data.push({ time: timeStr, open, high, low, close, volume });
    prevClose = close;
  }
  return data;
}

// ===================== COMPONENT =====================

export default function Chart({ symbol, onPriceUpdate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [macdVal, setMacdVal] = useState(0);
  const [rsiVal, setRsiVal] = useState(50);

  useEffect(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = 600;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0b1e' },
        textColor: '#5c5c80',
        fontFamily: 'Inter, sans-serif',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(99,102,241,0.04)' },
        horzLines: { color: 'rgba(99,102,241,0.04)' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: 'rgba(99,102,241,0.25)', width: 1, style: 2, labelBackgroundColor: '#6366f1' },
        horzLine: { color: 'rgba(99,102,241,0.25)', width: 1, style: 2, labelBackgroundColor: '#6366f1' },
      },
      width: w,
      height: h,
      timeScale: {
        borderColor: 'rgba(99,102,241,0.1)',
        timeVisible: false,
        tickMarkFormatter: (t: number) => {
          const d = new Date(t * 1000);
          return `${d.getDate()}/${d.getMonth() + 1}`;
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(99,102,241,0.1)',
        borderVisible: true,
        scaleMargins: { top: 0.05, bottom: 0.35 },
      },
    });

    // === MAIN PANE: Candles + EMAs + Bollinger + Volume ===

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22d65e', downColor: '#ef4466',
      borderDownColor: '#ef4466', borderUpColor: '#22d65e',
      wickDownColor: '#ef446644', wickUpColor: '#22d65e44',
    });

    const volSeries = chart.addHistogramSeries({
      color: '#6366f144',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.88, bottom: 0 } });

    const ema9 = chart.addLineSeries({ color: '#818cf8', lineWidth: 1 as any, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
    const ema21 = chart.addLineSeries({ color: '#f59e0b', lineWidth: 1 as any, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });

    const bbUpper = chart.addLineSeries({ color: 'rgba(99,102,241,0.3)', lineWidth: 1 as any, lineStyle: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
    const bbLower = chart.addLineSeries({ color: 'rgba(99,102,241,0.3)', lineWidth: 1 as any, lineStyle: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });

    // === MACD PANE ===
    const macdPane = createPane(chart, 0.30);
    const macdHist = macdPane.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false });
    const macdLine = macdPane.addLineSeries({ color: '#818cf8', lineWidth: 1 as any, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
    const macdSignal = macdPane.addLineSeries({ color: '#f0b90b', lineWidth: 1 as any, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });

    // Zero line
    const zeroLine = macdPane.addLineSeries({ color: 'rgba(99,102,241,0.15)', lineWidth: 1 as any, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });

    // === RSI PANE ===
    const rsiPane = createPane(chart, 0.15);
    const rsiLine = rsiPane.addLineSeries({ color: '#f59e0b', lineWidth: 1.5 as any, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });

    // RSI overbought/oversold levels
    const rsOver = rsiPane.addLineSeries({ color: 'rgba(239,68,102,0.2)', lineWidth: 1 as any, lineStyle: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
    const rsUnder = rsiPane.addLineSeries({ color: 'rgba(34,214,94,0.2)', lineWidth: 1 as any, lineStyle: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });

    // === DATA ===
    const data = generateMockData(symbol);
    const closes = data.map(d => d.close);
    const times = data.map(d => d.time);
    const len = data.length;

    // Candles + volume
    candleSeries.setData(data as CandlestickData[]);
    volSeries.setData(data.map(d => ({
      time: d.time, value: d.volume,
      color: d.close >= d.open ? 'rgba(34,214,94,0.15)' : 'rgba(239,68,102,0.15)',
    })) as HistogramData[]);

    // EMAs
    pushLines(ema9, calcEMA(closes, 9), times);
    pushLines(ema21, calcEMA(closes, 21), times);

    // Bollinger
    const bb = calcBollinger(closes, 20, 2);
    pushLines(bbUpper, bb.upper, times);
    pushLines(bbLower, bb.lower, times);

    // MACD
    const m = calcMACD(closes);
    const macdHistData = m.hist.map((v, i) => v !== null ? { time: times[i], value: v, color: v >= 0 ? 'rgba(34,214,94,0.5)' : 'rgba(239,68,102,0.5)' } : null).filter(Boolean);
    macdHist.setData(macdHistData as any);
    pushLines(macdLine, m.macd, times);
    pushLines(macdSignal, m.signal, times);

    // Zero line for MACD
    const zeros = times.map(t => ({ time: t, value: 0 }));
    zeroLine.setData(zeros);

    // RSI
    const rsi = calcRSI(closes, 14);
    pushLines(rsiLine, rsi, times);

    // RSI levels (70 overbought, 30 oversold)
    const r70 = times.map(t => ({ time: t, value: 70 }));
    const r30 = times.map(t => ({ time: t, value: 30 }));
    rsOver.setData(r70);
    rsUnder.setData(r30);

    // Current values
    const lastIdx = len - 1;
    setCurrentPrice(closes[lastIdx]);
    setPriceChange(((closes[lastIdx] - closes[0]) / closes[0]) * 100);
    if (onPriceUpdate) onPriceUpdate(closes[lastIdx]);
    setMacdVal(m.hist[lastIdx] ?? 0);
    setRsiVal(rsi[lastIdx] ?? 50);

    // Resize
    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol]);

  return (
    <div className="space-y-2">
      {/* Price + indicator summary bar */}
      <div className="flex items-center justify-between px-1 flex-wrap gap-y-1">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white tabular-nums">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            priceChange >= 0
              ? 'text-[#22d65e] bg-[rgba(34,214,94,0.1)]'
              : 'text-[#ef4466] bg-[rgba(239,68,102,0.1)]'
          }`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-[#5c5c80]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 rounded-full bg-[#818cf8]" /> EMA9
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 rounded-full bg-[#f59e0b]" /> EMA21
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 rounded-full bg-[#6366f1]/30" /> BB(20,2)
          </span>
          <span className={`flex items-center gap-1 ${macdVal >= 0 ? 'text-[#22d65e]' : 'text-[#ef4466]'}`}>
            MACD {macdVal >= 0 ? '+' : ''}{macdVal.toFixed(2)}
          </span>
          <span className={`flex items-center gap-1 ${
            rsiVal > 70 ? 'text-[#ef4466]' : rsiVal < 30 ? 'text-[#22d65e]' : 'text-[#5c5c80]'
          }`}>
            RSI {rsiVal.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="w-full rounded-xl overflow-hidden" style={{ height: 600 }} />
    </div>
  );
}

// ===================== UTILS =====================

function createPane(chart: IChartApi, heightFraction: number): {
  addHistogramSeries: IChartApi['addHistogramSeries'];
  addLineSeries: IChartApi['addLineSeries'];
} {
  // In lightweight-charts v4, we use the chart API directly with separate panes
  // The built-in pane support is through priceScale IDs
  return {
    addHistogramSeries: (opts: any) => {
      const id = `pane_${Math.random().toString(36).slice(2,6)}`;
      const series = chart.addHistogramSeries({
        ...opts,
        priceScaleId: id,
      });
      chart.priceScale(id).applyOptions({
        scaleMargins: { top: 0, bottom: 1 - heightFraction },
        borderColor: 'rgba(99,102,241,0.08)',
        borderVisible: true,
      });
      return series;
    },
    addLineSeries: (opts: any) => {
      const id = `pane_${Math.random().toString(36).slice(2,6)}`;
      const series = chart.addLineSeries({
        ...opts,
        priceScaleId: id,
      });
      chart.priceScale(id).applyOptions({
        scaleMargins: { top: 0, bottom: 1 - heightFraction },
        borderColor: 'rgba(99,102,241,0.08)',
        borderVisible: true,
      });
      return series;
    },
  } as any;
}

function pushLines(series: ISeriesApi<'Line'>, values: (number | null)[], times: string[]) {
  const points: LineData[] = [];
  values.forEach((v, i) => {
    if (v !== null) points.push({ time: times[i] as Time, value: v });
  });
  series.setData(points);
}
