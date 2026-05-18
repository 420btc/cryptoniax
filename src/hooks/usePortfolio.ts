'use client';

import { create } from 'zustand';
import { Trade, House, Character, ExchangeType, TradeType, TradeSide, CryptoSymbol } from '@/types';
import { createCharacter, createHouse, getInitialCoins, calcFee, calcTradeXp, getLevel } from '@/lib/gameLogic';

interface PortfolioState {
  coins: number;
  holdings: { symbol: string; amount: number }[];
  trades: Trade[];
  activeTrades: Trade[];
  closedTrades: Trade[];
  characters: Character[];
  house: House | null;
  userId: string | null;
  xp: number;
  level: number;

  initUser: (userId: string) => void;
  openTrade: (params: {
    symbol: CryptoSymbol;
    type: TradeType;
    side: TradeSide;
    exchange: ExchangeType;
    entryPrice: number;
    amount: number;
    leverage: number;
  }) => void;
  closeTrade: (tradeId: string, exitPrice: number) => void;
  updateHoldings: (symbol: string, amount: number) => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  coins: getInitialCoins(),
  holdings: [],
  trades: [],
  activeTrades: [],
  closedTrades: [],
  characters: [],
  house: null,
  userId: null,
  xp: 0,
  level: 1,

  initUser: (userId) => {
    const holdings = [{ symbol: 'BTC', amount: 0.05 }, { symbol: 'ETH', amount: 0.5 }, { symbol: 'SOL', amount: 2 }];
    const house = createHouse(userId, holdings);
    set({ userId, holdings, house, coins: getInitialCoins(), xp: 0, level: 1 });
  },

  openTrade: (params) => {
    const state = get();
    if (params.amount > state.coins) return;

    const fee = calcFee(params.amount);
    const tradeId = `trade_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const character = createCharacter(tradeId, state.userId || '', params.type, params.exchange, 0);

    const trade: Trade = {
      id: tradeId,
      user_id: state.userId || '',
      symbol: params.symbol,
      type: params.type,
      side: params.side,
      exchange: params.exchange,
      entry_price: params.entryPrice,
      amount: params.amount,
      leverage: params.type === 'futures' ? params.leverage : 1,
      pnl: 0,
      status: 'open',
      character_id: character.id,
      opened_at: new Date().toISOString(),
    };

    set({
      coins: state.coins - params.amount - fee,
      trades: [...state.trades, trade],
      activeTrades: [...state.activeTrades, trade],
      characters: [...state.characters, character],
    });
  },

  closeTrade: (tradeId, exitPrice) => {
    const state = get();
    const trade = state.activeTrades.find(t => t.id === tradeId);
    if (!trade) return;

    const positionValue = trade.amount * trade.leverage;
    const rawPnl = trade.side === 'long'
      ? ((exitPrice - trade.entry_price) / trade.entry_price) * positionValue
      : ((trade.entry_price - exitPrice) / trade.entry_price) * positionValue;

    const fee = calcFee(trade.amount) * 2;
    const pnl = rawPnl - fee;
    const isWin = pnl > 0;

    const closedTrade: Trade = {
      ...trade,
      pnl,
      status: isWin ? 'won' : 'lost',
      closed_at: new Date().toISOString(),
    };

    // XP calculation
    const gainXp = calcTradeXp({ amount: trade.amount, leverage: trade.leverage, pnl });
    const newXp = state.xp + (isWin ? gainXp : Math.max(-gainXp, gainXp * -1.5));
    const positiveXp = Math.max(0, newXp);
    const newLevel = getLevel(positiveXp);

    // Character updates
    const updatedChars = state.characters.map((c: Character) => {
      if (c.id === trade.character_id) {
        const charGainXp = calcTradeXp({ amount: trade.amount, leverage: trade.leverage, pnl });
        const finalXp = Math.max(0, c.xp + (isWin ? charGainXp : -Math.floor(Math.abs(pnl) * 15)));
        return {
          ...c,
          xp: finalXp,
          level: getLevel(finalXp),
          is_active: !pnl,
          trade_id: null,
        };
      }
      return c;
    });

    // House update based on new holdings after trade result
    const newHoldings = [...state.holdings];
    const h = newHoldings.find(h => h.symbol === trade.symbol);
    if (h) {
      h.amount += pnl > 0 ? pnl * 0.001 : 0; // small amount for house
    }

    set({
      coins: state.coins + trade.amount + pnl,
      xp: positiveXp,
      level: newLevel,
      activeTrades: state.activeTrades.filter(t => t.id !== tradeId),
      closedTrades: [...state.closedTrades, closedTrade],
      trades: state.trades.map(t => t.id === tradeId ? closedTrade : t),
      characters: updatedChars,
      house: createHouse(state.userId || '', newHoldings),
    });
  },

  updateHoldings: (symbol, amount) => {
    const state = get();
    const existing = state.holdings.find(h => h.symbol === symbol);
    let newHoldings;
    if (existing) {
      newHoldings = state.holdings.map(h =>
        h.symbol === symbol ? { ...h, amount: h.amount + amount } : h
      );
    } else {
      newHoldings = [...state.holdings, { symbol, amount }];
    }
    const house = createHouse(state.userId || '', newHoldings);
    set({ holdings: newHoldings, house });
  },
}));
