'use client';

import { create } from 'zustand';
import { Trade, House, Character, ExchangeType, TradeType, TradeSide, CryptoSymbol, TradeStatus } from '@/types';
import { createCharacter, createHouse, getInitialCoins, calcTradeXp, HOUSE_LEVELS } from '@/lib/gameLogic';
import {
  supabase,
  fetchProfile, updateProfile,
  fetchHoldings, updateHolding,
  fetchActiveTrades, fetchClosedTrades, createTrade, closeTrade,
  fetchHouse, upgradeHouse,
  subscribeToTrades, subscribeToHoldings,
} from '@/lib/supabase';

interface PortfolioState {
  userId: string | null;
  coins: number;
  xp: number;
  level: number;
  holdings: Record<string, number>;
  activeTrades: Trade[];
  closedTrades: Trade[];
  trades: Trade[];
  house: House | null;

  // Actions
  initUser: (userId: string) => void;
  initFromSupabase: (userId: string) => Promise<void>;
  fetchAll: (userId: string) => Promise<void>;
  openTrade: (params: {
    symbol: CryptSymbol;
    type: TradeType;
    side: TradeSide;
    exchange: ExchangeType;
    entryPrice: number;
    amount: number;
    leverage: number;
    tpPrice?: number;
    slPrice?: number;
  }) => Promise<void>;
  checkTradeLimits: (symbol: string, currentPrice: number) => void;
  syncFromDb: (data: any) => void;
}

type CryptSymbol = CryptoSymbol;

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  userId: null,
  coins: 10,
  xp: 0,
  level: 1,
  holdings: { BTC: 0, ETH: 0, SOL: 0 },
  activeTrades: [],
  closedTrades: [],
  house: createHouse('local', []),
  trades: [] as Trade[],

  initUser: (userId: string) => {
    get().initFromSupabase(userId);
  },

  initFromSupabase: async (userId: string) => {
    await get().fetchAll(userId);

    // Subscribe to realtime changes
    subscribeToTrades(userId, () => get().fetchAll(userId));
    subscribeToHoldings(userId, () => get().fetchAll(userId));
  },

  fetchAll: async (userId: string) => {
    try {
      const [profile, holdings, activeTradesData, closedTradesData, houseData] = await Promise.all([
        fetchProfile(userId),
        fetchHoldings(userId),
        fetchActiveTrades(userId),
        fetchClosedTrades(userId),
        fetchHouse(userId),
      ]);

      const holdingMap: Record<string, number> = { BTC: 0, ETH: 0, SOL: 0 };
      (holdings || []).forEach((h: any) => { holdingMap[h.symbol] = Number(h.amount || 0); });

      const activeTrades = (activeTradesData || []).map((t: any) => ({
        ...t,
        entry_price: Number(t.entry_price),
        amount: Number(t.amount),
        pnl: Number(t.pnl || 0),
        leverage: Number(t.leverage || 1),
        tp_price: t.tp_price ? Number(t.tp_price) : undefined,
        sl_price: t.sl_price ? Number(t.sl_price) : undefined,
        entry_fees: Number(t.entry_fees || 0),
      }));

      const closedTrades = (closedTradesData || []).map((t: any) => ({
        ...t,
        pnl: Number(t.pnl || 0),
        amount: Number(t.amount),
      }));

      set({
        userId,
        coins: Number(profile?.coins || 10),
        xp: profile?.xp || 0,
        level: profile?.level || 1,
        holdings: holdingMap,
        activeTrades,
        closedTrades,
        house: createHouse(houseData?.level || 1, houseData?.style || 'tent'),
      });
    } catch (e) {
      console.warn('Failed to fetch from Supabase, using local state:', e);
    }
  },

  openTrade: async (params) => {
    const state = get();
    const userId = state.userId;
    const fees = params.amount * 0.0007 * 2; // BingX taker fee

    if (params.amount > state.coins) return;
    if (params.amount <= 0) return;

    // Deduct coins
    const newCoins = state.coins - params.amount;

    if (userId) {
      try {
        const trade = await createTrade({
          user_id: userId,
          symbol: params.symbol,
          type: params.type,
          side: params.side,
          exchange: params.exchange,
          entry_price: params.entryPrice,
          amount: params.amount,
          leverage: params.leverage,
          tp_price: params.tpPrice,
          sl_price: params.slPrice,
          entry_fees: fees,
        });

        // Check if house needs upgrade
        const newTotalHoldings = Object.values(state.holdings).reduce((a, b) => a + b, 0) + newCoins;
        const newHouseLevel = calcHouseLevel(newTotalHoldings);

        await Promise.all([
          updateProfile(userId, { coins: newCoins }),
          upgradeHouse(userId, newHouseLevel.style, newHouseLevel.level),
        ]);

        await get().fetchAll(userId);
      } catch (e) {
        console.error('Failed to create trade:', e);
      }
    } else {
      // Local mode
      const tradeId = 'trade_' + Date.now();
      const newHouse = createHouse('local', [{ symbol: params.symbol, amount: newCoins }]);

      const trade: Trade = {
        id: tradeId,
        user_id: 'local',
        symbol: params.symbol,
        type: params.type,
        side: params.side,
        exchange: params.exchange,
        entry_price: params.entryPrice,
        amount: params.amount,
        leverage: params.leverage,
        status: 'open',
        pnl: 0,
        tp_price: params.tpPrice,
        sl_price: params.slPrice,
        entry_fees: fees,
        opened_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        _tp_extended: false, _wc_extended: false,
        _eff_locked: false, _t60_extension: 0,
      };

      set({
        coins: newCoins,
        activeTrades: [...state.activeTrades, trade],
        house: newHouse,
      });
    }
  },

  checkTradeLimits: (symbol, currentPrice) => {
    const state = get();
    for (const trade of state.activeTrades) {
      if (trade.symbol !== symbol) continue;
      const pnl = trade.side === 'long'
        ? (currentPrice - trade.entry_price) * trade.amount * trade.leverage
        : (trade.entry_price - currentPrice) * trade.amount * trade.leverage;
      const currentPnl = trade.pnl ?? 0;

      // Check TP
      if (trade.tp_price) {
        const hit = trade.side === 'long' ? currentPrice >= trade.tp_price : currentPrice <= trade.tp_price;
        if (hit) {
          if (state.userId) {
            closeTrade(trade.id, pnl).then(() => get().fetchAll(state.userId!));
          } else {
            // Local close
            const updated = state.activeTrades.map(t =>
            (t.id === trade.id ? { ...t, status: 'closed' as TradeStatus, pnl, closed_at: new Date().toISOString() } : t)
            );
            set({
              activeTrades: updated.filter(t => t.status !== 'closed'),
              closedTrades: [...state.closedTrades, ...updated.filter(t => t.id === trade.id)],
              coins: state.coins + pnl,
            });
          }
          continue;
        }
      }

      // Check SL
      if (trade.sl_price) {
        const hit = trade.side === 'long' ? currentPrice <= trade.sl_price : currentPrice >= trade.sl_price;
        if (hit) {
          if (state.userId) {
            closeTrade(trade.id, pnl).then(() => get().fetchAll(state.userId!));
          } else {
            const updated = state.activeTrades.map(t =>
            (t.id === trade.id ? { ...t, status: 'closed' as TradeStatus, pnl, closed_at: new Date().toISOString() } : t)
            );
            set({
              activeTrades: updated.filter(t => t.status !== 'closed'),
              closedTrades: [...state.closedTrades, ...updated.filter(t => t.id === trade.id)],
              coins: state.coins + pnl,
            });
          }
        }
      }
    }
  },

  syncFromDb: (data: any) => {
    // Called by realtime subscription
    get().fetchAll(get().userId!);
  },
}));

const calcHouseLevel = (totalHoldings: number) => {
  let level = 1;
  let style = 'tent';
  for (const [lvl, info] of Object.entries(HOUSE_LEVELS)) {
    if (totalHoldings >= (info.min || 0)) {
      level = Number(lvl);
      style = info.style;
    }
  }
  return { level, style };
};
