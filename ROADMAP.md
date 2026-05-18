# 🏡 HodlVille — Roadmap

> **HodlVille**: Juego 2D pixel art donde tus HODLs construyen tu reino y tus trades forjan tus héroes.
> Trading simulado con charts reales (BTC/ETH/SOL), economía virtual, personajes por exchange, y mundo pixelado.

---

## ✅ Hecho (v1.1 — 18 Mayo 2026)

### 🏗️ Proyecto Base
- [x] Next.js 14 + TypeScript + TailwindCSS
- [x] PixiJS 7 para render 2D del mundo pixel
- [x] TradingView Lightweight Charts para gráficos BTC/ETH/SOL
- [x] Supabase (Google Auth) + wagmi/viem (MetaMask Auth)
- [x] Zustand para estado global
- [x] Arquitectura de componentes modular

### 🔐 Autenticación
- [x] Login con Google (Supabase OAuth)
- [x] Login con MetaMask (wagmi + ethers)
- [x] Login como Invitado (sin registro)
- [x] Auth callback page
- [x] Auth gate con redirects:
  - `/` → `/dashboard` cuando hay sesión
  - Rutas protegidas sin sesión → `/`
- [x] Navbar con balance, avatar y logout

### 📊 Trading (Paper Trading)
- [x] 3 charts: BTC/USDT, ETH/USDT, SOL/USDT
- [x] Chart con velas + volumen + tiempo real simulado
- [x] Selector de símbolo intercambiable
- [x] Panel de nueva orden: Spot/Futuros, Long/Short, Cantidad, Apalancamiento (1x-100x), Exchange
- [x] Trades activos con P&L en tiempo real
- [x] Historial de trades cerrados
- [x] Estadísticas: Balance, Win Rate, P&L Total
- [x] Sistema de monedas virtuales (10,000 iniciales)
- [x] Fees simulados (0.1% por trade)

### 👤 Personajes (Trade → Héroe)
- [x] Cada trade abierto crea un personaje único
- [x] Spot → Mercader | Futuros → Guerrero
- [x] Color e insignia según exchange: ⚡ BingX, 🌊 Hyperliquid, 🔥 Bybit, 🦄 Uniswap
- [x] Sistema de niveles por XP
- [x] Stats: HP, Attack, Defense (escalan con nivel)
- [x] Personajes renderizados en el mundo PixiJS

### 🏠 Holdings → Casa
- [x] Sistema de holdings (BTC/ETH/SOL)
- [x] Nivel de casa según cantidad HODLeada
- [x] Estilos: Tienda → Madera → Piedra → Mansión → Castillo
- [x] Renderizado 2D pixel en el mundo
- [x] Animación flotante suave

### 🌍 Mundo Pixel (PixiJS)
- [x] Canvas con grid estilo pixel
- [x] Renderizado de casa del jugador
- [x] Personajes caminando (según trades activos)
- [x] Re-renderizado automático al cambiar portfolio

### 🤖 IA de Batalla (NUEVO v1.1)
- [x] API route `/api/chat` con GPT-4o-mini
- [x] System prompt **dinámico** que lee el estado real del juego:
  - Balance, nivel, XP, win rate, casa, holdings
  - Trades activos con P&L en vivo
  - Stats de batallas del día
- [x] Componente `BattleAIChat` con:
  - Historial de conversación completo
  - UI glassmorphism + animaciones
  - Auto-scroll, Enter para enviar
  - Botón de reinicio de chat
- [x] Hook `useAIChat` que gestiona conversaciones + API calls
- [x] IA temática de HodlVille: habla como NPC de RPG, en español
- [x] Stats de batallas **dinámicos** desde portfolio real

### ⚔️ Página de Batallas (NUEVO v1.1)
- [x] Stats en tiempo real: batallas hoy, win rate, racha, XP ganado
- [x] Lista de guerreros activos con P&L
- [x] Chat IA integrado con análisis de rendimiento

### 🎨 Assets Visuales — Sprites FAL.ai
- [x] **5 casas** — tent, wood, stone, mansion, castle (48×40 a 88×64)
- [x] **8 personajes** — warrior/merchant × 4 exchanges (32×48)
- [x] **1 fondo** — world_background (640×360)
- [x] **8 sheets** — animación 4-frames para cada personaje
- [x] Generados con FAL.ai Flux, resize NEAREST, fondo transparente

### 🎨 UI/UX
- [x] Tema oscuro (#0a0a1a, #1a1a3a)
- [x] Aurora Background animado en landing
- [x] Glassmorphism + animaciones framer-motion
- [x] Navbar con XP bar, balance animado, avatar
- [x] Landing page con features + CTA
- [x] - [x] Loading states + shimmer effects

### 📁 Estructura del Proyecto
```
hodlville/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page (Aurora bg)
│   │   ├── layout.tsx            # Root layout + AuthGate
│   │   ├── globals.css           # Glassmorphism + pixel theme
│   │   ├── dashboard/page.tsx    # Trading dashboard
│   │   ├── world/page.tsx        # Mundo pixel
│   │   ├── battles/page.tsx      # Batallas + IA chat
│   │   ├── auth/callback/page.tsx
│   │   └── api/chat/route.ts     # OpenAI GPT-4o-mini endpoint
│   ├── components/
│   │   ├── Chart.tsx
│   │   ├── TradePanel.tsx
│   │   ├── World.tsx
│   │   ├── Navbar.tsx
│   │   ├── LoginModal.tsx
│   │   ├── BattleAIChat.tsx      # Chat IA funcional
│   │   └── ui/
│   │       ├── aurora-background.tsx
│   │       └── animated-ai-chat.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePortfolio.ts
│   │   └── useAIChat.ts          # Hook de chat IA
│   ├── lib/  (gameLogic, supabase, web3)
│   └── types/
├── public/sprites/               # 23 archivos (14 sprites + 8 sheets + bg_tile)
├── .env.local                    # OPENAI_API_KEY + Supabase
└── ROADMAP.md
```

---

## 📋 Por Hacer (Priorizado)

### 🗄️ Supabase Real (DB) — PRÓXIMO
- [ ] Crear proyecto en supabase.com
- [ ] Ejecutar migraciones SQL (`supabase/migrations/001_init.sql`)
- [ ] Conectar stores a Supabase en vez de localStorage
- [ ] Row Level Security (RLS)

### 🚀 Deploy
- [ ] Conectar repo a Vercel para deploy automático
- [ ] Configurar `OPENAI_API_KEY` en Vercel env vars
- [ ] Configurar Supabase env vars en Vercel

### ⚔️ Mejoras de Gameplay
- [ ] Duelos entre personajes (batalla PvE automática)
- [ ] Misiones diarias: "Haz 3 trades largos de BTC" → recompensa
- [ ] Leaderboard: mejores traders
- [ ] Logros / Achievements
- [ ] Tienda de skins

### 📊 Trading — Más Features
- [ ] Más pares (ADA, DOT, LINK)
- [ ] OCO orders (TP + SL)
- [ ] Conectar a API de precios real (Binance/CoinGecko)
- [ ] Order book visual

### 🌍 Mundo — Más Features
- [ ] Mapa scrollable (chunks infinitos)
- [ ] Casas de otros jugadores visibles
- [ ] Zonas por exchange (BingX District, Hyperliquid Harbor)
- [ ] Chat global en el mundo
- [ ] Eventos/torneos

### 🔧 Técnico
- [ ] PWA (instalable como app)
- [ ] Tests unitarios
- [ ] CI/CD con GitHub Actions

---

## 🚀 Cómo Continuar

```bash
# 1. Clonar
git clone https://github.com/420btc/cryptoniax hodlville
cd hodlville

# 2. Instalar
npm install

# 3. Configurar API key de OpenAI
# Copia OPENAI_API_KEY de ~/.hermes/.env a .env.local
# O ejecuta: source ~/.hermes/.env && npm run dev

# 4. Dev
npm run dev  # → http://localhost:3000

# 5. Build
npm run build
```

### Prioridades recomendadas:
1. **OpenAI key en .env.local** → copiarla de `~/.hermes/.env` para que el chat IA funcione
2. **Supabase real** → crear proyecto, migraciones, RLS
3. **Deploy Vercel** → conectar repo, build automático
4. **Duelos entre personajes** → la feature más diferencial
5. **Misiones + logros** → retención de jugadores

---

## 📐 Notas Técnicas

- **Chart**: lightweight-charts con datos mock. Conectar a Binance REST + WebSocket para real.
- **PixiJS**: v7, `image-rendering: pixelated`. Mundo se redibuja al cambiar holdings/trades.
- **Auth**: MetaMask firma mensaje. Supabase OAuth. Guest mode con estado local.
- **Estados**: Zustand stores client-side (no SSR). Sincronizan UI sin prop drilling.
- **IA Chat**: GPT-4o-mini vía API route de Next.js. System prompt dinámico construido desde portfolio state. Máximo 10 mensajes de historial para ahorrar tokens.
- **Fees**: 0.1% por entrada + salida.
- **XP System**: `XP = amount * leverage * 0.1 + (pnl > 0 ? pnl * 10 : 0)`. Nivel = `floor(sqrt(XP/100)) + 1`.
- **Sprites**: FAL.ai Flux, resize NEAREST, fondo blanco → transparente vía corner-sampling. 14 sprites + 8 sheets.

---

*HodlVille — Donde tus HODLs construyen tu reino*
*Creado: 18 Mayo 2026 · v1.1*
