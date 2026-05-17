'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { EXCHANGE_THEMES } from '@/types';
import * as PIXI from 'pixi.js';

export default function WorldCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const { profile } = useAuthStore();
  const { holdings, activeTrades, closedTrades, house } = usePortfolioStore();
  const [worldReady, setWorldReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    const app = new PIXI.Application({
      width: canvasRef.current.clientWidth,
      height: 600,
      backgroundColor: 0x0a0a1a,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    canvasRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;
    setWorldReady(true);

    // Draw ground
    const ground = new PIXI.Graphics();
    ground.beginFill(0x1a1a3a);
    ground.drawRect(0, 0, app.screen.width, app.screen.height);
    ground.endFill();

    // Grid pattern
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0x2a2a5a, 0.3);
    for (let x = 0; x < app.screen.width; x += 64) {
      grid.moveTo(x, 0);
      grid.lineTo(x, app.screen.height);
    }
    for (let y = 0; y < app.screen.height; y += 64) {
      grid.moveTo(0, y);
      grid.lineTo(app.screen.width, y);
    }
    app.stage.addChild(ground);
    app.stage.addChild(grid);

    const handleResize = () => {
      if (canvasRef.current) {
        app.renderer.resize(canvasRef.current.clientWidth, 600);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  // Draw house based on holdings
  useEffect(() => {
    if (!appRef.current || !house) return;
    const app = appRef.current;

    // Remove old house if exists
    const oldHouse = app.stage.getChildByName('house_container');
    if (oldHouse) app.stage.removeChild(oldHouse);

    const container = new PIXI.Container();
    container.name = 'house_container';

    const x = app.screen.width / 2 - 64;
    const y = app.screen.height / 2 - 32;

    // House body based on level
    const body = new PIXI.Graphics();
    const colors: Record<string, number> = {
      tent: 0x8B5CF6,
      wood_house: 0xA0522D,
      stone_house: 0x808080,
      mansion: 0x4A90D9,
      castle: 0x7C3AED,
    };
    const bodyColor = colors[house.style] || 0x7C3AED;

    if (house.style === 'tent') {
      // Triangle tent
      body.beginFill(bodyColor);
      body.moveTo(x + 32, y);
      body.lineTo(x + 64, y + 40);
      body.lineTo(x, y + 40);
      body.closePath();
      body.endFill();
    } else {
      // Rectangle house
      const w = house.size;
      const h = house.size * 0.7;
      body.beginFill(bodyColor);
      body.drawRoundedRect(x, y, w, h, 4);
      body.endFill();

      // Roof
      const roof = new PIXI.Graphics();
      roof.beginFill(0x2d1b69, 1);
      roof.moveTo(x - 8, y);
      roof.lineTo(x + w / 2, y - h * 0.4);
      roof.lineTo(x + w + 8, y);
      roof.closePath();
      roof.endFill();
      container.addChild(roof);

      // Door
      const door = new PIXI.Graphics();
      door.beginFill(0x4a3728);
      door.drawRect(x + w * 0.38, y + h * 0.55, w * 0.24, h * 0.45);
      door.endFill();
      container.addChild(door);

      // Windows
      const window = new PIXI.Graphics();
      window.beginFill(0x00E6FF, 0.6);
      window.drawRect(x + w * 0.1, y + h * 0.2, w * 0.2, h * 0.2);
      window.drawRect(x + w * 0.7, y + h * 0.2, w * 0.2, h * 0.2);
      window.endFill();
      container.addChild(window);

      // Level indicator
      const levelText = new PIXI.Text(`Lv.${house.level}`, {
        fontFamily: 'monospace',
        fontSize: 10,
        fill: 0xF0B90B,
      });
      levelText.x = x + w / 2 - 14;
      levelText.y = y + h + 4;
      container.addChild(levelText);
    }

    container.addChild(body);
    app.stage.addChild(container);
  }, [house]);

  // Draw characters for active trades
  useEffect(() => {
    if (!appRef.current || !activeTrades) return;
    const app = appRef.current;

    // Remove old characters
    const oldChars = app.stage.getChildByName('characters_container');
    if (oldChars) app.stage.removeChild(oldChars);

    const container = new PIXI.Container();
    container.name = 'characters_container';

    activeTrades.forEach((trade, i) => {
      const theme = EXCHANGE_THEMES[trade.exchange];
      const color = parseInt(theme.color.slice(1), 16);
      const x = 80 + i * 100;
      const y = app.screen.height - 120;

      const char = new PIXI.Graphics();

      // Body
      char.beginFill(color);
      char.drawRoundedRect(x, y, 24, 32, 4);
      char.endFill();

      // Head
      char.beginFill(0xFFD700);
      char.drawCircle(x + 12, y - 8, 10);
      char.endFill();

      // Exchange insignia
      const insig = new PIXI.Text(theme.insignia, {
        fontFamily: 'monospace',
        fontSize: 14,
      });
      insig.x = x + 4;
      insig.y = y - 14;

      // Trade info
      const info = new PIXI.Text(
        `${trade.symbol}\n${trade.side === 'long' ? '▲' : '▼'} ${trade.type === 'futures' ? trade.leverage + 'x' : 'Spot'}`,
        { fontFamily: 'monospace', fontSize: 8, fill: 0x8888aa, align: 'center' }
      );
      info.x = x - 4;
      info.y = y + 36;

      container.addChild(char);
      container.addChild(insig);
      container.addChild(info);
    });

    app.stage.addChild(container);
  }, [activeTrades]);

  // Animate
  useEffect(() => {
    if (!appRef.current) return;
    const app = appRef.current;

    let elapsed = 0;
    const ticker = () => {
      elapsed += 0.02;
      const houses = app.stage.getChildByName('house_container');
      if (houses) {
        houses.y = Math.sin(elapsed) * 2;
      }
    };
    app.ticker.add(ticker);

    return () => {
      app.ticker.remove(ticker);
    };
  }, [worldReady]);

  return (
    <div className="bg-[#12122a] rounded-2xl pixel-border overflow-hidden">
      <div className="p-3 border-b border-[#2a2a5a] flex items-center gap-2">
        <span className="text-sm font-pixel text-[#F0B90B]">🌍 MUNDO</span>
        <span className="text-[#8888aa] text-xs ml-auto">HodlVille — Las casas crecen con tus HODLs</span>
      </div>
      <div ref={canvasRef} className="w-full" style={{ height: 600 }} />
    </div>
  );
}
