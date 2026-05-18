export interface Fighter {
  id: string;
  name: string;
  exchange: string;
  type: 'warrior' | 'merchant' | 'mage' | 'boss';
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  color: string;
  spritePath: string;
  spriteEmoji: string;
}

export const ENEMIES: Fighter[] = [
  { id: 'npc_1', name: 'Goblin Trader', exchange: 'Uniswap', type: 'merchant', level: 1, hp: 50, maxHp: 50, atk: 5, def: 2, color: '#ff007a', spritePath: '/sprites/v2/hero_uniswap_merchant_lv1.png', spriteEmoji: '👺' },
  { id: 'npc_2', name: 'Rekt Knight', exchange: 'Bybit', type: 'warrior', level: 2, hp: 80, maxHp: 80, atk: 8, def: 5, color: '#f7a600', spritePath: '/sprites/v2/hero_bybit_warrior_lv2.png', spriteEmoji: '🤕' },
  { id: 'npc_3', name: 'BingX Berserker', exchange: 'BingX', type: 'warrior', level: 3, hp: 120, maxHp: 120, atk: 12, def: 6, color: '#f0b90b', spritePath: '/sprites/v2/hero_bingx_warrior_lv3.png', spriteEmoji: '🪓' },
  { id: 'npc_4', name: 'Hyperliquid Mage', exchange: 'Hyperliquid', type: 'mage', level: 4, hp: 100, maxHp: 100, atk: 18, def: 4, color: '#00e6ff', spritePath: '/sprites/v2/hero_hyperliquid_mage_lv3.png', spriteEmoji: '🧙' },
  { id: 'npc_5', name: 'Uniswap Druid', exchange: 'Uniswap', type: 'mage', level: 5, hp: 150, maxHp: 150, atk: 15, def: 8, color: '#ff007a', spritePath: '/sprites/v2/hero_uniswap_druid_lv3.png', spriteEmoji: '🌿' },
  { id: 'npc_6', name: 'Bybit Commander', exchange: 'Bybit', type: 'warrior', level: 6, hp: 200, maxHp: 200, atk: 20, def: 12, color: '#f7a600', spritePath: '/sprites/v2/hero_bybit_warrior_lv5.png', spriteEmoji: '⚔️' },
  { id: 'npc_7', name: 'BingX Warlord', exchange: 'BingX', type: 'warrior', level: 7, hp: 250, maxHp: 250, atk: 25, def: 15, color: '#f0b90b', spritePath: '/sprites/v2/hero_bingx_warrior_lv5.png', spriteEmoji: '🛡️' },
  { id: 'npc_8', name: 'Hyperliquid Overlord', exchange: 'Hyperliquid', type: 'warrior', level: 8, hp: 300, maxHp: 300, atk: 30, def: 18, color: '#00e6ff', spritePath: '/sprites/v2/hero_hyperliquid_warrior_lv5.png', spriteEmoji: '👑' },
  { id: 'npc_9', name: 'Whale Guardian', exchange: 'Bybit', type: 'boss', level: 9, hp: 400, maxHp: 400, atk: 35, def: 20, color: '#f7a600', spritePath: '/sprites/v2/boss_bybit.png', spriteEmoji: '🐋' },
  { id: 'npc_10', name: 'Liquidator Prime', exchange: 'Hyperliquid', type: 'boss', level: 10, hp: 600, maxHp: 600, atk: 50, def: 25, color: '#00e6ff', spritePath: '/sprites/v2/boss_hyperliquid.png', spriteEmoji: '💀' },
];

export function calculateDamage(attacker: Fighter, defender: Fighter): { damage: number, isCrit: boolean } {
  const baseDamage = attacker.atk;
  const defense = defender.def;
  // Variación del 10%
  const variance = 0.9 + Math.random() * 0.2;
  // Critical hit 10% chance
  const isCrit = Math.random() < 0.1;
  const critMultiplier = isCrit ? 1.5 : 1;
  
  let dmg = Math.max(1, Math.floor((baseDamage * variance * critMultiplier) - (defense * 0.5)));
  return { damage: dmg, isCrit };
}

export function getBattleRewards(enemyLevel: number): { xp: number, coins: number } {
  return {
    xp: enemyLevel * 15,
    coins: enemyLevel * 5 + Math.floor(Math.random() * (enemyLevel * 3))
  };
}
