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
  const { holdings, activeTrades, closedTrades, house, level, coins } = usePortfolioStore();
  const [worldReady, setWorldReady] = useState(false);

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

    // Stars
    for (let i = 0; i < 50; i++) {
      const star = new PIXI.Graphics();
      star.beginFill(0xffffff, Math.random() * 0.3 + 0.1);
      star.drawCircle(Math.random() * app.screen.width, Math.random() * app.screen.height, Math.random() * 1.5 + 0.5);
      star.endFill();
      app.stage.addChild(star);
    }

    // Ground
    const ground = new PIXI.Graphics();
    ground.beginFill(0x0a0b1e);
    ground.drawRect(0, app.screen.height * 0.55, app.screen.width, app.screen.height * 0.45);
    ground.endFill();
    app.stage.addChild(ground);

    // Grid
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0x6366f1, 0.06);
    for (let x = 0; x < app.screen.width; x += 48) {
      grid.moveTo(x, app.screen.height * 0.55);
      grid.lineTo(x, app.screen.height);
    }
    for (let y = app.screen.height * 0.55; y < app.screen.height; y += 48) {
      grid.moveTo(0, y);
      grid.lineTo(app.screen.width, y);
    }
    app.stage.addChild(grid);

    // Horizon glow
    const horizon = new PIXI.Graphics();
    horizon.beginFill(0x6366f1, 0.03);
    horizon.drawRect(0, app.screen.height * 0.5, app.screen.width, app.screen.height * 0.1);
    horizon.endFill();
    app.stage.addChild(horizon);

    const handleResize = () => {
      if (canvasRef.current) app.renderer.resize(canvasRef.current.clientWidth, 600);
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
    if (!appRef.current || !house) return;
    const app = appRef.current;

    const oldHouse = app.stage.getChildByName('house_container');
    if (oldHouse) app.stage.removeChild(oldHouse);

    const container = new PIXI.Container();
    container.name = 'house_container';

    const cx = app.screen.width / 2 - 32;
    const baseY = app.screen.height * 0.72;
    const w = Math.max(48, house.size);
    const h = w * 0.7;

    const colors: Record<string, number> = {
      tent: 0x818cf8, wood_house: 0x8B5CF6, stone_house: 0x6366f1,
      mansion: 0x4f46e5, castle: 0x4338ca,
    };
    const bodyColor = colors[house.style] || 0x6366f1;

    // Shadow
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.2);
    shadow.drawEllipse(cx + w / 2, baseY + h + 4, w * 0.6, 8);
    shadow.endFill();
    container.addChild(shadow);

    if (house.style === 'tent') {
      const tent = new PIXI.Graphics();
      tent.beginFill(bodyColor);
      tent.moveTo(cx + w * 0.5, baseY - h * 0.3);
      tent.lineTo(cx + w, baseY + h * 0.3);
      tent.lineTo(cx, baseY + h * 0.3);
      tent.closePath();
      tent.endFill();
      container.addChild(tent);
      const pole = new PIXI.Graphics();
      pole.lineStyle(2, 0xf0b90b, 0.7);
      pole.moveTo(cx + w * 0.5, baseY - h * 0.3);
      pole.lineTo(cx + w * 0.5, baseY - h * 0.4);
      container.addChild(pole);
    } else {
      const body = new PIXI.Graphics();
      body.beginFill(bodyColor);
      body.drawRoundedRect(cx, baseY, w, h, 4);
      body.endFill();
      container.addChild(body);

      const roof = new PIXI.Graphics();
      roof.beginFill(0x312e81, 1);
      roof.moveTo(cx - 8, baseY);
      roof.lineTo(cx + w / 2, baseY - h * 0.45);
      roof.lineTo(cx + w + 8, baseY);
      roof.closePath();
      roof.endFill();
      container.addChild(roof);

      const roofLine = new PIXI.Graphics();
      roofLine.lineStyle(1, 0xf0b90b, 0.3);
      roofLine.moveTo(cx, baseY - h * 0.15);
      roofLine.lineTo(cx + w, baseY - h * 0.15);
      container.addChild(roofLine);

      const door = new PIXI.Graphics();
      door.beginFill(0x1e1b4b);
      door.drawRect(cx + w * 0.38, baseY + h * 0.5, w * 0.24, h * 0.5);
      door.endFill();
      container.addChild(door);

      const handle = new PIXI.Graphics();
      handle.beginFill(0xf0b90b, 0.8);
      handle.drawCircle(cx + w * 0.56, baseY + h * 0.75, 2);
      handle.endFill();
      container.addChild(handle);

      const win = new PIXI.Graphics();
      win.beginFill(0x00e6ff, 0.4);
      win.drawRect(cx + w * 0.1, baseY + h * 0.15, w * 0.2, h * 0.2);
      win.drawRect(cx + w * 0.7, baseY + h * 0.15, w * 0.2, h * 0.2);
      win.endFill();
      container.addChild(win);

      const badgeBg = new PIXI.Graphics();
      badgeBg.beginFill(0x6366f1, 0.3);
      badgeBg.drawRoundedRect(cx + w / 2 - 16, baseY + h + 6, 32, 14, 4);
      badgeBg.endFill();
      container.addChild(badgeBg);

      const levelText = new PIXI.Text(`Lv.${house.level}`, {
        fontFamily: 'Inter, sans-serif',
        fontSize: 9,
        fill: 0xf0b90b,
        fontWeight: 'bold',
      });
      levelText.x = cx + w / 2 - 14;
      levelText.y = baseY + h + 7;
      container.addChild(levelText);
    }

    app.stage.addChild(container);
  }, [house]);

  // Draw characters
  useEffect(() => {
    if (!appRef.current) return;
    const app = appRef.current;

    const oldChars = app.stage.getChildByName('characters_container');
    if (oldChars) app.stage.removeChild(oldChars);

    const container = new PIXI.Container();
    container.name = 'characters_container';

    activeTrades.forEach((trade: any, i: number) => {
      const theme = EXCHANGE_THEMES[trade.exchange as keyof typeof EXCHANGE_THEMES] || EXCHANGE_THEMES.other;
      const color = parseInt(theme.color.slice(1), 16);
      const x = 80 + i * 90;
      const y = app.screen.height - 100;

      const shadow = new PIXI.Graphics();
      shadow.beginFill(0x000000, 0.15);
      shadow.drawEllipse(x + 12, y + 34, 16, 4);
      shadow.endFill();
      container.addChild(shadow);

      const char = new PIXI.Graphics();
      char.beginFill(color);
      char.drawRoundedRect(x, y, 24, 28, 3);
      char.endFill();

      const head = new PIXI.Graphics();
      head.beginFill(0xffd700);
      head.drawCircle(x + 12, y - 6, 9);
      head.endFill();
      container.addChild(head);
      container.addChild(char);

      const insig = new PIXI.Text(theme.insignia, {
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        fill: color,
      });
      insig.x = x + 6;
      insig.y = y - 18;
      container.addChild(insig);

      const info = new PIXI.Text(
        `${trade.symbol}\n${trade.side === 'long' ? '▲' : '▼'} ${trade.type === 'futures' ? trade.leverage + 'x' : 'Spot'}`,
        { fontFamily: 'Inter, sans-serif', fontSize: 8, fill: 0x5c5c80, align: 'center' }
      );
      info.x = x - 2;
      info.y = y + 32;
      container.addChild(info);
    });

    app.stage.addChild(container);
  }, [activeTrades]);

  // Animation
  useEffect(() => {
    if (!appRef.current) return;
    const app = appRef.current;
    let elapsed = 0;
    const ticker = () => {
      elapsed += 0.02;
      const hc = app.stage.getChildByName('house_container');
      if (hc) hc.y = Math.sin(elapsed) * 3;
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
