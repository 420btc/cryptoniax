'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { useAuthStore } from '@/hooks/useAuth';
import { EXCHANGE_THEMES, ExchangeType } from '@/types';
import {
  createGameApp, makeSprite, loadTexture, makeLabel,
  createParticleSystem, floatAnimation, bgSprite,
  houseSprite, npcSprite, propSprite, heroSprite, vaultSprite
} from '@/lib/gameEngine';

interface NPC {
  id: string;
  name: string;
  desc: string;
  color: number;
  sprite: PIXI.Sprite | null;
  x: number; y: number;
  targetX: number; targetY: number;
  speed: number;
  walkTimer: number;
  dir: number; // 1 or -1
}

interface Building {
  id: string;
  name: string;
  icon: string;
  symbol: string;
  desc: string;
  color: number;
  built: boolean;
  x: number; y: number;
  sprite: PIXI.Sprite | null;
  glow: any | null;
}

export default function KingdomCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const particlesRef = useRef<ReturnType<typeof createParticleSystem> | null>(null);
  const npcsRef = useRef<NPC[]>([]);
  const buildingsRef = useRef<Building[]>([]);
  const houseSpriteRef = useRef<PIXI.Sprite | null>(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<{ type: 'npc' | 'building'; id: string } | null>(null);

  const { house, level, activeTrades, closedTrades, coins } = usePortfolioStore();
  const { profile } = useAuthStore();
  const username = profile?.email?.split('@')[0] || 'Trader';

  const tradedSymbols = new Set([
    ...activeTrades.map(t => t.symbol),
    ...closedTrades.map(t => t.symbol),
  ]);

  const buildingData: Building[] = [
    { id: 'bank', name: 'Banco BTC', icon: '🏦', symbol: 'BTC', desc: 'Genera oro pasivo', color: 0xf0b90b, built: tradedSymbols.has('BTC'), x: 0.08, y: 0.28, sprite: null, glow: null },
    { id: 'academy', name: 'Academia ETH', icon: '📚', symbol: 'ETH', desc: '+XP para héroes', color: 0x818cf8, built: tradedSymbols.has('ETH'), x: 0.38, y: 0.10, sprite: null, glow: null },
    { id: 'market', name: 'Mercado SOL', icon: '⚡', symbol: 'SOL', desc: 'Mejores precios', color: 0x22d65e, built: tradedSymbols.has('SOL'), x: 0.82, y: 0.28, sprite: null, glow: null },
    { id: 'port', name: 'Puerto XRP', icon: '🚢', symbol: 'XRP', desc: 'Rutas comerciales', color: 0x00e6ff, built: false, x: 0.30, y: 0.68, sprite: null, glow: null },
    { id: 'forge', name: 'Forja', icon: '🔨', symbol: '', desc: 'Mejora tu equipamiento', color: 0xef4466, built: true, x: 0.62, y: 0.68, sprite: null, glow: null },
  ];

  const npcData: Omit<NPC, 'sprite' | 'walkTimer' | 'dir'>[] = [
    { id: 'blacksmith', name: 'Herrero', desc: 'Forja armas y armaduras', color: 0xef4466, x: 0.08, y: 0.52, targetX: 0.08, targetY: 0.52, speed: 0.3 },
    { id: 'merchant', name: 'Mercader', desc: 'Compra y vende objetos', color: 0xf0b90b, x: 0.75, y: 0.50, targetX: 0.75, targetY: 0.50, speed: 0.25 },
    { id: 'quest_giver', name: 'Mago', desc: 'Misiones y recompensas', color: 0x818cf8, x: 0.50, y: 0.18, targetX: 0.50, targetY: 0.18, speed: 0.2 },
    { id: 'banker', name: 'Banquero', desc: 'Guarda tus ahorros', color: 0x22d65e, x: 0.12, y: 0.22, targetX: 0.12, targetY: 0.22, speed: 0.35 },
  ];

  const init = useCallback(async () => {
    if (!canvasRef.current || appRef.current) return;

    const app = createGameApp(canvasRef.current, 500);
    appRef.current = app;
    const particles = createParticleSystem(app);
    particlesRef.current = particles;

    // ── Background ──
    const bgTex = await loadTexture(bgSprite(1));
    if (bgTex) {
      const bg = new PIXI.Sprite(bgTex);
      bg.width = app.screen.width;
      bg.height = 500;
      bg.alpha = 0.3;
      app.stage.addChildAt(bg, 0);
    }

    // Grid overlay
    const grid = new PIXI.Graphics();
    grid.lineStyle(0.5, 0x6366f1, 0.04);
    for (let x = 0; x < app.screen.width; x += 40) grid.moveTo(x, 0).lineTo(x, 500);
    for (let y = 0; y < 500; y += 40) grid.moveTo(0, y).lineTo(app.screen.width, y);
    app.stage.addChild(grid);

    // ── Ground glow ──
    const ground = new PIXI.Graphics();
    ground.beginFill(0x22d65e, 0.03);
    ground.drawRect(0, 380, app.screen.width, 120);
    ground.endFill();
    app.stage.addChild(ground);

    // ── Props (trees, rocks, lanterns) ──
    const props = [
      { name: 'tree_oak', x: 0.03, y: 0.18 },
      { name: 'tree_pine', x: 0.88, y: 0.18 },
      { name: 'rock', x: 0.15, y: 0.70 },
      { name: 'lantern', x: 0.45, y: 0.72 },
      { name: 'lantern', x: 0.65, y: 0.72 },
      { name: 'signpost', x: 0.25, y: 0.50 },
      { name: 'portal', x: 0.92, y: 0.52 },
    ];
    for (const p of props) {
      const sp = await makeSprite(propSprite(p.name), { anchor: [0.5, 0.8], scale: 0.12, alpha: 0.7 });
      if (sp) {
        sp.x = p.x * app.screen.width;
        sp.y = p.y * 500;
        app.stage.addChild(sp);
      }
    }

    // ── Buildings ──
    const bldgGroup = new PIXI.Container();
    const bldgLabelGroup = new PIXI.Container();
    app.stage.addChild(bldgGroup);
    app.stage.addChild(bldgLabelGroup);

    for (const b of buildingData) {
      const g = new PIXI.Graphics();
      const bx = b.x * app.screen.width;
      const by = b.y * 500;

      if (b.built) {
        // Building sprite from vault or generic
        const sp = await makeSprite(vaultSprite(3), { anchor: [0.5, 0.85], scale: 0.15 });
        if (sp) {
          sp.x = bx; sp.y = by;
          bldgGroup.addChild(sp);
          b.sprite = sp;

          // Glow ring
          const glow = new PIXI.Graphics();
          glow.beginFill(b.color, 0.08);
          glow.drawCircle(0, 0, 30);
          glow.endFill();
          glow.x = bx; glow.y = by;
          bldgGroup.addChild(glow);
          b.glow = glow;
        }
      } else {
        // Locked building — semi-transparent
        g.beginFill(0x3c3c60, 0.3);
        g.drawRoundedRect(-20, -25, 40, 50, 6);
        g.endFill();
        g.lineStyle(1, 0x5c5c80, 0.3);
        g.drawRoundedRect(-20, -25, 40, 50, 6);
        g.x = bx; g.y = by;
        bldgGroup.addChild(g);

        // Lock icon
        const lock = makeLabel('🔒', { size: 14, shadow: false });
        lock.anchor.set(0.5);
        lock.x = bx; lock.y = by - 5;
        bldgGroup.addChild(lock);
      }

      // Label
      const lbl = makeLabel(b.name, { size: 9, color: b.color, bold: true, shadow: true });
      lbl.anchor.set(0.5);
      lbl.x = bx;
      lbl.y = by + 35;
      bldgLabelGroup.addChild(lbl);

      // Interactive zone (invisible click area)
      const hit = new PIXI.Graphics();
      hit.beginFill(0xffffff, 0.001);
      hit.drawRoundedRect(-25, -30, 50, 65, 8);
      hit.endFill();
      hit.x = bx; hit.y = by;
      (hit as any).eventMode = 'static';
      (hit as any).cursor = 'pointer';
      (hit as any).on('pointerover', () => {
        if (b.glow) { (b.glow as any).scale.set(1.5); (b.glow as any).alpha = 0.3; }
      });
      (hit as any).on('pointerout', () => {
        if (b.glow) { (b.glow as any).scale.set(1); (b.glow as any).alpha = 0.08; }
      });
      (hit as any).on('pointertap', () => setSelected({ type: 'building', id: b.id }));
      bldgGroup.addChild(hit);
    }
    buildingsRef.current = buildingData;

    // ── Your House (center) ──
    const houseStyle = house?.style || 'wood_house';
    const houseLv = house?.level || 1;
    const hx = app.screen.width / 2;
    const hy = 500 * 0.45;

    const hSprite = await makeSprite(houseSprite(houseStyle, houseLv), { anchor: [0.5, 0.85], scale: 0.2 });
    if (hSprite) {
      hSprite.x = hx; hSprite.y = hy;
      app.stage.addChild(hSprite);
      houseSpriteRef.current = hSprite;

      // House glow
      const hGlow = new PIXI.Graphics();
      hGlow.beginFill(0x6366f1, 0.1);
      hGlow.drawCircle(0, 0, 40);
      hGlow.endFill();
      hGlow.x = hx; hGlow.y = hy;
      app.stage.addChild(hGlow);

      // Level badge
      const badge = makeLabel(`🏠 Nv.${houseLv}`, { size: 10, color: 0xf0b90b, bold: true });
      badge.anchor.set(0.5);
      badge.x = hx; badge.y = hy + 55;
      app.stage.addChild(badge);

      // House click
      const hHit = new PIXI.Graphics();
      hHit.beginFill(0xffffff, 0.001);
      hHit.drawRoundedRect(-30, -35, 60, 80, 8);
      hHit.endFill();
      hHit.x = hx; hHit.y = hy;
      (hHit as any).eventMode = 'static';
      (hHit as any).cursor = 'pointer';
      (hHit as any).on('pointertap', () => setSelected({ type: 'building', id: 'house' }));
      app.stage.addChild(hHit);
    }

    // ── NPCs with walking paths ──
    const npcGroup = new PIXI.Container();
    app.stage.addChild(npcGroup);

    const npcs: NPC[] = [];
    for (const nd of npcData) {
      const sp = await makeSprite(npcSprite(nd.id), { anchor: [0.5, 0.85], scale: 0.13 });
      if (sp) {
        sp.x = nd.x * app.screen.width;
        sp.y = nd.y * 500;
        npcGroup.addChild(sp);

        // NPC name label
        const nl = makeLabel(nd.name, { size: 8, color: nd.color, bold: true, shadow: true });
        nl.anchor.set(0.5);
        nl.x = sp.x; nl.y = sp.y - 30;
        npcGroup.addChild(nl);

        // Random path
        const bxMin = Math.max(20, sp.x - 60);
        const bxMax = Math.min(app.screen.width - 20, sp.x + 60);
        const byMin = Math.max(20, sp.y - 40);
        const byMax = Math.min(480, sp.y + 40);

        npcs.push({
          ...nd,
          sprite: sp,
          x: sp.x, y: sp.y,
          targetX: bxMin + Math.random() * (bxMax - bxMin),
          targetY: byMin + Math.random() * (byMax - byMin),
          speed: 0.3 + Math.random() * 0.4,
          walkTimer: Math.random() * 120,
          dir: Math.random() > 0.5 ? 1 : -1,
        });

        // Interactive
        (sp as any).eventMode = 'static';
        (sp as any).cursor = 'pointer';
        const id = nd.id;
        (sp as any).on('pointertap', () => setSelected({ type: 'npc', id }));
      }
    }
    npcsRef.current = npcs;

    // ── Ambient particles (fireflies) ──
    setInterval(() => {
      particles.emit(
        Math.random() * app.screen.width,
        150 + Math.random() * 300,
        2, 0x818cf8, { speed: 0.3, size: 1.5, life: 80, spread: 20 }
      );
    }, 3000);

    setReady(true);

    // ── Animation loop ──
    let elapsed = 0;
    app.ticker.add(() => {
      elapsed += 0.03;

      // Float house
      if (houseSpriteRef.current) {
        houseSpriteRef.current.y = hy + Math.sin(elapsed * 0.8) * 3;
        houseSpriteRef.current.rotation = Math.sin(elapsed * 0.4) * 0.015;
      }

      // Walk NPCs
      for (const npc of npcs) {
        npc.walkTimer--;
        if (npc.walkTimer <= 0 || (Math.abs(npc.x - npc.targetX) < 5 && Math.abs(npc.y - npc.targetY) < 5)) {
          const bxMin = Math.max(20, npc.x - 80);
          const bxMax = Math.min(app.screen.width - 20, npc.x + 80);
          const byMin = Math.max(20, npc.y - 60);
          const byMax = Math.min(480, npc.y + 60);
          npc.targetX = bxMin + Math.random() * (bxMax - bxMin);
          npc.targetY = byMin + Math.random() * (byMax - byMin);
          npc.walkTimer = 60 + Math.random() * 100;
          npc.dir = npc.targetX > npc.x ? 1 : -1;
        }
        if (npc.sprite) {
          const dx = npc.targetX - npc.x;
          const dy = npc.targetY - npc.y;
          npc.x += Math.sign(dx) * npc.speed;
          npc.y += Math.sign(dy) * npc.speed * 0.6;
          const sp = npc.sprite;
          sp.x = npc.x;
          sp.y = npc.y + Math.sin(elapsed + npcs.indexOf(npc)) * 2;
          (sp as any).scale.x = npc.dir; // flip
        }
      }

      // Pulse building glows
      for (const b of buildingsRef.current) {
        if (b.glow) {
          (b.glow as any).alpha = 0.05 + Math.sin(elapsed * 0.5 + buildingsRef.current.indexOf(b)) * 0.03;
        }
      }

      // Update particles
      particles.update();
    });

    // ── Resize ──
    const handleResize = () => {
      if (canvasRef.current) {
        app.renderer.resize(canvasRef.current.clientWidth, 500);
      }
    };
    window.addEventListener('resize', handleResize);

  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { init(); return () => {
    if (appRef.current) {
      appRef.current.destroy(true, { children: true });
      appRef.current = null;
    }
  }; }, []);

  const selectedInfo = selected ? getInfo(selected, buildingData, npcData, username) : null;

  return (
    <div className="relative glass-card !p-0 overflow-hidden" style={{ minHeight: 500 }}>
      <div ref={canvasRef} className="w-full" style={{ height: 500 }} />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(5,5,15,0.9)]">
          <div className="text-center">
            <div className="text-4xl mb-3 animate-bounce">🏗️</div>
            <p className="text-[#8888b0] text-sm">Construyendo el reino...</p>
          </div>
        </div>
      )}
      {/* Info panel overlay */}
      {selectedInfo && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 glass-card !p-4 w-[90%] max-w-sm animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{selectedInfo.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white">{selectedInfo.name}</div>
              <div className="text-[11px] text-[#8888b0] mt-0.5">{selectedInfo.desc}</div>
              {selectedInfo.stats && (
                <div className="mt-2 pt-2 border-t border-[rgba(99,102,241,0.06)] text-[10px] text-[#5c5c80] space-y-0.5">
                  {selectedInfo.stats.map((s: string, i: number) => <div key={i}>{s}</div>)}
                </div>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="text-[#5c5c80] hover:text-white text-xs flex-shrink-0">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

function getInfo(sel: { type: string; id: string }, bldgs: Building[], npcs: any[], username: string) {
  if (sel.type === 'building') {
    if (sel.id === 'house') {
      return { icon: '🏡', name: `Casa de ${username}`, desc: 'Tu hogar en HodlVille. Crece con cada trade.', stats: ['Tus trades construyen tu reino'] };
    }
    const b = bldgs.find(x => x.id === sel.id);
    if (!b) return null;
    return {
      icon: b.icon,
      name: b.name,
      desc: b.built ? b.desc : '🔒 Construye con trades de ' + b.symbol,
      stats: b.built ? [`✅ Operativo — genera recursos pasivos`] : [`❌ Necesitas tradear ${b.symbol} para desbloquear`],
    };
  }
  if (sel.type === 'npc') {
    const n = npcs.find((x: any) => x.id === sel.id);
    if (!n) return null;
    return { icon: '👤', name: n.name, desc: n.desc, stats: [`Haz clic para interactuar (próximamente)`] };
  }
  return null;
}
