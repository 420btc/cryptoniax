'use client';

// ─── Browser Notifications ──────────────────────────────────

let notified = false;

export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function notifyTradeClosed(symbol: string, pnl: number, side: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  const isWin = pnl > 0;
  const emoji = isWin ? '🏆' : '💀';
  const verb = isWin ? 'ganado' : 'perdido';
  new Notification(`${emoji} Trade cerrado: ${symbol}`, {
    body: `${side === 'long' ? '▲ Long' : '▼ Short'} ${verb}: ${pnl >= 0 ? '+' : ''}$${Math.abs(pnl).toFixed(2)}`,
    icon: '/favicon.ico',
    tag: 'trade-closed',
    silent: false,
  });
}

export function notifyTradeOpened(symbol: string, side: string, amount: number) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(`📊 Trade abierto: ${symbol}`, {
    body: `${side === 'long' ? '▲ Long' : '▼ Short'} · $${amount.toFixed(2)}`,
    icon: '/favicon.ico',
    tag: 'trade-opened',
    silent: true,
  });
}

export function notifyLevelUp(level: number) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(`⬆️ ¡Nivel ${level}!`, {
    body: `Has subido a nivel ${level}. ${level >= 10 ? '¡Impresionante!' : level >= 5 ? '¡Bien hecho!' : '¡Sigue tradeando!'}`,
    icon: '/favicon.ico',
    tag: 'level-up',
  });
}

export function notifyFaucet(amount: number) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification('🪙 Faucet reclamado', {
    body: `+$${amount} monedas añadidas a tu saldo`,
    icon: '/favicon.ico',
    tag: 'faucet',
    silent: true,
  });
}
