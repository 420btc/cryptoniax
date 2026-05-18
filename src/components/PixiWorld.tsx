'use client';

import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { createGameApp, makeSprite, loadTexture, makeLabel, createParticleSystem, bgSprite } from '@/lib/gameEngine';

interface PlayerDot {
  name: string;
  level: number;
  color: number;
  online: boolean;
  x: number; y: number;
  dot: any;
  pulse: number;
}

interface Biome {
  name: string;
  color: number;
  icon: string;
  x: number; y: number;
  w: number; h: number;
  desc: string;
}

const BIOMES: Biome[] = [
  { name: 'Ciudad Central', color: 0x6366f1, icon: '🏰', x: 0.42, y: 0.35, w: 0.16, h: 0.12, desc: 'El corazón de HodlVille' },
  { name: 'Bosque Encantado', color: 0x22d65e, icon: '🌲', x: 0.08, y: 0.10, w: 0.20, h: 0.18, desc: 'Naturaleza y misterio' },
  { name: 'Montañas de Hielo', color: 0x00e6ff, icon: '🏔️', x: 0.72, y: 0.05, w: 0.18, h: 0.15, desc: 'Picos helados' },
  { name: 'Desierto Ardiente', color: 0xef4466, icon: '🏜️', x: 0.10, y: 0.60, w: 0.22, h: 0.16, desc: 'Calor extremo' },
  { name: 'Volcán', color: 0xf59e0b, icon: '🌋', x: 0.72, y: 0.58, w: 0.18, h: 0.20, desc: 'Peligro y riqueza' },
  { name: 'Playa Dorada', color: 0xf0b90b, icon: '🏖️', x: 0.32, y: 0.72, w: 0.20, h: 0.12, desc: 'Tranquilidad y comercio' },
];

const PLAYERS: PlayerDot[] = [
  { name: 'CryptoKing', level: 5, color: 0x00e6ff, online: true, x: 0, y: 0, dot: null!, pulse: 0 },
  { name: 'HodlQueen', level: 3, color: 0xf7a600, online: true, x: 0, y: 0, dot: null!, pulse: 0 },
  { name: 'SolanaWolf', level: 4, color: 0xff007a, online: true, x: 0, y: 0, dot: null!, pulse: 0 },
  { name: 'EthSurfer', level: 2, color: 0x00e6ff, online: true, x: 0, y: 0, dot: null!, pulse: 0 },
  { name: 'TradeWizard', level: 7, color: 0xf0b90b, online: true, x: 0, y: 0, dot: null!, pulse: 0 },
  { name: 'MoonBoy', level: 1, color: 0xff007a, online: true, x: 0, y: 0, dot: null!, pulse: 0 },
  { name: 'CryptoNinja', level: 4, color: 0x00e6ff, online: true, x: 0, y: 0, dot: null!, pulse: 0 },
  { name: 'DiamondHands', level: 6, color: 0xf7a600, online: false, x: 0, y: 0, dot: null!, pulse: 0 },
  { name: 'BTCMaxi', level: 6, color: 0xf0b90b, online: false, x: 0, y: 0, dot: null!, pulse: 0 },
];

export default function PixiWorld() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const particlesRef = useRef<ReturnType<typeof createParticleSystem> | null>(null);
  const playerDotsRef = useRef<PlayerDot[]>([]);
  const [ready, setReady] = useState(false);
  const [hoveredBiome, setHoveredBiome] = useState<Biome | null>(null);
  const [hoveredPlayer, setHoveredPlayer] = useState<{ name: string; level: number; color: number; online: boolean } | null>(null);

  const { activeTrades, closedTrades, level } = usePortfolioStore();

  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    const app = createGameApp(canvasRef.current, 500);
    appRef.current = app;
    const particles = createParticleSystem(app);
    particlesRef.current = particles;

    const W = app.screen.width;
    const H = 500;

    // ── Background gradient ──
    const bg = new PIXI.Graphics();
    bg.beginFill(0x050510);
    bg.drawRect(0, 0, W, H);
    bg.endFill();
    app.stage.addChild(bg);

    // ── Grid ──
    const grid = new PIXI.Graphics();
    grid.lineStyle(0.5, 0x6366f1, 0.03);
    for (let x = 0; x < W; x += 50) grid.moveTo(x, 0).lineTo(x, H);
    for (let y = 0; y < H; y += 50) grid.moveTo(0, y).lineTo(W, y);
    app.stage.addChild(grid);

    // ── Biome regions ──
    const biomeGroup = new PIXI.Container();
    const biomeLabels = new PIXI.Container();
    app.stage.addChild(biomeGroup);
    app.stage.addChild(biomeLabels);

    for (const b of BIOMES) {
      const bx = b.x * W;
      const by = b.y * H;
      const bw = b.w * W;
      const bh = b.h * H;

      // Region background
      const region = new PIXI.Graphics();
      region.beginFill(b.color, 0.06);
      region.drawRoundedRect(bx, by, bw, bh, 12);
      region.endFill();
      region.lineStyle(1, b.color, 0.15);
      region.drawRoundedRect(bx, by, bw, bh, 12);
      biomeGroup.addChild(region);

      // Dots pattern inside biome
      for (let d = 0; d < 6; d++) {
        const dot = new PIXI.Graphics();
        dot.beginFill(b.color, 0.1 + Math.random() * 0.15);
        dot.drawCircle(0, 0, 1.5 + Math.random() * 2);
        dot.endFill();
        dot.x = bx + 10 + Math.random() * (bw - 20);
        dot.y = by + 10 + Math.random() * (bh - 20);
        biomeGroup.addChild(dot);
      }

      // Biome label
      // Icon
      const iconLbl = makeLabel(b.icon, { size: 22, shadow: false });
      iconLbl.anchor.set(0.5);
      iconLbl.x = bx + bw / 2;
      iconLbl.y = by + bh / 2 - 12;
      biomeLabels.addChild(iconLbl);

      // Name
      const nameLbl = makeLabel(b.name, { size: 9, color: b.color, bold: true });
      nameLbl.anchor.set(0.5);
      nameLbl.x = bx + bw / 2;
      nameLbl.y = by + bh / 2 + 14;
      biomeLabels.addChild(nameLbl);

      // Interactive zone
      const hit = new PIXI.Graphics();
      hit.beginFill(0xffffff, 0.001);
      hit.drawRoundedRect(bx, by, bw, bh, 12);
      hit.endFill();
      (hit as any).eventMode = 'static';
      (hit as any).cursor = 'pointer';
      (hit as any).on('pointerover', () => setHoveredBiome(b));
      (hit as any).on('pointerout', () => setHoveredBiome(null));
      biomeGroup.addChild(hit);
    }

    // ── Player dots ──
    const playerGroup = new PIXI.Container();
    app.stage.addChild(playerGroup);

    // Assign random positions in biomes
    const dots: PlayerDot[] = PLAYERS.map((p, i) => {
      const biome = BIOMES[i % BIOMES.length];
      const px = biome.x * W + Math.random() * biome.w * W;
      const py = biome.y * H + Math.random() * biome.h * H;

      const dot = new PIXI.Graphics();
      if (p.online) {
        dot.beginFill(p.color, 0.9);
        dot.drawCircle(0, 0, 4);
        dot.endFill();
        // Pulse ring
        dot.beginFill(p.color, 0.15);
        dot.drawCircle(0, 0, 10);
        dot.endFill();
      } else {
        dot.beginFill(0x5c5c80, 0.5);
        dot.drawCircle(0, 0, 3);
        dot.endFill();
      }
      dot.x = px;
      dot.y = py;
      playerGroup.addChild(dot);

      // Label
      const lbl = makeLabel(p.name, { size: 7, color: p.online ? p.color : 0x5c5c80, bold: true, shadow: true });
      lbl.anchor.set(0.5);
      lbl.x = px;
      lbl.y = py - 12;
      playerGroup.addChild(lbl);

      // Level badge
      const lvl = makeLabel(`Lv.${p.level}`, { size: 6, color: 0x8888b0, shadow: true });
      lvl.anchor.set(0.5);
      lvl.x = px;
      lvl.y = py + 9;
      playerGroup.addChild(lvl);

      // Interactive
      if (p.online) {
        (dot as any).eventMode = 'static';
        (dot as any).cursor = 'pointer';
        const pd = { ...p, x: px, y: py, dot, pulse: 0 };
        (dot as any).on('pointerover', () => setHoveredPlayer({ name: p.name, level: p.level, color: p.color, online: p.online }));
        (dot as any).on('pointerout', () => setHoveredPlayer(null));
        return pd;
      }
      return { ...p, x: px, y: py, dot, pulse: 0 };
    });
    playerDotsRef.current = dots;

    setReady(true);

    // ── Animation loop ──
    let elapsed = 0;
    app.ticker.add(() => {
      elapsed += 0.03;

      // Animate player dots (float + pulse)
      for (const p of playerDotsRef.current) {
        if (p.online) {
          p.pulse += 0.04;
          // Float
          p.dot.y = p.y + Math.sin(elapsed * 0.7 + playerDotsRef.current.indexOf(p)) * 3;
        }
      }

      // Weather particles per biome
      if (Math.random() < 0.05) {
        const biome = BIOMES[Math.floor(Math.random() * BIOMES.length)];
        particles.emit(
          biome.x * W + Math.random() * biome.w * W,
          biome.y * H,
          1, biome.color, { speed: 0.5, size: 1.5, life: 40, spread: 10 }
        );
      }

      particles.update();
    });

    return () => {
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative glass-card !p-0 overflow-hidden" style={{ minHeight: 500 }}>
      <div ref={canvasRef} className="w-full" style={{ height: 500 }} />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(5,5,15,0.9)]">
          <div className="text-center">
            <div className="text-4xl mb-3 animate-pulse">🌍</div>
            <p className="text-[#8888b0] text-sm">Cargando mundo...</p>
          </div>
        </div>
      )}

      {/* Hover: biome info */}
      {hoveredBiome && (
        <div className="absolute top-3 left-3 z-20 glass-card !p-2.5 animate-fade-in">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>{hoveredBiome.icon}</span> {hoveredBiome.name}
          </div>
          <div className="text-[9px] text-[#8888b0] mt-0.5">{hoveredBiome.desc}</div>
        </div>
      )}

      {/* Hover: player info */}
      {hoveredPlayer && (
        <div className="absolute top-3 right-3 z-20 glass-card !p-2.5 animate-fade-in">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: `#${hoveredPlayer.color.toString(16).padStart(6, '0')}` }} />
            {hoveredPlayer.name}
          </div>
          <div className="text-[9px] text-[#8888b0]">Lv.{hoveredPlayer.level} · {hoveredPlayer.online ? '🟢 Online' : '⚫ Offline'}</div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-20 glass-card !p-2">
        <div className="text-[8px] text-[#5c5c80] font-medium mb-1">🌍 BIOMAS</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          {BIOMES.map((b, i) => (
            <div key={i} className="flex items-center gap-1 text-[8px] text-[#8888b0]">
              <span>{b.icon}</span>
              <span>{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-3 right-3 z-20 glass-card !p-2 text-right">
        <div className="text-[8px] text-[#5c5c80]">
          {activeTrades.length} activos · {closedTrades.length} totales
        </div>
        <div className="text-[8px] text-[#5c5c80]">
          👤 {PLAYERS.filter(p => p.online).length} online
        </div>
      </div>
    </div>
  );
}
