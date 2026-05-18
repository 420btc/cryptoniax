'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuthStore } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GameState {
  playerName: string;
  coins: number;
  level: number;
  xp: number;
  winRate: number;
  activeTrades: Array<{
    symbol: string;
    side: 'long' | 'short';
    type: 'spot' | 'futures';
    exchange: string;
    leverage: number;
    entryPrice: number;
    pnl: number;
    amount: number;
  }>;
  closedTradesCount: number;
  houseLevel: number;
  houseStyle: string;
  holdings: Record<string, number>;
  battleStats: {
    battlesToday: number;
    winRate: number;
    streak: string;
    xpGained: number;
  };
}

function buildGameState(): GameState {
  const { profile } = useAuthStore.getState();
  const { coins, level, xp, activeTrades, closedTrades, house, holdings } =
    usePortfolioStore.getState();

  const winRate =
    closedTrades.length > 0
      ? Math.round(
          (closedTrades.filter((t) => (t.pnl || 0) > 0).length /
            closedTrades.length) *
            100
        )
      : 0;

  // Battle stats from portfolio
  const wonToday = closedTrades.filter((t) => {
    const isToday =
      t.closed_at &&
      new Date(t.closed_at).toDateString() === new Date().toDateString();
    return isToday && (t.pnl || 0) > 0;
  }).length;
  const lostToday = closedTrades.filter((t) => {
    const isToday =
      t.closed_at &&
      new Date(t.closed_at).toDateString() === new Date().toDateString();
    return isToday && (t.pnl || 0) <= 0;
  }).length;
  const battlesToday = wonToday + lostToday;

  // Streak
  let streak = '-';
  if (closedTrades.length > 0) {
    let w = 0;
    let l = 0;
    for (let i = closedTrades.length - 1; i >= 0; i--) {
      if ((closedTrades[i].pnl || 0) > 0) {
        w++;
        if (l > 0) break;
      } else {
        l++;
        if (w > 0) break;
      }
    }
    streak = w > l ? `W${w}` : l > w ? `L${l}` : '-';
  }

  // XP gained today
  const xpToday = closedTrades
    .filter((t) => t.closed_at && new Date(t.closed_at).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + Math.floor((t.pnl || 0) * 10), 0);

  return {
    playerName: profile?.email?.split('@')[0] || 'Aventurero',
    coins,
    level,
    xp,
    winRate,
    activeTrades: activeTrades.map((t) => ({
      symbol: t.symbol,
      side: t.side,
      type: t.type,
      exchange: t.exchange,
      leverage: t.leverage,
      entryPrice: t.entry_price,
      pnl: t.pnl || 0,
      amount: t.amount,
    })),
    closedTradesCount: closedTrades.length,
    houseLevel: house?.level || 1,
    houseStyle: house?.style || 'tent',
    holdings,
    battleStats: {
      battlesToday,
      winRate: battlesToday > 0 ? Math.round((wonToday / battlesToday) * 100) : 0,
      streak,
      xpGained: xpToday,
    },
  };
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        '¡Bienvenido a HodlVille, aventurero! 🏰 Soy tu guía IA. Pregúntame sobre tus trades, estrategias, o cómo hacer crecer tu reino.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const gameState = buildGameState();

      // Only send recent messages (last 10) to save tokens
      const recentMessages = [...messages, userMsg].slice(-10);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: recentMessages,
          gameState,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply },
        ]);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              '⚠️ Mi conexión con el oráculo falló. ¿Puedes intentarlo de nuevo?',
          },
        ]);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '⚠️ Las runas están revueltas... inténtalo otra vez, aventurero.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content:
          '¡Chat reiniciado! ¿En qué puedo ayudarte, constructor de reinos? 🏡',
      },
    ]);
  }, []);

  return { messages, isLoading, sendMessage, clearChat };
}
