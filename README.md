# 🏡 HodlVille

> **Paper trading gamificado.** Charts reales, héroes que suben de nivel, y un mundo pixel que crece con tus HODLs.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![PixiJS](https://img.shields.io/badge/PixiJS-7-f00060)](https://pixijs.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

---

## ✨ Características

### 📊 Paper Trading Realista
- **3 pares**: BTC/USDT, ETH/USDT, SOL/USDT
- **Charts con TradingView Lightweight Charts**
- **Indicadores**: EMA 9, EMA 21, velas japonesas, volumen
- **Spot + Futuros Perpetuos** con apalancamiento hasta **100x**
- **5 exchanges**: ⚡ BingX, 🌊 Hyperliquid, 🔥 Bybit, 🦄 Uniswap, ✦ Other
- Fees, margen, P&L en tiempo real

### 👤 Personajes
- Cada trade abierto **crea un personaje único**
- **Spot** → Mercader | **Futuros** → Guerrero
- **Suben de nivel** si ganas, **se debilitan** si pierdes
- Colores e insignias según exchange
- Stats: HP, Attack, Defense

### 🏠 Holdings → Casa
- Tus HODLs construyen tu hogar:
  - 🏕️ Tienda → 🪵 Madera → 🏠 Piedra → 🏛️ Mansión → 🏰 Castillo
- Nivel de casa según cantidad HODLeada
- Renderizado pixel art en el mundo

### 🌍 Mundo Pixel 2D
- Canvas con PixiJS
- Estrellas, suelo con grid, gradiente en horizonte
- Casa animada flotando suavemente
- Personajes caminando con insignias de exchange
- Sombras y profundidad

### 🎨 UI Profesional
- **Glassmorphism** con backdrop blur
- **Sistema de diseño** con tokens CSS
- **Hero animado** con orbes interactivos y partículas
- **Dark theme** refinado (#05050f)
- **Micro-interacciones**: hover states, animations, skeleton loaders
- **Tipografía**: Inter + Space Grotesk
- **Responsive**: mobile-first

### 🔐 Autenticación
- Google OAuth (Supabase)
- MetaMask (wagmi/viem)
- Sesiones persistentes

---

## 🚀 Quick Start

```bash
git clone https://github.com/420btc/cryptoniax hodlville
cd hodlville
cp .env.example .env.local  # Añade tus keys de Supabase
npm install
npm run dev                  # http://localhost:3000
```

### Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 🏗️ Stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | TailwindCSS 3 + Design Tokens |
| Charts | TradingView Lightweight Charts |
| Juego 2D | PixiJS 7 |
| Auth | Supabase (Google OAuth) + wagmi/viem (MetaMask) |
| Estado | Zustand |
| Animaciones | Framer Motion |
| Deploy | Vercel |

---

## 📁 Estructura

```
src/
├── app/
│   ├── page.tsx              # Landing page (hero, features, CTA)
│   ├── layout.tsx            # Root layout (providers + auth gate)
│   ├── globals.css           # Design system (tokens, glass, animations)
│   ├── dashboard/page.tsx    # Trading dashboard
│   ├── world/page.tsx        # Mundo 2D pixel
│   └── auth/callback/page.tsx # OAuth callback
├── components/
│   ├── Chart.tsx             # TradingView chart con EMA 9/21
│   ├── TradePanel.tsx        # Panel de trading completo
│   ├── World.tsx             # PixiJS mundo pixel
│   ├── Navbar.tsx            # Navegación + perfil + XP bar
│   └── LoginModal.tsx        # Login Google + MetaMask
├── hooks/
│   ├── useAuth.ts            # Auth store (zustand + supabase)
│   └── usePortfolio.ts       # Portfolio (trades, holdings, coins, chars, house)
├── lib/
│   ├── gameLogic.ts          # XP, niveles, stats, casas
│   ├── supabase.ts           # Cliente Supabase
│   └── web3.tsx              # Config wagmi + MetaMask
└── types/
    ├── index.ts              # Tipos compartidos
    └── declarations.d.ts     # Type declarations
```

---

## 📋 Lo que queda por hacer

- [ ] Base de datos real (Supabase/NeonDB) con migraciones
- [ ] Conectar precios reales (Binance WebSocket API)
- [ ] MACD en charts
- [ ] Sprites pixel art generados por IA
- [ ] Multijugador (ver casas de otros)
- [ ] Misiones diarias + logros
- [ ] Leaderboard
- [ ] Deploy a Vercel

---

## 📄 Licencia

MIT — HodlVille es un proyecto personal.

---

*HodlVille — Donde tus HODLs construyen tu reino. Sin valor real. No es asesoramiento financiero.*
