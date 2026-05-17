import { Trade, Character, House, ExchangeType, TradeType, EXCHANGE_THEMES } from '@/types';

// ========== XP & LEVELS ==========

export function calcTradeXp(trade: {
  amount: number;
  leverage: number;
  pnl: number;
}): number {
  const baseXp = trade.amount * trade.leverage * 0.1;
  const bonusXp = trade.pnl > 0 ? trade.pnl * 10 : 0;
  return Math.floor(Math.max(1, baseXp + bonusXp));
}

export function getLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getNextLevelXp(level: number): number {
  return level * level * 100;
}

// ========== CHARACTER STATS ==========

export function calcCharacterStats(
  level: number,
  tradeType: TradeType,
  exchange: ExchangeType,
  lastPnl: number
): { hp: number; maxHp: number; attack: number; defense: number } {
  const base = tradeType === 'futures' ? 1.5 : 1.0; // Futures chars are stronger
  const exchangeBonus = exchange === 'hyperliquid' ? 1.2 : exchange === 'bingx' ? 1.1 : 1.0;

  const hp = Math.floor(100 * base * exchangeBonus * (1 + level * 0.2));
  const maxHp = hp;
  const attack = Math.floor(10 * base * exchangeBonus * (1 + level * 0.3));
  const defense = Math.floor(5 * base * exchangeBonus * (1 + level * 0.25));

  // PnL affects current HP
  const hpModifier = lastPnl > 0 ? 0 : Math.min(Math.abs(lastPnl) * 5, maxHp * 0.8);

  return {
    hp: lastPnl >= 0 ? hp : Math.max(1, hp - hpModifier),
    maxHp,
    attack: lastPnl >= 0 ? attack : Math.max(1, attack - Math.floor(Math.abs(lastPnl) * 2)),
    defense: lastPnl >= 0 ? defense : Math.max(0, defense - Math.floor(Math.abs(lastPnl) * 1)),
  };
}

export function createCharacter(
  tradeId: string,
  userId: string,
  tradeType: TradeType,
  exchange: ExchangeType,
  pnl: number
): Character {
  const theme = EXCHANGE_THEMES[exchange];
  const level = 1;
  const xp = 0;
  const stats = calcCharacterStats(level, tradeType, exchange, pnl);

  return {
    id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    user_id: userId,
    trade_id: tradeId,
    type: tradeType,
    exchange,
    level,
    xp,
    hp: stats.hp,
    max_hp: stats.maxHp,
    attack: stats.attack,
    defense: stats.defense,
    color: theme.color,
    insignia: theme.insignia,
    is_active: true,
  };
}

export function levelUpCharacter(char: Character, tradePnl: number): Character {
  const gainXp = calcTradeXp({ amount: 100, leverage: 1, pnl: tradePnl });
  const newXp = char.xp + gainXp;
  const newLevel = getLevel(newXp);
  const stats = calcCharacterStats(newLevel, char.type, char.exchange, tradePnl);

  return {
    ...char,
    xp: newXp,
    level: newLevel,
    hp: stats.hp,
    max_hp: stats.maxHp,
    attack: stats.attack,
    defense: stats.defense,
  };
}

export function loseCharacterStats(char: Character, tradePnl: number): Character {
  const penaltyXp = Math.floor(Math.abs(tradePnl) * 15);
  const newXp = Math.max(0, char.xp - penaltyXp);
  const newLevel = Math.max(1, getLevel(newXp));
  const stats = calcCharacterStats(newLevel, char.type, char.exchange, tradePnl);

  return {
    ...char,
    xp: newXp,
    level: newLevel,
    hp: Math.max(1, stats.hp),
    max_hp: stats.maxHp,
    attack: Math.max(1, stats.attack),
    defense: Math.max(0, stats.defense),
  };
}

// ========== HOUSE LEVELS ==========

export function calcHouseLevel(holdings: { symbol: string; amount: number }[]): number {
  let score = 0;
  for (const h of holdings) {
    const multiplier = h.symbol === 'BTC' ? 1.0 : h.symbol === 'ETH' ? 0.8 : 0.6;
    score += h.amount * multiplier;
  }
  return Math.min(20, Math.floor(score / 10) + 1);
}

export function getHouseStyle(level: number): string {
  if (level >= 15) return 'castle';
  if (level >= 10) return 'mansion';
  if (level >= 5) return 'stone_house';
  if (level >= 2) return 'wood_house';
  return 'tent';
}

export function createHouse(userId: string, holdings: { symbol: string; amount: number }[]): House {
  const level = calcHouseLevel(holdings);
  return {
    id: `house_${userId}`,
    user_id: userId,
    level,
    style: getHouseStyle(level),
    size: 32 + level * 4,
    decorations: level >= 5 ? ['garden'] : level >= 10 ? ['garden', 'fence'] : [],
    x: Math.floor(Math.random() * 800),
    y: Math.floor(Math.random() * 600),
  };
}

// ========== INITIAL COINS ==========

export function getInitialCoins(): number {
  return 10000; // 10k monedas virtuales para empezar
}

// ========== FEES ==========

export function calcFee(amount: number): number {
  return amount * 0.001; // 0.1% fee como un exchange real
}
