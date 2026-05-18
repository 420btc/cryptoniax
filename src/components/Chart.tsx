'use client';

import { useEffect, useRef } from 'react';
import {
  createChart, ColorType, IChartApi, ISeriesApi,
  CandlestickData, HistogramData, LineData, Time
} from 'lightweight-charts';
import { CryptoSymbol, Trade, EXCHANGE_THEMES } from '@/types';
import { useRealtimeCrypto, CandleData } from '@/hooks/useRealtimeCrypto';

interface Props {
  symbol: CryptoSymbol;
  onPriceUpdate?: (price: number, change24h: number) => void;
  activeTrades?: Trade[];
}

// ===================== INDICATORS =====================

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

// ===================== CHART OPTIONS =====================

const DARK_BG = '#0a0b1e';
const GRID_COLOR = 'rgba(99,102,241,0.04)';
const BORDER_COLOR = 'rgba(99,102,241,0.1)';
const TEXT_COLOR = '#5c5c80';
const CROSSHAIR_COLOR = 'rgba(99,102,241,0.25)';

function baseChartOptions(width: number, height: number): any {
  return {
    layout: {
      background: { type: ColorType.Solid, color: DARK_BG },
      textColor: TEXT_COLOR,
      fontFamily: 'Inter, sans-serif',
      fontSize: 10,
    },
    grid: {
      vertLines: { color: GRID_COLOR },
      horzLines: { color: GRID_COLOR },
    },
    crosshair: {
      mode: 0,
      vertLine: { color: CROSSHAIR_COLOR, width: 1, style: 2, labelBackgroundColor: '#6366f1' },
      horzLine: { color: CROSSHAIR_COLOR, width: 1, style: 2, labelBackgroundColor: '#6366f1' },
    },
    width,
    height,
    timeScale: {
      borderColor: BORDER_COLOR,
      timeVisible: false,
      tickMarkFormatter: (t: number) => {
        const d = new Date(t * 1000);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      },
    },
  };
}

// ===================== COMPONENT =====================

export default function Chart({ symbol, onPriceUpdate, activeTrades = [] }: Props) {
  const { candles, currentPrice, priceChange24h, loading, error } = useRealtimeCrypto(symbol);

  // Refs for DOM containers
  const mainRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const macdRef = useRef<HTMLDivElement>(null);
  const rsiRef = useRef<HTMLDivElement>(null);

  // Notify parent of price updates
  useEffect(() => {
    if (currentPrice > 0 && onPriceUpdate) {
      onPriceUpdate(currentPrice, priceChange24h);
    }
  }, [currentPrice, priceChange24h, onPriceUpdate]);

  // Build chart when data is ready
  useEffect(() => {
    if (!candles.length || !mainRef.current || !volumeRef.current || !macdRef.current || !rsiRef.current) return;

    const w = mainRef.current.clientWidth;
    const HEIGHTS = { main: 300, volume: 80, macd: 130, rsi: 110 };

    const closes = candles.map(d => d.close);
    const times = candles.map(d => d.time);

    // =============== MAIN CHART ===============
    const mainChart = createChart(mainRef.current, {
      ...baseChartOptions(w, HEIGHTS.main),
      rightPriceScale: { borderColor: BORDER_COLOR, borderVisible: true },
    });

    const candleSeries = mainChart.addCandlestickSeries({
      upColor: '#22d65e', downColor: '#ef4466',
      borderDownColor: '#ef4466', borderUpColor: '#22d65e',
      wickDownColor: '#ef446644', wickUpColor: '#22d65e44',
    });

    const ema9 = mainChart.addLineSeries({
      color: '#818cf8', lineWidth: 1, priceLineVisible: false,
      lastValueVisible: false, crosshairMarkerVisible: false,
    });
    const ema21 = mainChart.addLineSeries({
      color: '#f59e0b', lineWidth: 1, priceLineVisible: false,
      lastValueVisible: false, crosshairMarkerVisible: false,
    });
    const bbUpper = mainChart.addLineSeries({
      color: 'rgba(99,102,241,0.3)', lineWidth: 1, lineStyle: 2,
      priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
    });
    const bbLower = mainChart.addLineSeries({
      color: 'rgba(99,102,241,0.3)', lineWidth: 1, lineStyle: 2,
      priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
    });

    // =============== VOLUME CHART ===============
    const volChart = createChart(volumeRef.current, {
      ...baseChartOptions(w, HEIGHTS.volume),
      rightPriceScale: { borderColor: BORDER_COLOR, borderVisible: false },
      timeScale: { visible: false },
      grid: { vertLines: { color: GRID_COLOR }, horzLines: { visible: false } },
      crosshair: { vertLine: { visible: false }, horzLine: { visible: false } },
      handleScroll: false, handleScale: false,
    });

    const volSeries = volChart.addHistogramSeries({ priceFormat: { type: 'volume' } });

    // =============== MACD CHART ===============
    const macdChart = createChart(macdRef.current, {
      ...baseChartOptions(w, HEIGHTS.macd),
      rightPriceScale: { borderColor: BORDER_COLOR, borderVisible: true },
      timeScale: { visible: false },
      grid: { vertLines: { color: GRID_COLOR }, horzLines: { color: GRID_COLOR } },
      handleScroll: false, handleScale: false,
    });

    const macdHistSeries = macdChart.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false });
    const macdLineSeries = macdChart.addLineSeries({
      color: '#818cf8', lineWidth: 1, priceLineVisible: false,
      lastValueVisible: false, crosshairMarkerVisible: false,
    });
    const macdSignalSeries = macdChart.addLineSeries({
      color: '#f0b90b', lineWidth: 1, priceLineVisible: false,
      lastValueVisible: false, crosshairMarkerVisible: false,
    });
    const zeroLineSeries = macdChart.addLineSeries({
      color: 'rgba(99,102,241,0.15)', lineWidth: 1, priceLineVisible: false,
      lastValueVisible: false, crosshairMarkerVisible: false,
    });

    // =============== RSI CHART ===============
    const rsiChart = createChart(rsiRef.current, {
      ...baseChartOptions(w, HEIGHTS.rsi),
      rightPriceScale: { borderColor: BORDER_COLOR, borderVisible: true },
      handleScroll: false, handleScale: false,
    });

    const rsiLineSeries = rsiChart.addLineSeries({
      color: '#f59e0b', lineWidth: 1.5, priceLineVisible: false,
      lastValueVisible: false, crosshairMarkerVisible: false,
    });
    const rsiOverSeries = rsiChart.addLineSeries({
      color: 'rgba(239,68,102,0.2)', lineWidth: 1, lineStyle: 2,
      priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
    });
    const rsiUnderSeries = rsiChart.addLineSeries({
      color: 'rgba(34,214,94,0.2)', lineWidth: 1, lineStyle: 2,
      priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
    });

    // =============== SYNC TIME SCALES ===============
    function syncTimeScale(source: IChartApi, targets: IChartApi[]) {
      source.timeScale().subscribeVisibleTimeRangeChange(() => {
        const range = source.timeScale().getVisibleLogicalRange();
        if (range) {
          targets.forEach(t => t.timeScale().setVisibleLogicalRange(range));
        }
      });
    }

    syncTimeScale(mainChart, [volChart, macdChart, rsiChart]);

    // =============== POPULATE DATA ===============
    candleSeries.setData(candles as CandlestickData[]);
    pushLines(ema9, calcEMA(closes, 9), times);
    pushLines(ema21, calcEMA(closes, 21), times);
    const bb = calcBollinger(closes, 20, 2);
    pushLines(bbUpper, bb.upper, times);
    pushLines(bbLower, bb.lower, times);

    // Volume
    volSeries.setData(candles.map((d: CandleData) => ({
      time: d.time, value: d.volume,
      color: d.close >= d.open ? 'rgba(34,214,94,0.3)' : 'rgba(239,68,102,0.3)',
    })) as HistogramData[]);

    // MACD
    const m = calcMACD(closes);
    const macdHistData = m.hist.map((v, i) => v !== null ? {
      time: times[i], value: v,
      color: v >= 0 ? 'rgba(34,214,94,0.4)' : 'rgba(239,68,102,0.4)',
    } : null).filter(Boolean);
    macdHistSeries.setData(macdHistData as any);
    pushLines(macdLineSeries, m.macd, times);
    pushLines(macdSignalSeries, m.signal, times);
    zeroLineSeries.setData(times.map(t => ({ time: t, value: 0 })));

    // RSI
    const rsi = calcRSI(closes, 14);
    pushLines(rsiLineSeries, rsi, times);
    rsiOverSeries.setData(times.map(t => ({ time: t, value: 70 })));
    rsiUnderSeries.setData(times.map(t => ({ time: t, value: 30 })));

    // =============== TRADE MARKERS ===============
    const tradeSeries: ISeriesApi<'Line'>[] = [];
    const symbolTrades = activeTrades.filter(t => t.symbol === symbol);
    symbolTrades.forEach((trade) => {
      const theme = EXCHANGE_THEMES[trade.exchange] || EXCHANGE_THEMES.other;
      const color = theme.color;

      const entryLine = mainChart.addLineSeries({
        color, lineWidth: 2, lineStyle: 0,
        priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
      });
      entryLine.setData(times.map(t => ({ time: t, value: trade.entry_price })));
      tradeSeries.push(entryLine);

      if (trade.tp_price) {
        const tpLine = mainChart.addLineSeries({
          color: '#22d65e', lineWidth: 1, lineStyle: 2,
          priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
        });
        tpLine.setData(times.map(t => ({ time: t, value: trade.tp_price! })));
        tradeSeries.push(tpLine);
      }

      if (trade.sl_price) {
        const slLine = mainChart.addLineSeries({
          color: '#ef4466', lineWidth: 1, lineStyle: 2,
          priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
        });
        slLine.setData(times.map(t => ({ time: t, value: trade.sl_price! })));
        tradeSeries.push(slLine);
      }
    });

    // =============== RESIZE ===============
    const allCharts = [mainChart, volChart, macdChart, rsiChart];
    const handleResize = () => {
      if (mainRef.current) {
        const nw = mainRef.current.clientWidth;
        allCharts.forEach(c => c.applyOptions({ width: nw }));
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      allCharts.forEach(c => c.remove());
    };
  }, [candles, activeTrades]);

  const chartHeight = 300 + 80 + 130 + 110;
  const macdVal = 0; // Filled from data
  const rsiVal = 50;

  // Loading / Error states
  if (error) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-[rgba(239,68,102,0.2)] bg-[rgba(239,68,102,0.05)]" style={{ height: chartHeight }}>
        <div className="text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-[#ef4466] text-sm font-medium">Error al cargar datos</p>
          <p className="text-[#5c5c80] text-xs mt-1">Reintentando...</p>
        </div>
      </div>
    );
  }

  if (loading && !candles.length) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-[rgba(99,102,241,0.06)]" style={{ height: chartHeight }}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#818cf8] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-[#5c5c80] text-sm">Cargando {symbol}/USDT...</p>
          <p className="text-[#3c3c60] text-xs mt-1">Binance · Datos reales</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Price bar */}
      <div className="flex items-center justify-between px-1 flex-wrap gap-y-1">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white tabular-nums">
            ${currentPrice.toLocaleString(undefined, {
              minimumFractionDigits: symbol === 'XRP' ? 4 : 2,
              maximumFractionDigits: symbol === 'XRP' ? 4 : 2,
            })}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            priceChange24h >= 0
              ? 'text-[#22d65e] bg-[rgba(34,214,94,0.1)]'
              : 'text-[#ef4466] bg-[rgba(239,68,102,0.1)]'
          }`}>
            {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}% 24h
          </span>
          <span className="text-[10px] text-[#5c5c80] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22d65e] animate-pulse" />
            Binance
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
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 rounded-full bg-[#818cf8]" /> MACD
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 rounded-full bg-[#f59e0b]" /> RSI
          </span>
        </div>
      </div>

      {/* Multi-pane chart */}
      <div className="w-full rounded-xl overflow-hidden border border-[rgba(99,102,241,0.06)]" style={{ height: chartHeight }}>
        <div ref={mainRef} style={{ width: '100%', height: 300 }} />
        <div ref={volumeRef} style={{ width: '100%', height: 80 }} className="border-t border-[rgba(99,102,241,0.06)]" />
        <div ref={macdRef} style={{ width: '100%', height: 130 }} className="border-t border-[rgba(99,102,241,0.06)] relative">
          <div className="absolute top-1 left-2 text-[9px] text-[#818cf8] opacity-50 pointer-events-none z-10">MACD (12,26,9)</div>
        </div>
        <div ref={rsiRef} style={{ width: '100%', height: 110 }} className="border-t border-[rgba(99,102,241,0.06)] relative">
          <div className="absolute top-1 left-2 text-[9px] text-[#f59e0b] opacity-50 pointer-events-none z-10">RSI (14)</div>
        </div>
      </div>
    </div>
  );
}

// ===================== UTILS =====================

function pushLines(series: ISeriesApi<'Line'>, values: (number | null)[], times: string[]) {
  const points: LineData[] = [];
  values.forEach((v, i) => {
    if (v !== null) points.push({ time: times[i] as Time, value: v });
  });
  series.setData(points);
}
