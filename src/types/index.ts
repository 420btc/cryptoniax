export type ExchangeType = 'bingx' | 'hyperliquid' | 'bybit' | 'uniswap' | 'other';

export type TradeType = 'spot' | 'futures';

export type TradeSide = 'long' | 'short';

export type TradeStatus = 'open' | 'won' | 'lost' | 'closed';

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  metamask_address?: string;
  created_at: string;
  hodl_coins: number;
  house_level: number;
  house_style: string;
  xp: number;
  level: number;
}

export interface Holding {
  id: string;
  user_id: string;
  symbol: string;
  amount: number;
  acquired_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  type: TradeType;
  side: TradeSide;
  exchange: ExchangeType;
  entry_price: number;
  amount: number;
  leverage: number;
  pnl: number;
  status: TradeStatus;
  character_id: string | null;
  tp_price?: number;
  sl_price?: number;
  opened_at: string;
  closed_at?: string;
}

export interface Character {
  id: string;
  user_id: string;
  trade_id: string | null;
  type: TradeType;
  exchange: ExchangeType;
  level: number;
  xp: number;
  hp: number;
  max_hp: number;
  attack: number;
  defense: number;
  color: string;
  insignia: string;
  is_active: boolean;
}

export interface House {
  id: string;
  user_id: string;
  level: number;
  style: string;
  size: number;
  decorations: string[];
  x: number;
  y: number;
}

export interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
}

export const EXCHANGE_THEMES: Record<ExchangeType, { color: string; name: string; insignia: string }> = {
  bingx: { color: '#F0B90B', name: 'BingX', insignia: '⚡' },
  hyperliquid: { color: '#00E6FF', name: 'Hyperliquid', insignia: '🌊' },
  bybit: { color: '#F7A600', name: 'Bybit', insignia: '🔥' },
  uniswap: { color: '#FF007A', name: 'Uniswap', insignia: '🦄' },
  other: { color: '#8888aa', name: 'Other', insignia: '✦' },
};

export const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL'] as const;
export type CryptoSymbol = typeof CRYPTO_SYMBOLS[number];
