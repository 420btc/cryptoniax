'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CryptoSymbol, BINANCE_SYMBOLS } from '@/types';

// Binance REST + WebSocket for real crypto data
const BINANCE_REST = 'https://api.binance.com/api/v3';
const BINANCE_WS = 'wss://stream.binance.com:9443/ws';

export interface CandleData {
  time: string;        // ISO date YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface BinanceKline {
  0: number; // open time
  1: string; // open
  2: string; // high
  3: string; // low
  4: string; // close
  5: string; // volume
}

function klineToCandle(k: BinanceKline): CandleData {
  return {
    time: new Date(k[0]).toISOString().slice(0, 10),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  };
}

// Fetch historical daily candles
async function fetchHistorical(symbol: CryptoSymbol, days: number = 120): Promise<CandleData[]> {
  const binanceSymbol = BINANCE_SYMBOLS[symbol];
  const url = `${BINANCE_REST}/klines?symbol=${binanceSymbol}&interval=1d&limit=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance API error: ${res.status}`);
  const data: BinanceKline[] = await res.json();
  return data.map(klineToCandle);
}

// WebSocket singleton per symbol
const wsCache = new Map<string, WebSocket>();
const listeners = new Map<string, Set<(price: number, change24h: number) => void>>();

function subscribeWS(symbol: CryptoSymbol, cb: (price: number, change24h: number) => void) {
  const binanceSymbol = BINANCE_SYMBOLS[symbol].toLowerCase();
  const stream = `${binanceSymbol}@ticker`;

  if (!listeners.has(stream)) {
    listeners.set(stream, new Set());
  }
  listeners.get(stream)!.add(cb);

  if (!wsCache.has(stream)) {
    const ws = new WebSocket(`${BINANCE_WS}/${stream}`);
    wsCache.set(stream, ws);

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const price = parseFloat(data.c);      // last price
        const change24h = parseFloat(data.P);  // 24h change %
        listeners.get(stream)?.forEach(fn => fn(price, change24h));
      } catch {}
    };

    ws.onclose = () => {
      wsCache.delete(stream);
      // Reconnect after 3s
      setTimeout(() => {
        if (listeners.get(stream)?.size) {
          subscribeReconnect(symbol, stream);
        }
      }, 3000);
    };
  }

  // Return unsubscribe
  return () => {
    listeners.get(stream)?.delete(cb);
    if (listeners.get(stream)?.size === 0) {
      listeners.delete(stream);
      wsCache.get(stream)?.close();
      wsCache.delete(stream);
    }
  };
}

function subscribeReconnect(symbol: CryptoSymbol, stream: string) {
  const ws = new WebSocket(`${BINANCE_WS}/${stream}`);
  wsCache.set(stream, ws);

  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      const price = parseFloat(data.c);
      const change24h = parseFloat(data.P);
      listeners.get(stream)?.forEach(fn => fn(price, change24h));
    } catch {}
  };

  ws.onclose = () => {
    wsCache.delete(stream);
    setTimeout(() => {
      if (listeners.get(stream)?.size) {
        subscribeReconnect(symbol, stream);
      }
    }, 3000);
  };
}

// ── Hook ──

interface UseRealtimeCryptoReturn {
  candles: CandleData[];
  currentPrice: number;
  priceChange24h: number;
  loading: boolean;
  error: string | null;
}

export function useRealtimeCrypto(symbol: CryptoSymbol): UseRealtimeCryptoReturn {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const symbolRef = useRef(symbol);

  // Fetch historical candles
  const loadCandles = useCallback(async (sym: CryptoSymbol) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchHistorical(sym, 120);
      setCandles(data);
      if (data.length > 0) {
        const last = data[data.length - 1];
        setCurrentPrice(last.close);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + symbol change
  useEffect(() => {
    symbolRef.current = symbol;
    loadCandles(symbol);
  }, [symbol, loadCandles]);

  // WebSocket for real-time price
  useEffect(() => {
    const unsub = subscribeWS(symbol, (price, change24h) => {
      setCurrentPrice(price);
      setPriceChange24h(change24h);
    });
    return unsub;
  }, [symbol]);

  return { candles, currentPrice, priceChange24h, loading, error };
}
