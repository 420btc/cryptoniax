'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, HistogramData } from 'lightweight-charts';
import { CryptoSymbol } from '@/types';

interface Props {
  symbol: CryptoSymbol;
  onPriceUpdate?: (price: number) => void;
}

// Generate realistic-ish OHLCV mock data for paper trading
function generateMockData(symbol: CryptoSymbol, days: number = 30): { time: string; open: number; high: number; low: number; close: number; volume: number }[] {
  const basePrices: Record<string, number> = { BTC: 67500, ETH: 3450, SOL: 145 };
  const base = basePrices[symbol] || 100;
  const data: any[] = [];
  const now = new Date();
  let prevClose = base;

  for (let i = days * 24; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000);
    const timeStr = t.toISOString().slice(0, 10);
    // Skip duplicates (same day)
    if (data.length > 0 && data[data.length - 1].time === timeStr) continue;

    const volatility = base * 0.02;
    const open = prevClose;
    const close = open + (Math.random() - 0.48) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 10000 + 1000);

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

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#12122a' },
        textColor: '#8888aa',
      },
      grid: {
        vertLines: { color: '#1a1a3a' },
        horzLines: { color: '#1a1a3a' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: '#7C3AED', width: 1, style: 2 },
        horzLine: { color: '#7C3AED', width: 1, style: 2 },
      },
      width: containerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: '#2a2a5a',
        timeVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2a2a5a',
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#7C3AED44',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    const data = generateMockData(symbol);
    candleSeries.setData(data as CandlestickData[]);
    volumeSeries.setData(data.map(d => ({ time: d.time, value: d.volume, color: d.close >= d.open ? '#22c55e44' : '#ef444444' })) as HistogramData[]);

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Subscribe to crosshair move for current price
    chart.subscribeCrosshairMove(param => {
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

  return <div ref={containerRef} className="w-full h-[400px] rounded-xl overflow-hidden" />;
}
