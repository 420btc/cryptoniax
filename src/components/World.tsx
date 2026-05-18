'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { EXCHANGE_THEMES } from '@/types';
import * as PIXI from 'pixi.js';

// Map house style to sprite file
const HOUSE_SPRITES: Record<string, string> = {
  tent: '/sprites/house_tent.png',
  wood_house: '/sprites/house_wood.png',
  stone_house: '/sprites/house_stone.png',
  mansion: '/sprites/house_mansion.png',
  castle: '/sprites/house_castle.png',
};

// Map exchange + type to character sprite
function charSprite(exchange: string, type: string): string {
  return `/sprites/${exchange}_${type}.png`;
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

  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    const app = new PIXI.Application({
      width: canvasRef.current.clientWidth,
      height: 600,
      backgroundColor: 0x05050f,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    canvasRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;
    setWorldReady(true);

    // Load background
    const loadBg = async () => {
      const texture = await PIXI.Assets.load('/sprites/world_background.png');
      const bg = new PIXI.Sprite(texture);
      bg.width = app.screen.width;
      bg.height = 600;
      bg.alpha = 0.85;
      app.stage.addChildAt(bg, 0);
      bgRef.current = bg;
    };
    loadBg();

    const handleResize = () => {
      if (canvasRef.current) {
        app.renderer.resize(canvasRef.current.clientWidth, 600);
        if (bgRef.current) {
          bgRef.current.width = app.screen.width;
        }
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  // Draw house sprite
  useEffect(() => {
    if (!appRef.current || !house || !worldReady) return;
    const app = appRef.current;

    // Remove old
    if (houseSpriteRef.current) {
      app.stage.removeChild(houseSpriteRef.current);
      houseSpriteRef.current = null;
    }

    const spriteFile = HOUSE_SPRITES[house.style] || HOUSE_SPRITES.tent;
    const loadHouse = async () => {
      try {
        const texture = await PIXI.Assets.load(spriteFile);
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 0.8);
        sprite.x = app.screen.width / 2;
        sprite.y = app.screen.height * 0.72;
        sprite.scale.set(2);
        app.stage.addChild(sprite);
        houseSpriteRef.current = sprite;

        // Level label
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
        label.y = app.screen.height * 0.72 + sprite.height * 1.5;
        label.name = 'house_label';
        app.stage.addChild(label);
      } catch (e) {
        console.warn('Failed to load house sprite:', e);
      }
    };
    loadHouse();
  }, [house, worldReady]);

  // Draw character sprites
  useEffect(() => {
    if (!appRef.current || !worldReady) return;
    const app = appRef.current;

    // Remove old
    charSpritesRef.current.forEach(s => app.stage.removeChild(s));
    charSpritesRef.current = [];
    // Also remove old labels
    const oldLabels = app.stage.children.filter(c => c.name === 'char_label');
    oldLabels.forEach(c => app.stage.removeChild(c));

    activeTrades.forEach(async (trade: any, i: number) => {
      const type = trade.type === 'futures' ? 'warrior' : 'merchant';
      const spriteFile = charSprite(trade.exchange, type);
      const theme = EXCHANGE_THEMES[(trade.exchange as keyof typeof EXCHANGE_THEMES)] || EXCHANGE_THEMES.other;

      try {
        const texture = await PIXI.Assets.load(spriteFile);
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 0.8);
        sprite.x = 100 + i * 100;
        sprite.y = app.screen.height - 100;
        sprite.scale.set(2);
        app.stage.addChild(sprite);
        charSpritesRef.current.push(sprite);

        // Label
        const label = new PIXI.Text(
          `${trade.symbol} ${trade.side === 'long' ? '▲' : '▼'} ${trade.type === 'futures' ? trade.leverage + 'x' : 'Spot'}`,
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
        label.y = sprite.y + 40;
        label.name = 'char_label';
        app.stage.addChild(label);
      } catch (e) {
        // Fallback: draw simple shape
        const g = new PIXI.Graphics();
        g.beginFill(parseInt(theme.color.slice(1), 16));
        g.drawRoundedRect(0, 0, 24, 28, 3);
        g.endFill();
        g.x = 88 + i * 100;
        g.y = app.screen.height - 116;
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
      // Frames for walking animation
      charSpritesRef.current.forEach((s, i) => {
        if (s instanceof PIXI.Sprite && s.texture) {
          s.y = app.screen.height - 100 + Math.sin(elapsed + i) * 3;
        }
      });
    };
    app.ticker.add(ticker);
    return () => { app.ticker.remove(ticker); };
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
      <div ref={canvasRef} className="w-full" style={{ height: 600 }} />
    </div>
  );
}
