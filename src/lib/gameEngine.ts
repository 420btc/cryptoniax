// HodlVille Game Engine — PixiJS utilities
import * as PIXI from 'pixi.js';

const SPRITES_V2 = '/sprites/v2';

// ── Sprite path helpers ──────────────────────────────────────
export function houseSprite(style: string, level: number) {
  const lv = Math.min(5, Math.max(1, Math.ceil(level / 3)));
  return `${SPRITES_V2}/house_${style}_lv${lv}.png`;
}
export function heroSprite(exchange: string, type: string, level: number) {
  const lv = Math.min(5, Math.max(1, level));
  return `${SPRITES_V2}/hero_${exchange}_${type}_lv${lv}.png`;
}
export function npcSprite(id: string) { return `${SPRITES_V2}/npc_${id}.png`; }
export function propSprite(name: string) { return `${SPRITES_V2}/prop_${name}.png`; }
export function fxSprite(name: string) { return `${SPRITES_V2}/fx_${name}.png`; }
export function bgSprite(id: number) { return `${SPRITES_V2}/bg_${id}.png`; }
export function petSprite(name: string) { return `${SPRITES_V2}/pet_${name}.png`; }
export function vaultSprite(level: number) { return `${SPRITES_V2}/vault_lv${level}.png`; }

// ── Texture cache ────────────────────────────────────────────
const textureCache = new Map<string, PIXI.Texture>();
const loadingPromises = new Map<string, Promise<PIXI.Texture | null>>();

export async function loadTexture(path: string): Promise<PIXI.Texture | null> {
  if (textureCache.has(path)) return textureCache.get(path)!;
  if (loadingPromises.has(path)) return loadingPromises.get(path)!;

  const promise = PIXI.Assets.load(path)
    .then((tex: PIXI.Texture) => {
      textureCache.set(path, tex);
      loadingPromises.delete(path);
      return tex;
    })
    .catch(() => {
      loadingPromises.delete(path);
      return null;
    });
  loadingPromises.set(path, promise);
  return promise;
}

export function getCached(path: string): PIXI.Texture | null {
  return textureCache.get(path) || null;
}

// ── Sprite factory with fallback ─────────────────────────────
export async function makeSprite(
  path: string,
  opts?: { anchor?: [number, number]; scale?: number; alpha?: number }
): Promise<PIXI.Sprite | null> {
  const tex = await loadTexture(path);
  if (!tex) return null;
  const s = new PIXI.Sprite(tex);
  if (opts?.anchor) s.anchor.set(opts.anchor[0], opts.anchor[1]);
  if (opts?.scale) s.scale.set(opts.scale);
  if (opts?.alpha) s.alpha = opts.alpha;
  return s;
}

// ── Text factory ─────────────────────────────────────────────
export function makeLabel(text: string, opts?: {
  size?: number; color?: number; bold?: boolean; shadow?: boolean;
}): PIXI.Text {
  return new PIXI.Text(text, {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: opts?.size || 12,
    fill: opts?.color || 0xffffff,
    fontWeight: opts?.bold ? 'bold' : 'normal',
    dropShadow: opts?.shadow ?? true,
    dropShadowColor: 0x000000,
    dropShadowBlur: 3,
    dropShadowDistance: 1,
  });
}

// ── Particles ────────────────────────────────────────────────
export interface Particle {
  sprite: any;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  decay: number;
}

export function createParticleSystem(app: PIXI.Application) {
  const particles: Particle[] = [];

  function emit(x: number, y: number, count: number, color: number, opts?: {
    speed?: number; size?: number; life?: number; spread?: number;
  }) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (opts?.speed || 1) * (0.5 + Math.random());
      const g = new PIXI.Graphics();
      const size = opts?.size || 2;
      g.beginFill(color, 0.8);
      g.drawCircle(0, 0, size);
      g.endFill();
      g.x = x + (Math.random() - 0.5) * (opts?.spread || 30);
      g.y = y + (Math.random() - 0.5) * (opts?.spread || 30);
      app.stage.addChild(g);
      particles.push({
        sprite: g,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: opts?.life || 60,
        maxLife: opts?.life || 60,
        decay: 0.97 + Math.random() * 0.02,
      });
    }
  }

  function update() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life--;
      p.sprite.x += p.vx;
      p.sprite.y += p.vy;
      p.vy += 0.03;
      p.sprite.alpha = Math.max(0, p.life / p.maxLife);
      p.sprite.scale.set(Math.max(0.01, p.life / p.maxLife));
      if (p.life <= 0) {
        app.stage.removeChild(p.sprite);
        p.sprite.destroy();
        particles.splice(i, 1);
      }
    }
  }

  return { emit, update, clear: () => { particles.forEach(p => { app.stage.removeChild(p.sprite); p.sprite.destroy(); }); particles.length = 0; } };
}

// ── Float animation helper ───────────────────────────────────
export function floatAnimation(baseY: number, elapsed: number, speed = 1, amplitude = 4) {
  return baseY + Math.sin(elapsed * speed) * amplitude;
}

// ── Create Pixi app ──────────────────────────────────────────
export function createGameApp(container: HTMLElement, height = 500): PIXI.Application {
  const app = new PIXI.Application({
    width: container.clientWidth,
    height,
    backgroundColor: 0x050510,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  });
  container.appendChild(app.view as HTMLCanvasElement);
  return app;
}
