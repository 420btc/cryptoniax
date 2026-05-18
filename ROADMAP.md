# 🏡 HodlVille — Roadmap v2.0

> **HodlVille**: Juego 2D pixel art donde tus HODLs construyen tu reino y tus trades forjan tus héroes.
> Trading simulado con charts reales (BTC/ETH/XRP/SOL vía Binance), economía virtual, personajes por exchange, y mundo pixelado.

---

## ✅ Hecho (v2.0 — 18 Mayo 2026)

### 🏗️ Proyecto Base
- [x] Next.js 14 + TypeScript + TailwindCSS
- [x] PixiJS 7 para render 2D del mundo pixel
- [x] TradingView Lightweight Charts — **4 paneles separados y sincronizados**
- [x] Supabase (Google Auth) + wagmi/viem (MetaMask Auth)
- [x] Zustand para estado global
- [x] Arquitectura de componentes modular

### 🔐 Autenticación
- [x] Login con Google (Supabase OAuth)
- [x] Login con MetaMask (wagmi + ethers)
- [x] Login como Invitado (sin registro)
- [x] Auth gate con redirects: `/` → `/dashboard` cuando hay sesión

### 📊 Trading (Paper Trading con DATOS REALES)
- [x] **4 símbolos**: BTC, ETH, XRP, SOL
- [x] **Hook `useRealtimeCrypto`** — Binance REST (velas 120d) + WebSocket (precio en vivo)
- [x] **Chart multi-pane** (4 paneles independientes sincronizados):
  - Principal (300px): Velas + EMA9/21 + Bollinger(20,2) + trades activos
  - Volumen (80px): Histograma real
  - MACD (130px): Línea + Señal + Histograma (12,26,9)
  - RSI (110px): Línea + niveles 70/30
- [x] Panel de nueva orden: Spot/Futuros, Long/Short, Cantidad, Apalancamiento, Exchange
- [x] Trades activos con P&L en tiempo real + marcadores en chart
- [x] Historial de trades cerrados
- [x] Estadísticas: Balance, Win Rate, P&L Total, Mejor Trade
- [x] Sistema de monedas virtuales (10,000 iniciales)

### 👤 Personajes (Trade → Héroe)
- [x] Cada trade abierto crea un personaje único
- [x] Spot → Mercader | Futuros → Guerrero
- [x] Color e insignia según exchange: ⚡ BingX, 🌊 Hyperliquid, 🔥 Bybit, 🦄 Uniswap
- [x] Sistema de niveles por XP
- [x] Stats: HP, Attack, Defense

### 🏠 Holdings → Casa
- [x] Sistema de holdings (BTC/ETH/SOL)
- [x] Nivel de casa según cantidad HODLeada
- [x] Estilos: Tienda → Madera → Piedra → Mansión → Castillo

### 🌍 Mundo Pixel (PixiJS)
- [x] Canvas con grid estilo pixel + personajes caminando
- [x] **Fix crash**: null ticker.remove() en cleanup
- [x] Sprites v2 con gpt-image-2 en generación (27/94 completados, bg)

### 🌍 Globo 3D de Batallas (NUEVO)
- [x] **BattleGlobe.tsx** — esfera WebGL Three.js con:
  - Grid latitud/longitud, atmósfera glow, estrellas
  - 9 traders mock + tu ubicación real (opt-in geolocalización)
  - Auto-rotación + drag manual
  - Click en marcador → tarjeta de info + "Retar a Batalla"
- [x] Migración Supabase `002_user_locations.sql` para ubicaciones reales
- [x] Página `/battles` con tabs: Globo 3D / Chat IA

### 🤖 IA de Batalla
- [x] API route `/api/chat` con GPT-4o-mini
- [x] System prompt dinámico desde estado real del portfolio
- [x] Componente `BattleAIChat` — glassmorphism, historial, Enter para enviar

### 🎨 Assets Visuales
- [x] Sprites v1: 14 sprites + 8 sheets (FAL Flux, 32-88px)
- [x] **Sprites v2 en progreso**: gpt-image-2 1024×1024 medium quality
  - 27/94 generados (~$1.00 usado de $8.90)
  - Script `scripts/gen_v2.py` corriendo en background
  - Héroes: 4 exchanges × 2 tipos × 5 niveles = 40
  - Casas: 5 estilos × 5 niveles = 25
  - Items: 20 + Fondos: 5 + Jefes: 4

### 🎨 UI/UX
- [x] Tema oscuro glassmorphism + Aurora Background
- [x] Animaciones framer-motion
- [x] XRP muestra 4 decimales en precio ($2.3147)
- [x] Indicador "● Binance" confirmando datos reales

### 📁 Estructura Actual del Proyecto
```
hodlville/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing (Aurora bg)
│   │   ├── layout.tsx                # Root + AuthGate
│   │   ├── globals.css               # Glassmorphism + pixel theme
│   │   ├── dashboard/page.tsx        # Trading dashboard
│   │   ├── world/page.tsx            # Mundo pixel 2D
│   │   ├── battles/page.tsx          # Globo 3D + Chat IA
│   │   ├── auth/callback/page.tsx
│   │   └── api/chat/route.ts         # GPT-4o-mini endpoint
│   ├── components/
│   │   ├── Chart.tsx                 # Multi-pane con datos reales Binance
│   │   ├── TradePanel.tsx            # Panel de trading + stats
│   │   ├── World.tsx                 # Mundo PixiJS
│   │   ├── BattleGlobe.tsx           # Globo 3D Three.js
│   │   ├── BattleAIChat.tsx          # Chat IA
│   │   ├── Navbar.tsx
│   │   ├── LoginModal.tsx
│   │   ├── LossOverlay.tsx
│   │   └── ui/
│   │       ├── aurora-background.tsx
│   │       └── animated-ai-chat.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePortfolio.ts
│   │   ├── useAIChat.ts
│   │   └── useRealtimeCrypto.ts      # Binance REST + WebSocket
│   ├── lib/
│   │   ├── gameLogic.ts
│   │   ├── supabase.ts
│   │   └── web3.ts
│   └── types/
│       └── index.ts                  # BTC,ETH,XRP,SOL + BINANCE_SYMBOLS
├── supabase/
│   └── migrations/
│       ├── 001_init.sql
│       └── 002_user_locations.sql
├── scripts/
│   └── gen_v2.py                     # Sprites gpt-image-2 vía FAL
├── public/sprites/v2/                # 27/94 sprites 1024×1024
├── .env.local                        # OPENAI_API_KEY + Supabase
└── ROADMAP.md
```

---

## 📋 Por Hacer (Priorizado)

### 🔴 URGENTE — Para continuar en Windows con Gemini Pro

#### 1️⃣ Copiar carpeta a Windows
```powershell
# En PowerShell como Admin:
wsl -d Ubuntu
cp -r /home/choco/hodlville /mnt/c/Users/choco/OneDrive/Escritorio/hodlville
```
O usar `\\wsl$\Ubuntu\home\choco\hodlville` desde Explorador.

#### 2️⃣ Configurar .env.local en Windows
El archivo YA EXISTE en `/home/choco/hodlville/.env.local`. Copiarlo junto con la carpeta.
Contiene: `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 3️⃣ Instalar dependencias en Windows
```bash
cd Escritorio/hodlville
npm install
npm run dev   # → http://localhost:3000
```

### 🗄️ Supabase Real (DB)
- [ ] Crear proyecto en supabase.com
- [ ] Ejecutar migraciones: `001_init.sql` + `002_user_locations.sql`
- [ ] Conectar stores a Supabase en vez de localStorage
- [ ] Row Level Security (RLS)

### 🚀 Deploy
- [ ] Conectar repo `420btc/cryptoniax` a Vercel
- [ ] Configurar env vars en Vercel (OPENAI_API_KEY, Supabase)
- [ ] Build automático en cada push

### 🎨 Sprites v2 — Terminar generación
- [ ] Esperar que terminen los 94 sprites (~$3.48)
- [ ] Verificar calidad, regenerar los malos
- [ ] Posible 2ª tanda: variaciones con items equipados (~$5.42 restantes)
- [ ] Actualizar World.tsx para usar sprites v2 con niveles

### ⚔️ Mejoras de Gameplay
- [ ] Duelos PvE automáticos entre personajes
- [ ] Misiones diarias: "Haz 3 trades largos de BTC" → recompensa
- [ ] Leaderboard global con Supabase
- [ ] Logros / Achievements
- [ ] Tienda de skins

### 🌍 Globo 3D — Conectar a datos reales
- [ ] Conectar BattleGlobe a Supabase `user_locations`
- [ ] API route para POST/GET ubicaciones
- [ ] WebSocket para posiciones en tiempo real
- [ ] Sistema de desafíos entre jugadores

### 📊 Trading — Más Features
- [ ] Más pares (ADA, DOGE, LINK, AVAX)
- [ ] OCO orders (TP + SL simultáneos)
- [ ] Order book visual con WebSocket de Binance
- [ ] Depth chart

### 🌍 Mundo — Más Features
- [ ] Mapa scrollable (chunks infinitos)
- [ ] Casas de otros jugadores visibles
- [ ] Zonas temáticas por exchange
- [ ] Chat global
- [ ] Eventos/Torneos programados

### 🔧 Técnico
- [ ] PWA (instalable como app)
- [ ] Tests unitarios con Vitest
- [ ] CI/CD con GitHub Actions
- [ ] Rate limiting en API routes
- [ ] Edge Functions en Supabase para lógica server-side

---

## 🚀 Cómo Continuar (Windows + Gemini Pro IDE)

```bash
# 1. Copiar de WSL a Windows
# Desde PowerShell o Explorador:
# \\wsl$\Ubuntu\home\choco\hodlville → C:\Users\choco\OneDrive\Escritorio\

# 2. Abrir en tu IDE (VS Code / Cursor / Windsurf)
cd C:\Users\choco\OneDrive\Escritorio\hodlville
code .

# 3. Instalar dependencias
npm install

# 4. Variables de entorno (YA EXISTEN en .env.local)
# OPENAI_API_KEY=sk-proj-...
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...

# 5. Arrancar
npm run dev
# → http://localhost:3000

# 6. Build para producción
npm run build
```

### 🎯 Prioridades para Gemini Pro:
1. **Terminar sprites v2** — esperar que acabe `gen_v2.py` o ejecutarlo en Windows
2. **Supabase real** — crear proyecto, ejecutar migraciones SQL
3. **Conectar stores a Supabase** — reemplazar localStorage por queries
4. **Deploy Vercel** — conectar repo, configurar env vars
5. **Globo 3D con datos reales** — API routes + WebSocket para ubicaciones
6. **Duelos PvE** — sistema de batalla automática entre personajes

---

## 📐 Notas Técnicas

- **Chart**: lightweight-charts v4 con **4 instancias separadas sincronizadas**. Datos de Binance REST (klines 1d) + WebSocket (ticker en vivo). WebSocket singleton con reconnect a 3s.
- **PixiJS**: v7, `image-rendering: pixelated`. Fix: `appRef.current?.ticker` antes de cleanup.
- **BattleGlobe**: Three.js WebGL, esfera con grid lat/long, atmósfera glow, estrellas, auto-rotación.
- **Auth**: MetaMask firma mensaje. Supabase OAuth. Guest mode con estado local.
- **Estados**: Zustand stores client-side. Próximo paso: migrar a Supabase.
- **IA Chat**: GPT-4o-mini vía `/api/chat`. System prompt dinámico desde portfolio.
- **Fees**: 0.1% por entrada + salida.
- **XP**: `XP = amount * leverage * 0.1 + (pnl > 0 ? pnl * 10 : 0)`. Nivel = `floor(sqrt(XP/100)) + 1`.
- **Sprites v2**: gpt-image-2 vía FAL.ai, 1024×1024 medium quality (~$0.037/img). FAL key en `scripts/gen_v2.py`.
- **FAL key**: `db8964c5-dba3-433a-a9be-760ad5bca943:3f8d591a-1d36-40ce-a5ac-27f0c1b1dd2c`
- **GitHub**: repo `420btc/cryptoniax`, token `ghp_IX...` con scope repo.
- **Binance API**: pública, sin key. REST `api.binance.com/api/v3/klines`, WS `stream.binance.com:9443/ws`.

---

## 🔑 Credenciales (para Gemini Pro)

> **IMPORTANTE**: Estas credenciales están en los archivos del proyecto. No las subas a GitHub público.

| Servicio | Archivo | Variable |
|----------|---------|----------|
| OpenAI | `.env.local` | `OPENAI_API_KEY=sk-proj-...` |
| Supabase | `.env.local` | `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` |
| FAL.ai | `scripts/gen_v2.py` | `FAL_KEY=db8964c5-...` |
| GitHub | Push URL | Token `ghp_IX...` en git remote |

---

*HodlVille v2.0 — Donde tus HODLs construyen tu reino*
*Creado: 18 Mayo 2026 · Última actualización: 18 Mayo 2026 05:30*
