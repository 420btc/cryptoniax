import { NextRequest, NextResponse } from 'next/server';

// ── Types ──────────────────────────────────────────────

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

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ── System Prompt Builder ──────────────────────────────

function buildSystemPrompt(state: GameState): string {
  const hasTrades = state.activeTrades.length > 0;

  let prompt = `Eres **HodlVille AI**, un estratega de trading y guía del reino pixelado de HodlVille.

**Contexto del jugador:**
- Nombre: ${state.playerName}
- Nivel: ${state.level} (${state.xp} XP)
- Monedas: $${state.coins.toFixed(2)}
- Casa: ${state.houseStyle} nivel ${state.houseLevel}
- Win Rate general: ${state.winRate}%
- Trades cerrados totales: ${state.closedTradesCount}
- Holdings: ${Object.entries(state.holdings).map(([k, v]) => `${v} ${k}`).join(', ') || 'ninguno'}

**Batallas hoy:**
- Batallas: ${state.battleStats.battlesToday}
- Win Rate: ${state.battleStats.winRate}%
- Racha: ${state.battleStats.streak}
- XP ganado: +${state.battleStats.xpGained}

`;

  if (hasTrades) {
    prompt += `**Trades activos:**
${state.activeTrades.map(t =>
  `- ${t.symbol} ${t.side.toUpperCase()} ${t.type} x${t.leverage} en ${t.exchange} | Entrada: $${t.entryPrice} | P&L: ${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)} | Size: $${t.amount}`
).join('\n')}
`;
  } else {
    prompt += `**Trades activos:** Ninguno. ¡Anímale a abrir su primer trade!\n`;
  }

  prompt += `
**Tu rol:**
1. Eres un **mentor de trading** — analiza sus posiciones, sugiere estrategias, dale consejos sobre riesgo/beneficio
2. Eres un **guía del juego** — explícale cómo subir de nivel, ganar XP, mejorar su casa
3. Eres **temático** — habla con términos de HodlVille: "tu castillo crecerá", "tus guerreros necesitan entrenamiento", "el reino confía en ti"
4. Sé **motivador pero honesto** — celebra wins, aprende de losses
5. Responde en **español** con tono amigable y entusiasta, como un NPC de RPG
6. Máximo 3-4 frases por respuesta, ve al grano

**Reglas:**
- NO des consejos financieros reales — esto es un juego
- NO prometas ganancias ni predigas precios
- Si el jugador está en pérdidas, anímale a revisar su estrategia
- Mantén el lore de HodlVille: exchanges son facciones (BingX=Rayos, Hyperliquid=Olas, Bybit=Fuego, Uniswap=Unicornios)
`;

  return prompt;
}

// ── POST Handler ──────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, gameState } = body as {
      messages: ChatMessage[];
      gameState: GameState;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured on server' },
        { status: 500 }
      );
    }

    // Build dynamic system prompt from game state
    const systemPrompt = buildSystemPrompt(gameState || getDefaultGameState());

    // Prepare messages for OpenAI
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.filter((m) => m.role !== 'system').map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: apiMessages,
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI API error:', err);
      return NextResponse.json(
        { error: 'AI service unavailable' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '¡Hmm, mi bola de cristal está nublada! Pregúntame otra vez. 🏰';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDefaultGameState(): GameState {
  return {
    playerName: 'Aventurero',
    coins: 10000,
    level: 1,
    xp: 0,
    winRate: 0,
    activeTrades: [],
    closedTradesCount: 0,
    houseLevel: 1,
    houseStyle: 'tent',
    holdings: { BTC: 0, ETH: 0, SOL: 0 },
    battleStats: {
      battlesToday: 0,
      winRate: 0,
      streak: '-',
      xpGained: 0,
    },
  };
}
