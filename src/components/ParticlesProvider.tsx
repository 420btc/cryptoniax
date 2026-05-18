'use client';

import { useEffect, useRef, useCallback, createContext, useContext, useState } from 'react';

// ─── Types ──────────────────────────────────────────────────

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
  color: string;
  type: 'circle' | 'rect' | 'text' | 'coin' | 'star';
  text?: string;
  rotation?: number;
  rotationSpeed?: number;
  gravity?: number;
  fadeOut?: boolean;
}

type ParticleKind = 'confetti' | 'coins' | 'sparkles' | 'fireworks' | 'numbers' | 'stars';

interface ParticleBurst {
  kind: ParticleKind;
  x: number; y: number;
  count?: number;
  color?: string;
  text?: string;
  spread?: number;
}

// ─── Colors ─────────────────────────────────────────────────

const PROFIT_GREENS = ['#22d65e', '#16a34a', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
const LOSS_REDS = ['#ef4466', '#dc2626', '#f87171', '#fca5a5', '#991b1b'];
const GOLD_COINS = ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#fde68a'];
const SPARKLE_COLORS = ['#818cf8', '#6366f1', '#a78bfa', '#c4b5fd', '#e0e7ff', '#fbbf24', '#f472b6'];
const FIREWORK_COLORS = ['#ff007a', '#00e6ff', '#fbbf24', '#22d65e', '#818cf8', '#f97316', '#ec4899'];

// ─── Context ────────────────────────────────────────────────

interface ParticlesContextType {
  burst: (opts: ParticleBurst) => void;
  floatText: (x: number, y: number, text: string, color?: string) => void;
}

export const ParticlesContext = createContext<ParticlesContextType>({
  burst: () => {},
  floatText: () => {},
});

export function useParticles() {
  return useContext(ParticlesContext);
}

// ─── Provider Component ─────────────────────────────────────

export default function ParticlesProvider({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const [ctx, setCtx] = useState<ParticlesContextType | null>(null);

  // Engine loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext('2d');
    if (!c) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      c.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const alive: Particle[] = [];

      for (const p of particles) {
        p.life--;
        if (p.life <= 0) continue;

        // Physics
        p.x += p.vx;
        p.y += p.vy;
        if (p.gravity) p.vy += p.gravity * 0.15;
        p.vx *= 0.99;
        if (p.rotationSpeed) p.rotation = (p.rotation || 0) + p.rotationSpeed;

        // Fade
        const alpha = p.fadeOut ? Math.max(0, p.life / p.maxLife) : 1;
        const scale = p.fadeOut ? 0.5 + (p.life / p.maxLife) * 0.5 : 1;

        c.save();
        c.globalAlpha = alpha;
        c.translate(p.x, p.y);
        c.scale(scale, scale);
        if (p.rotation) c.rotate(p.rotation);

        // Draw by type
        switch (p.type) {
          case 'coin': {
            // Golden circle with $ symbol
            const grad = c.createRadialGradient(0, 0, p.size * 0.2, 0, 0, p.size);
            grad.addColorStop(0, '#fde68a');
            grad.addColorStop(0.6, '#f59e0b');
            grad.addColorStop(1, '#92400e');
            c.fillStyle = grad;
            c.beginPath();
            c.arc(0, 0, p.size, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = '#7c2d12';
            c.font = `bold ${p.size * 1.2}px sans-serif`;
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText('$', 0, 0);
            break;
          }
          case 'star': {
            c.fillStyle = p.color;
            drawStar(c, 0, 0, p.size, p.size * 0.4, 5);
            break;
          }
          case 'text': {
            c.fillStyle = p.color;
            c.font = `bold ${p.size}px "Inter", sans-serif`;
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.shadowColor = p.color;
            c.shadowBlur = 8;
            c.fillText(p.text || '', 0, 0);
            c.shadowBlur = 0;
            break;
          }
          case 'rect': {
            c.fillStyle = p.color;
            c.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
            break;
          }
          default: {
            c.fillStyle = p.color;
            c.beginPath();
            c.arc(0, 0, p.size, 0, Math.PI * 2);
            c.fill();
          }
        }

        c.restore();
        alive.push(p);
      }

      particlesRef.current = alive;
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Burst function
  const burst = useCallback((opts: ParticleBurst) => {
    const count = opts.count || 20;
    const spread = opts.spread || 3;
    const newParticles: Particle[] = [];

    const colors: string[] = (() => {
      switch (opts.kind) {
        case 'confetti': return FIREWORK_COLORS;
        case 'coins': return GOLD_COINS;
        case 'sparkles': return SPARKLE_COLORS;
        case 'fireworks': return FIREWORK_COLORS;
        case 'stars': return ['#fbbf24', '#fde68a', '#fcd34d'];
        default: return [opts.color || '#fff'];
      }
    })();

    const particleType = (() => {
      switch (opts.kind) {
        case 'coins': return 'coin' as const;
        case 'stars': return 'star' as const;
        case 'numbers': return 'text' as const;
        case 'confetti': return 'rect' as const;
        default: return 'circle' as const;
      }
    })();

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * spread;
      const size = opts.kind === 'coins' ? 10 + Math.random() * 8
        : opts.kind === 'stars' ? 4 + Math.random() * 6
        : opts.kind === 'confetti' ? 4 + Math.random() * 6
        : opts.kind === 'numbers' ? 16 + Math.random() * 8
        : 3 + Math.random() * 5;

      newParticles.push({
        x: opts.x,
        y: opts.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (opts.kind === 'fireworks' ? 4 : 1),
        life: 40 + Math.random() * 40,
        maxLife: 80,
        size,
        color: opts.color || colors[Math.floor(Math.random() * colors.length)],
        type: particleType,
        text: opts.text,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        gravity: opts.kind === 'coins' ? 0.08 : opts.kind === 'confetti' ? 0.04 : 0.02,
        fadeOut: true,
      });
    }

    // Special: fireworks have a secondary burst
    if (opts.kind === 'fireworks') {
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 6;
        newParticles.push({
          x: opts.x,
          y: opts.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 20 + Math.random() * 30,
          maxLife: 50,
          size: 2 + Math.random() * 2,
          color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
          type: 'circle',
          gravity: 0.03,
          fadeOut: true,
        });
      }
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  // Floating text
  const floatText = useCallback((x: number, y: number, text: string, color?: string) => {
    const colorStr = color || (text.startsWith('+') ? '#22d65e' : text.startsWith('-') ? '#ef4466' : '#fbbf24');
    const p: Particle = {
      x, y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -2 - Math.random() * 2,
      life: 60,
      maxLife: 60,
      size: 18 + Math.abs(parseFloat(text) || 0) * 0.5,
      color: colorStr,
      type: 'text',
      text,
      fadeOut: true,
      gravity: -0.01,
    };
    particlesRef.current = [...particlesRef.current, p];
  }, []);

  // Set context once
  useEffect(() => {
    setCtx({ burst, floatText });
  }, [burst, floatText]);

  return (
    <ParticlesContext.Provider value={ctx || { burst, floatText }}>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
        style={{ width: '100%', height: '100%' }}
      />
      {children}
    </ParticlesContext.Provider>
  );
}

// ─── Star drawing helper ────────────────────────────────────

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, points: number) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}
