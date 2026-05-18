'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { EXCHANGE_THEMES } from '@/types';
import * as PIXI from 'pixi.js';

// ── V2 Sprite Paths (gpt-image-2, 1024px, multi-level) ──
const SPRITES_V2 = '/sprites/v2';

function houseSpritePath(style: string, level: number): string {
  return `${SPRITES_V2}/house_${style}_lv${level}.png`;
}

function charSpritePath(exchange: string, type: string, level: number): string {
  return `${SPRITES_V2}/hero_${exchange}_${type}_lv${level}.png`;
}

function bgPath(variant: number): string {
  return `${SPRITES_V2}/bg_${variant}.png`;
}

function bossPath(exchange: string): string {
  return `${SPRITES_V2}/boss_${exchange}.png`;
}

export default function WorldCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const { profile } = useAuthStore();
  const { holdings, activeTrades, closedTrades, house, level, coins } = usePortfolioStore();
  const [worldReady, setWorldReady] = useState(false);
  const bgRef = useRef<PIXI.Sprite | null>(null);
  const houseSpriteRef = useRef<PIXI.Sprite | null>(null);
  const charSpritesRef = useRef<PIXI.Sprite[]>([]);

  // Character level from trade count/P&L
  const getCharLevel = (trade: any): number => {
    const wins = closedTrades.filter(t => t.symbol === trade.symbol && (t.pnl || 0) > 0).length;
    if (wins >= 20) return 5;
    if (wins >= 12) return 4;
    if (wins >= 6) return 3;
    if (wins >= 2) return 2;
    return 1;
  };

  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    const app = new PIXI.Application({
      width: canvasRef.current.clientWidth,
      height: 700, // Bigger canvas for larger sprites
      backgroundColor: 0x05050f,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    canvasRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;
    setWorldReady(true);

    // Load background (try v2 first, fallback to old)
    const loadBg = async () => {
      try {
        const texture = await PIXI.Assets.load(bgPath(1));
        const bg = new PIXI.Sprite(texture);
        bg.width = app.screen.width;
        bg.height = 700;
        bg.alpha = 0.85;
        app.stage.addChildAt(bg, 0);
        bgRef.current = bg;
      } catch {
        try {
          const texture = await PIXI.Assets.load('/sprites/world_background.png');
          const bg = new PIXI.Sprite(texture);
          bg.width = app.screen.width;
          bg.height = 700;
          bg.alpha = 0.85;
          app.stage.addChildAt(bg, 0);
          bgRef.current = bg;
        } catch {}
      }
    };
    loadBg();

    const handleResize = () => {
      if (canvasRef.current) {
        app.renderer.resize(canvasRef.current.clientWidth, 700);
        if (bgRef.current) bgRef.current.width = app.screen.width;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  // Draw house
  useEffect(() => {
    if (!appRef.current || !house || !worldReady) return;
    const app = appRef.current;

    if (houseSpriteRef.current) {
      app.stage.removeChild(houseSpriteRef.current);
      houseSpriteRef.current = null;
    }

    const hLevel = Math.min(5, Math.ceil(house.level / 3)); // Map house level 1-15+ → sprite level 1-5
    const spriteFile = houseSpritePath(house.style, hLevel);

    const loadHouse = async () => {
      try {
        const texture = await PIXI.Assets.load(spriteFile);
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 0.8);
        sprite.x = app.screen.width / 2;
        sprite.y = app.screen.height * 0.72;
        sprite.scale.set(0.3); // Scale 1024px → ~307px display
        app.stage.addChild(sprite);
        houseSpriteRef.current = sprite;

        const label = new PIXI.Text(`Lv.${house.level}`, {
          fontFamily: 'Inter, sans-serif',
          fontSize: 12,
          fill: 0xF0B90B,
          fontWeight: 'bold',
          dropShadow: true,
          dropShadowColor: 0x000000,
          dropShadowBlur: 4,
        });
        label.anchor.set(0.5);
        label.x = app.screen.width / 2;
        label.y = app.screen.height * 0.72 + 100;
        label.name = 'house_label';
        app.stage.addChild(label);
      } catch {}
    };
    loadHouse();
  }, [house, worldReady]);

  // Draw characters
  useEffect(() => {
    if (!appRef.current || !worldReady) return;
    const app = appRef.current;

    charSpritesRef.current.forEach(s => app.stage.removeChild(s));
    charSpritesRef.current = [];
    const oldLabels = app.stage.children.filter(c => c.name === 'char_label');
    oldLabels.forEach(c => app.stage.removeChild(c));

    activeTrades.forEach(async (trade: any, i: number) => {
      const type = trade.type === 'futures' ? 'warrior' : 'merchant';
      const charLv = getCharLevel(trade);
      const spriteFile = charSpritePath(trade.exchange, type, charLv);
      const theme = EXCHANGE_THEMES[(trade.exchange as keyof typeof EXCHANGE_THEMES)] || EXCHANGE_THEMES.other;

      try {
        const texture = await PIXI.Assets.load(spriteFile);
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 0.8);
        sprite.x = 100 + i * 120;
        sprite.y = app.screen.height - 120;
        sprite.scale.set(0.25); // 1024px → ~256px display
        app.stage.addChild(sprite);
        charSpritesRef.current.push(sprite);

        const label = new PIXI.Text(
          `${trade.symbol} ${trade.side === 'long' ? '▲' : '▼'} Lv${charLv}`,
          {
            fontFamily: 'Inter, sans-serif',
            fontSize: 9,
            fill: 0x8888b0,
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 3,
          }
        );
        label.anchor.set(0.5, 0);
        label.x = sprite.x;
        label.y = sprite.y + 50;
        label.name = 'char_label';
        app.stage.addChild(label);
      } catch {
        // Fallback
        const g = new PIXI.Graphics();
        g.beginFill(parseInt(theme.color.slice(1), 16));
        g.drawRoundedRect(0, 0, 32, 40, 4);
        g.endFill();
        g.x = 84 + i * 120;
        g.y = app.screen.height - 130;
        app.stage.addChild(g);
        charSpritesRef.current.push(g as any);
      }
    });
  }, [activeTrades, worldReady]);

  // Animation
  useEffect(() => {
    if (!appRef.current) return;
    const app = appRef.current;
    let elapsed = 0;
    const ticker = () => {
      elapsed += 0.03;
      if (houseSpriteRef.current) {
        houseSpriteRef.current.y = app.screen.height * 0.72 + Math.sin(elapsed) * 4;
        houseSpriteRef.current.rotation = Math.sin(elapsed * 0.5) * 0.02;
      }
      charSpritesRef.current.forEach((s, i) => {
        if (s instanceof PIXI.Sprite && s.texture) {
          s.y = app.screen.height - 120 + Math.sin(elapsed + i) * 3;
        }
      });
    };
    app.ticker.add(ticker);
    return () => { 
      if (appRef.current?.ticker) {
        appRef.current.ticker.remove(ticker); 
      }
    };
  }, [worldReady]);

  return (
    <div className="glass-card !p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(99,102,241,0.08)]">
        <span className="text-sm font-bold text-white">🌍 HodlVille</span>
        <div className="flex items-center gap-3 text-[10px] text-[#5c5c80]">
          <span>👤 {profile?.email?.split('@')[0] || 'Trader'}</span>
          <span>🏠 Lv.{house?.level || 1}</span>
          <span>💰 ${coins.toFixed(0)}</span>
        </div>
      </div>
      <div ref={canvasRef} className="w-full" style={{ height: 700 }} />
    </div>
  );
}
