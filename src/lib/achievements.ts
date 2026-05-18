// Sistema de Logros - HodlVille
// Cada logro tiene: key, nombre, descripción, icono, progreso máximo

export interface Achievement {
  key: string;
  name: string;
  description: string;
  icon: string;
  maxProgress: number;
  category: 'trading' | 'housing' | 'battle' | 'collection' | 'social';
  reward?: { xp: number; coins: number };
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  // ── TRADING ──
  { key: 'first_trade', name: 'Primer Trade', description: 'Abre tu primer trade', icon: '📈', maxProgress: 1, category: 'trading', reward: { xp: 50, coins: 10 } },
  { key: 'ten_trades', name: 'Trader Novato', description: 'Completa 10 trades', icon: '📊', maxProgress: 10, category: 'trading', reward: { xp: 150, coins: 25 } },
  { key: 'fifty_trades', name: 'Trader Experto', description: 'Completa 50 trades', icon: '💹', maxProgress: 50, category: 'trading', reward: { xp: 500, coins: 100 } },
  { key: 'hundred_trades', name: 'Maestro del Mercado', description: 'Completa 100 trades', icon: '🏆', maxProgress: 100, category: 'trading', reward: { xp: 1000, coins: 250 } },
  { key: 'first_win', name: 'Primera Victoria', description: 'Cierra un trade en profit', icon: '✅', maxProgress: 1, category: 'trading', reward: { xp: 30, coins: 5 } },
  { key: 'streak_5', name: 'Racha de 5', description: '5 trades ganados seguidos', icon: '🔥', maxProgress: 5, category: 'trading', reward: { xp: 200, coins: 50 } },
  { key: 'streak_10', name: 'Imparable', description: '10 trades ganados seguidos', icon: '⚡', maxProgress: 10, category: 'trading', reward: { xp: 500, coins: 150 } },
  { key: 'big_win', name: 'Gran Victoria', description: 'Gana $100 en un solo trade', icon: '💰', maxProgress: 1, category: 'trading', reward: { xp: 300, coins: 75 } },
  { key: 'mega_win', name: 'Ballena', description: 'Gana $500 en un solo trade', icon: '🐋', maxProgress: 1, category: 'trading', reward: { xp: 1000, coins: 300 } },
  { key: 'profit_1000', name: 'Profit Milenario', description: 'Acumula $1,000 en profit total', icon: '👑', maxProgress: 1000, category: 'trading', reward: { xp: 500, coins: 100 } },

  // ── HOUSING ──
  { key: 'first_house', name: 'Primer Hogar', description: 'Construye tu primera casa (nivel 2)', icon: '🏕️', maxProgress: 1, category: 'housing', reward: { xp: 100, coins: 20 } },
  { key: 'mansion', name: 'Mansión', description: 'Alcanza una mansión (nivel 8)', icon: '🏛️', maxProgress: 1, category: 'housing', reward: { xp: 400, coins: 100 } },
  { key: 'castle', name: 'Castillo', description: 'Alcanza un castillo (nivel 16)', icon: '🏰', maxProgress: 1, category: 'housing', reward: { xp: 1000, coins: 300 } },
  { key: 'decorator', name: 'Decorador', description: 'Compra 5 decoraciones', icon: '✨', maxProgress: 5, category: 'housing', reward: { xp: 150, coins: 30 } },
  { key: 'vault_lv3', name: 'Bóveda Segura', description: 'Alcanza bóveda nivel 3 ($200 en holdings)', icon: '🔐', maxProgress: 1, category: 'housing', reward: { xp: 200, coins: 50 } },
  { key: 'vault_lv5', name: 'Fort Knox', description: 'Alcanza bóveda nivel 5 ($1000 en holdings)', icon: '💎', maxProgress: 1, category: 'housing', reward: { xp: 500, coins: 150 } },

  // ── BATTLE ──
  { key: 'first_battle', name: 'Primera Batalla', description: 'Completa tu primera batalla', icon: '⚔️', maxProgress: 1, category: 'battle', reward: { xp: 50, coins: 10 } },
  { key: 'battle_wins_10', name: 'Gladiador', description: 'Gana 10 batallas', icon: '🛡️', maxProgress: 10, category: 'battle', reward: { xp: 300, coins: 75 } },
  { key: 'level_5', name: 'Nivel 5', description: 'Alcanza nivel de personaje 5', icon: '⭐', maxProgress: 1, category: 'battle', reward: { xp: 250, coins: 50 } },
  { key: 'level_10', name: 'Leyenda', description: 'Alcanza nivel de personaje 10', icon: '🌟', maxProgress: 1, category: 'battle', reward: { xp: 750, coins: 200 } },

  // ── COLLECTION ──
  { key: 'collect_items_5', name: 'Coleccionista', description: 'Consigue 5 items de equipamiento', icon: '🗡️', maxProgress: 5, category: 'collection', reward: { xp: 100, coins: 25 } },
  { key: 'collect_items_15', name: 'Armero Real', description: 'Consigue 15 items de equipamiento', icon: '⚜️', maxProgress: 15, category: 'collection', reward: { xp: 400, coins: 100 } },
  { key: 'all_pets', name: 'Domador', description: 'Colecciona las 5 mascotas', icon: '🐾', maxProgress: 5, category: 'collection', reward: { xp: 500, coins: 150 } },
  { key: 'full_equip', name: 'Totalmente Equipado', description: 'Equipa items en todos los slots', icon: '🗿', maxProgress: 1, category: 'collection', reward: { xp: 300, coins: 75 } },

  // ── SOCIAL ──
  { key: 'chat_10', name: 'Sociable', description: 'Envía 10 mensajes en la taberna', icon: '💬', maxProgress: 10, category: 'social', reward: { xp: 100, coins: 20 } },
  { key: 'chat_50', name: 'Alma de la Taberna', description: 'Envía 50 mensajes en la taberna', icon: '🍻', maxProgress: 50, category: 'social', reward: { xp: 300, coins: 75 } },
  { key: 'daily_7', name: 'Constante', description: 'Juega 7 días seguidos', icon: '📅', maxProgress: 7, category: 'social', reward: { xp: 200, coins: 50 } },
];

// Chequear qué logros se pueden desbloquear basado en el estado del jugador
export function checkAchievements(
  state: {
    totalTrades: number;
    totalWins: number;
    currentStreak: number;
    maxWinAmount: number;
    totalProfit: number;
    houseLevel: number;
    decorations: number;
    vaultLevel: number;
    battlesWon: number;
    playerLevel: number;
    ownedItemCount: number;
    petCount: number;
    equippedSlots: number;
    chatMessages: number;
    loginStreak: number;
  },
  unlockedKeys: Set<string>
): Achievement[] {
  const newUnlocks: Achievement[] = [];

  for (const ach of ALL_ACHIEVEMENTS) {
    if (unlockedKeys.has(ach.key)) continue;

    let progress = 0;
    switch (ach.key) {
      case 'first_trade': progress = state.totalTrades; break;
      case 'ten_trades': progress = state.totalTrades; break;
      case 'fifty_trades': progress = state.totalTrades; break;
      case 'hundred_trades': progress = state.totalTrades; break;
      case 'first_win': progress = state.totalWins; break;
      case 'streak_5': progress = state.currentStreak; break;
      case 'streak_10': progress = state.currentStreak; break;
      case 'big_win': progress = state.maxWinAmount >= 100 ? 1 : 0; break;
      case 'mega_win': progress = state.maxWinAmount >= 500 ? 1 : 0; break;
      case 'profit_1000': progress = Math.min(state.totalProfit, 1000); break;
      case 'first_house': progress = state.houseLevel >= 2 ? 1 : 0; break;
      case 'mansion': progress = state.houseLevel >= 8 ? 1 : 0; break;
      case 'castle': progress = state.houseLevel >= 16 ? 1 : 0; break;
      case 'decorator': progress = state.decorations; break;
      case 'vault_lv3': progress = state.vaultLevel >= 3 ? 1 : 0; break;
      case 'vault_lv5': progress = state.vaultLevel >= 5 ? 1 : 0; break;
      case 'first_battle': progress = state.battlesWon; break;
      case 'battle_wins_10': progress = state.battlesWon; break;
      case 'level_5': progress = state.playerLevel >= 5 ? 1 : 0; break;
      case 'level_10': progress = state.playerLevel >= 10 ? 1 : 0; break;
      case 'collect_items_5': progress = state.ownedItemCount; break;
      case 'collect_items_15': progress = state.ownedItemCount; break;
      case 'all_pets': progress = state.petCount; break;
      case 'full_equip': progress = state.equippedSlots >= 9 ? 1 : 0; break;
      case 'chat_10': progress = state.chatMessages; break;
      case 'chat_50': progress = state.chatMessages; break;
      case 'daily_7': progress = state.loginStreak; break;
    }

    if (progress >= ach.maxProgress) {
      newUnlocks.push(ach);
    }
  }

  return newUnlocks;
}

export const ACHIEVEMENT_CATEGORIES: Record<string, { name: string; icon: string; color: string }> = {
  trading: { name: 'Trading', icon: '📈', color: '#f0b90b' },
  housing: { name: 'Hogar', icon: '🏠', color: '#22d65e' },
  battle: { name: 'Batalla', icon: '⚔️', color: '#ef4466' },
  collection: { name: 'Colección', icon: '💎', color: '#818cf8' },
  social: { name: 'Social', icon: '💬', color: '#f59e0b' },
};
