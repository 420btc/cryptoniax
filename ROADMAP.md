# 🏡 HodlVille — Roadmap

> **HodlVille**: Juego 2D pixel art donde tus HODLs construyen tu reino y tus trades forjan tus héroes.
> Trading simulado con charts reales (BTC/ETH/SOL), economía virtual, personajes por exchange, y mundo pixelado.

---

## ✅ Hecho (v1.0 — 18 Mayo 2026)

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
- [x] Auth callback page
- [x] Auth gate — redirige no logueados al login
- [x] Navbar con balance, avatar y logout

### 📊 Trading (Paper Trading)
- [x] 3 charts: BTC/USDT, ETH/USDT, SOL/USDT
- [x] Chart con velas + volumen + tiempo real simulado
- [x] Selector de símbolo intercambiable
- [x] Panel de nueva orden:
  - [x] Spot / Futuros toggle
  - [x] Long / Short
  - [x] Cantidad en $
  - [x] Apalancamiento (1x-100x)
  - [x] Selector de exchange (BingX, Hyperliquid, Bybit, Uniswap, Other)
- [x] Trades activos con P&L en tiempo real
- [x] Historial de trades cerrados
- [x] Estadísticas: Balance, Win Rate, P&L Total
- [x] Sistema de monedas virtuales (10,000 iniciales)
- [x] Fees simulados (0.1% por trade)
- [x] Economía de juego: ganar/perder afecta balance

### 👤 Personajes (Trade → Héroe)
- [x] Cada trade abierto crea un personaje único
- [x] Spot → Mercader | Futuros → Guerrero
- [x] Color e insignia según exchange:
  - ⚡ BingX (dorado #F0B90B)
  - 🌊 Hyperliquid (cian #00E6FF)
  - 🔥 Bybit (naranja #F7A600)
  - 🦄 Uniswap (rosa #FF007A)
  - ✦ Other (gris)
- [x] Sistema de niveles por XP (ganar trade → XP up, perder → XP down)
- [x] Stats: HP, Attack, Defense (escalan con nivel)
- [x] Personajes renderizados en el mundo PixiJS

### 🏠 Holdings → Casa
- [x] Sistema de holdings (BTC/ETH/SOL)
- [x] Nivel de casa según cantidad HODLeada
- [x] Estilos de casa según nivel:
  - Lv.1 → Tienda de campaña 🏕️
  - Lv.2-4 → Casa de madera 🪵
  - Lv.5-9 → Casa de piedra 🪨
  - Lv.10-14 → Mansión 🏛️
  - Lv.15+ → Castillo 🏰
- [x] Renderizado 2D pixel en el mundo (con techo, puertas, ventanas)
- [x] Animación flotante suave

### 🌍 Mundo Pixel (PixiJS)
- [x] Canvas con grid estilo pixel
- [x] Renderizado de casa del jugador
- [x] Personajes caminando (según trades activos)
- [x] Re-renderizado automático al cambiar portfolio
- [x] Responsive (se adapta al ancho)

### 🎨 UI/UX
- [x] Tema oscuro (#0a0a1a, #1a1a3a)
- [x] Estética pixel con bordes pixelados
- [x] Glow effects (profit verde, loss rojo, purple accent)
- [x] Fuente Press Start 2P para títulos
- [x] Landing page con features
- [x] Dashboard layout con navbar sticky
- [x] Loading states

### 📁 Estructura del Proyecto
- [x] `src/types/` — Tipos compartidos
- [x] `src/lib/` — Lógica de negocio (gameLogic, supabase, web3)
- [x] `src/hooks/` — Zustand stores (useAuth, usePortfolio)
- [x] `src/components/` — Componentes (Chart, TradePanel, World, Navbar, LoginModal)
- [x] `src/app/` — Páginas (/, /dashboard, /world, /auth/callback)
- [x] Paquete de declaraciones TypeScript (declarations.d.ts)

---

## 🔄 En Progreso

### 🚀 Deploy
- [ ] Repo subido a GitHub (pendiente token/SSH del usuario)
- [ ] Conectar repo a Vercel para deploy automático
- [ ] Configurar variables de entorno en Vercel (SUPABASE_URL, SUPABASE_ANON_KEY)
- [ ] Setup de Supabase project (actualmente mockeado)

### 🗄️ Supabase Real (DB)
- [ ] Crear proyecto en supabase.com
- [ ] Migraciones SQL para tablas:
  - `profiles` (id, username, email, avatar, hodl_coins, xp, level)
  - `holdings` (user_id, symbol, amount)
  - `trades` (user_id, symbol, type, side, exchange, entry_price, amount, leverage, pnl, status)
  - `characters` (user_id, trade_id, type, exchange, level, xp, hp, attack, defense, color, insignia)
  - `houses` (user_id, level, style, size, x, y, decorations)
- [ ] Row Level Security (RLS) policies
- [ ] Reemplazar mock data por llamadas reales a Supabase

---

## 📋 Por Hacer (Priorizado)

### 🎨 Assets Visuales (Pixel Art por IA)
- [ ] Generar sprites de personajes por exchange (BingX knight, Hyperliquid mage, etc.)
- [ ] Sprites de casas: tienda, madera, piedra, mansión, castillo
- [ ] Tileset del mundo: suelo, árboles, caminos, agua
- [ ] Efectos: partículas al ganar/perder trade, sparkles en casa
- [ ] UI icons pixel art

### ⚔️ Mejoras de Gameplay
- [ ] Múltiples jugadores en el mismo mundo (tiempo real)
- [ ] Mini-juegos: duelos entre personajes de distintos traders
- [ ] Misiones diarias: "Haz 3 trades largos de BTC" → recompensa en monedas
- [ ] Leaderboard: mejores traders del mundo
- [ ] Logros / Achievements ("Primer trade", "100 trades", "Castillo de BTC")
- [ ] Tienda de skins para personajes y casas

### 📊 Trading — Más Features
- [ ] Más pares: añadir SOL, ADA, DOT, LINK (configurable)
- [ ] OCO orders (One Cancels Other: TP + SL)
- [ ] Margin info en tiempo real (liquidation price simulation)
- [ ] Funding rate simulado para futuros
- [ ] Order book visual (depth chart)
- [ ] Historial de precios real (conectar a API pública: Binance, CoinGecko)

### 🌍 Mundo — Más Features
- [ ] Mapa scrollable (infinite world con chunks)
- [ ] Vecindario: casas de otros jugadores visibles
- [ ] Zonas del mundo según exchange (BingX District, Hyperliquid Harbor)
- [ ] Chat global en el mundo
- [ ] Eventos en vivo: torneos de trading con premios

### 🔧 Técnico
- [ ] Tests unitarios (Jest + React Testing Library)
- [ ] PWA (instalable como app)
- [ ] Modo offline (service worker)
- [ ] CI/CD con GitHub Actions
- [ ] Analytics (qué trades son más populares, etc.)

---

## 🏗️ Arquitectura Actual

```
hodlville/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout (providers + auth gate)
│   │   ├── globals.css           # Estilos globales + pixel theme
│   │   ├── dashboard/page.tsx   # Trading dashboard
│   │   ├── world/page.tsx       # Mundo pixel
│   │   └── auth/callback/page.tsx # OAuth callback
│   ├── components/
│   │   ├── Chart.tsx             # TradingView lightweight chart
│   │   ├── TradePanel.tsx        # Panel de trading completo
│   │   ├── World.tsx             # PixiJS mundo pixel (casa + personajes)
│   │   ├── Navbar.tsx            # Navegación + balance
│   │   └── LoginModal.tsx        # Modal login Google + MetaMask
│   ├── hooks/
│   │   ├── useAuth.ts            # Auth store (zustand + supabase)
│   │   └── usePortfolio.ts       # Portfolio store (trades, holdings, coins, chars)
│   ├── lib/
│   │   ├── gameLogic.ts          # XP, levels, character stats, house levels
│   │   ├── supabase.ts           # Cliente Supabase browser
│   │   └── web3.tsx              # Config wagmi + MetaMask connector
│   └── types/
│       ├── index.ts              # Tipos compartidos
│       └── declarations.d.ts     # Type declarations (pixi.js, @supabase/ssr)
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 🚀 Cómo Continuar

### Si usas Gemini Pro / Claude / etc. en el IDE:

```bash
# 1. Clonar
git clone https://github.com/420btc/cryptoniax hodlville
cd hodlville

# 2. Instalar
npm install

# 3. Variables de entorno (crear .env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# 4. Dev
npm run dev  # → http://localhost:3000

# 5. Build
npm run build
```

### Prioridades recomendadas:
1. **Supabase real** → crear proyecto, migraciones, RLS
2. **Deploy Vercel** → conectar repo, build automático
3. **Assets IA** → generar sprites pixel art
4. **Mundo multijugador** → la feature más diferencial
5. **Misiones + logros** → retención de jugadores

---

## 📐 Notas Técnicas

- **Chart**: usa `lightweight-charts` (TradingView) con datos mock. Conectar a API real (Binance REST + WebSocket) para producción.
- **PixiJS**: versión 7, renderizado con `image-rendering: pixelated`. El mundo se redibuja al cambiar holdings/trades.
- **Auth**: MetaMask firma mensaje para verificar propiedad. Supabase maneja sesiones Google OAuth.
- **Estados**: Zustand stores sincronizan UI sin prop drilling. Las stores son client-side (no SSR).
- **Fees**: 0.1% por entrada + salida simulando exchange real.
- **XP System**: `XP = amount * leverage * 0.1 + (pnl > 0 ? pnl * 10 : 0)`. Nivel = `floor(sqrt(XP/100)) + 1`.

---

*HodlVille — Donde tus HODLs construyen tu reino*
*Creado: 18 Mayo 2026*
