# 🏡 HodlVille — Paper Trading Gamificado

**Donde tus HODLs construyen tu reino y tus trades forjan tus héroes.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![PixiJS](https://img.shields.io/badge/PixiJS-7-f00060)](https://pixijs.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

---

## 📋 Índice para Otra IA

Este README está escrito para que **otra IA o desarrollador** pueda entender TODO el proyecto en 5 minutos y continuar el desarrollo sin preguntar. Estructura:

1. [Arquitectura General](#-arquitectura-general)
2. [Stack Completo](#-stack-completo)
3. [Páginas y Componentes](#-páginas-y-componentes-clave)
4. [Sistema de Diseño](#-sistema-de-diseño)
5. [Estado Actual (lo que funciona)](#-estado-actual)
6. [Problemas Conocidos (lo que está roto)](#-problemas-conocidos)
7. [TODO Masivo por Prioridad](#-todo-masivo-por-prioridad)
8. [Detalles Técnicos para Otra IA](#-detalles-técnicos-para-otra-ia)
9. [Variables de Entorno](#-variables-de-entorno)
10. [Quick Start](#-quick-start)

---

## 🏗️ Arquitectura General

```
┌─ Landing Page (/) ───────────────────────────────┐
│  Hero + Aurora background + Features + LoginModal │
│  (Solo visible SIN sesión)                        │
└───────────────────────────────────────────────────┘
                        │
            (Login: Guest o MetaMask)
                        ▼
┌─ AuthGate (layout.tsx) ──────────────────────────┐
│  ├─ NO session   → Landing page                  │
│  ├─ session + /  → Loader → redirect /dashboard  │
│  ├─ Guest + protected → Bloqueo con upgrade CTA  │
│  └─ session      → Navbar + children + Footer    │
└───────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  /dashboard  │ │ /kingdom │ │  /world      │
│  TradePanel  │ │PixiJS    │ │PixiJS Biomes │
│  Chart       │ │Canvas    │ │Canvas        │
│  Faucet+Qs   │ │NPCs+     │ │Players+      │
└──────────────┘ │Buildings │ │Biomes        │
                 └──────────┘ └──────────────┘
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  /battles    │ │ /housing │ │  /auth/      │
│  Arena+Chat  │ │ View/    │ │  callback    │
│  (protected) │ │ Upgrade  │ │  (OAuth)     │
└──────────────┘ │ Decorate │ └──────────────┘
                 └──────────┘
```

### Flujo de Estado

```
Zustand Stores (client-side, persiste en memoria):
├── useAuthStore (session, profile, isGuest)
│   ├── connectMetaMask() → address → supabase signInAnonymously()
│   │   → updateProfile with wallet → initFromSupabase(userId)
│   └── signInAsGuest() → fake session + portfolio seed
│       → initFromSupabase salta para guest (skip Supabase)
│
└── usePortfolioStore (coins, trades, holdings, house, level)
    ├── initFromSupabase(userId) → fetchAll → subscribeToChanges
    ├── openTrade({symbol, type, side, exchange, ...})
    │   ├── userId && userId!=='guest' → createTrade() en Supabase
    │   └── userId==='guest' → local zustand set()
    ├── checkTradeLimits(symbol, currentPrice)
    │   └── TP/SL hit → close (Supabase o local según userId)
    └── addCoins(), addXp()
```

### Dependencias Clave

```json
{
  "pixi.js": "^7.3.0",        // Canvas 2D game rendering
  "lightweight-charts": "^4.1.0", // TradingView charts
  "zustand": "^4.5.0",        // Estado global
  "framer-motion": "^12.38.0", // Animaciones UI
  "lucide-react": "^0.400.0", // Iconos
  "@supabase/supabase-js": "^2.45.0",
  "wagmi": "^2.12.0",         // MetaMask
  "viem": "^2.17.0"
}
```

---

## 🛠️ Stack Completo

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Framework | Next.js 14 (App Router) | SSR/SSG, 11 páginas estáticas |
| Lenguaje | TypeScript 5.5 | Tipado estricto |
| Estilos | TailwindCSS 3 + CSS custom props | Design tokens, glassmorphism |
| 2D Rendering | PixiJS 7.3 | Canvas para Reino y Mundo |
| Charts | lightweight-charts 4.1 | TradingView-style multi-pane |
| Estado | Zustand 4.5 | Stores de auth y portfolio |
| Auth | Supabase (anónimo) + wagmi (MetaMask) | Sin Google OAuth |
| Base de Datos | Supabase PostgreSQL (opcional) | Persistencia real |
| Animaciones | Framer Motion 12.38 | UI animations, layoutId |
| Iconos | Lucide React 0.400 | Todos los iconos del juego |
| Deploy | Vercel | Auto-deploy desde GitHub |

### PixiJS v7.3 ⚠️ TypeScript Workaround

PixiJS 7.3 tiene types incompletos para `Graphics`. Las propiedades `eventMode`, `cursor`, `on()`, `alpha`, `scale`, `x`, `y` existen en runtime pero fallan en TypeScript. **Solución:** castear a `any` en todos los sitios de interacción.

Ver `src/lib/gameEngine.ts` y `src/components/KingdomCanvas.tsx` para el patrón correcto.

---

## 📄 Páginas y Componentes Clave

### `/` — Landing Page (`src/app/page.tsx`)
- Hero con Aurora background + cover_epic.png
- Solo visible para usuarios SIN sesión
- LoginModal con MetaMask + Invitado
- Scroll sections: Features, How it Works, CTA final

### `/dashboard` — Trading (`src/app/dashboard/page.tsx`)
- TradePanel: chart multi-pane + active trades + historial
- FaucetButton (daily coins) + DailyQuests
- AchievementsStrip (logros desbloqueados)
- Symbol tabs: BTC, ETH, SOL (con XRP, DOGE en la store)
- Stats: Balance, Win Rate, P&L Total, Best Trade

### `/kingdom` — Reino (`src/app/kingdom/page.tsx`)
- **PixiJS Canvas** vía `KingdomCanvas.tsx`
- NPCs caminando con rutas aleatorias (herrry, mercader, mago, banquero)
- Edificios con glow pulsante (Banco BTC, Academia ETH, Mercado SOL, etc.)
- Tu casa en el centro con float animation
- Partículas ambientales (luciérnagas)
- Click en edificios/NPCs → panel de info
- CSS overlay: resource bars + heroes activos + quick actions

### `/world` — Mundo (`src/app/world/page.tsx`)
- **PixiJS Canvas** vía `PixiWorld.tsx`
- 6 biomas interactivos (Ciudad Central, Bosque, Montañas, Desierto, Volcán, Playa)
- Puntos de jugador con float animation + status online/offline
- Partículas climáticas por bioma
- Tooltips hover en biomas y players
- Leyenda + stats overlay

### `/battles` — Batallas (protected, requiere MetaMask)
- BattleArena (simulación de combate)
- BattleTavernChat (chat con bots NPC)
- Stats: batallas hoy, win rate, racha

### `/housing` — Casas (protected, requiere MetaMask)
- 3 tabs: Ver casa, Mejorar, Decorar
- Progresión: tienda → madera → piedra → mansión → castillo
- Decorations shop con style-gating

### Componentes Compartidos

| Componente | Archivo | Propósito |
|-----------|---------|-----------|
| `Navbar` | `Navbar.tsx` | Sticky nav con tabs animados + stats inline |
| `Footer` | `Footer.tsx` | Links + branding |
| `BackButton` | `BackButton.tsx` | ← Volver al dashboard |
| `LoginModal` | `LoginModal.tsx` | MetaMask + Invitado |
| `ProfileModal` | `ProfileModal.tsx` | Popup perfil desde navbar |
| `Chart` | `Chart.tsx` | Multi-pane chart (candles, EMA, volume, MACD, RSI) |
| `TradePanel` | `TradePanel.tsx` | Formulario + lista trades activos + historial |
| `KingdomCanvas` | `KingdomCanvas.tsx` | PixiJS kingdom scene |
| `PixiWorld` | `PixiWorld.tsx` | PixiJS interactive biome world |
| `FaucetButton` | `FaucetButton.tsx` | Daily coins (24h cooldown) |
| `DailyQuests` | `DailyQuests.tsx` | 3 daily quests auto-detect |
| `AchievementsStrip` | `AchievementsStrip.tsx` | Horizontal achievement badges |

### Stores y Hooks

| Hook | Store | Estado |
|------|-------|--------|
| `useAuth` | `useAuthStore` | session, profile, isGuest, connectMetaMask, signInAsGuest |
| `usePortfolio` | `usePortfolioStore` | userId, coins, trades, holdings, house, level, xp |

### Librerías de Juego

| Archivo | Propósito |
|---------|-----------|
| `lib/gameEngine.ts` | Sprite loader, texture cache, particle system, label factory, PIXI app creator |
| `lib/gameLogic.ts` | XP formulas, house levels, character stats |
| `lib/achievements.ts` | 29 achievements auto-detect |
| `lib/sfx.ts` | Web Audio API sound effects |
| `lib/notify.ts` | Browser notifications |

---

## 🎨 Sistema de Diseño

### Tokens CSS (`globals.css`)
```css
:root {
  --bg-deep: #05050f;
  --bg-base: #0a0b1e;
  --bg-glass: rgba(17, 19, 38, 0.6);
  --border-subtle: rgba(99, 102, 241, 0.08);
  --accent: #6366f1;
  --profit: #22d65e;
  --loss: #ef4466;
}
```

### Glassmorphism
```css
.glass { background: var(--bg-glass); backdrop-filter: blur(16px); }
.glass-card { @apply glass rounded-xl; box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
```

### Fuentes
- Inter (body), Space Grotesk (headings), JetBrains Mono (números)

### Sprites
149 sprites en `public/sprites/v2/` generados con FAL flux/schnell.
- `hero_{exchange}_{type}_lv{1-5}.png` — 4 exchanges × 4 tipos × 5 niveles
- `house_{style}_lv{1-5}.png` — 5 estilos × 5 niveles
- `item_{name}.png` — 27 items
- `npc_{role}.png` — 4 NPCs
- `pet_{animal}.png` — 6 mascotas
- `prop_{name}.png` — 6 props
- `bg_{1-5}.png` + backgrounds temáticos — 12 fondos
- `fx_{type}.png` — 7 efectos
- `boss_{exchange}.png` — 4 bosses
- `vault_lv{1-5}.png` — 5 vaults
- `cover_epic.png`, `cover_login.png`

---

## ✅ Estado Actual

### Lo que funciona
- [x] Landing page con hero, features, login modal
- [x] Guest login con $1,000 iniciales, trades en memoria (zustand)
- [x] MetaMask connect (signInAnonymously + updateProfile)
- [x] Dashboard con chart multi-pane (candles, EMA, volume, MACD, RSI)
- [x] TradePanel: abrir/cerrar trades, TP/SL, P&L tracking
- [x] FaucetButton (daily 25-50 coins, localStorage cooldown)
- [x] DailyQuests (3 quests auto-detect + collect)
- [x] Kingdom PixiJS canvas (NPCs walking, buildings, particles, interactivity)
- [x] World PixiJS canvas (6 biomes, player dots, hover tooltips)
- [x] Navbar game-style tabs con layoutId animation + inline stats
- [x] BackButton en todas las sub-páginas
- [x] AuthGate: redirect session→dashboard, loader durante redirect
- [x] Guest skip Supabase en openTrade/checkTradeLimits
- [x] Notifications browser API
- [x] SFX Web Audio API (tradeOpen, tradeWin, tradeLose, levelUp)
- [x] Build 0 errores (11 páginas estáticas)
- [x] GitHub push

### Lo que está a medias
- [~] Housing page (CSS only, no PixiJS, funcional pero básico)
- [~] Battles page (battle sim funcional, falta pulir)
- [~] BattleTavernChat (bots con personalidad, funciona standalone)
- [~] Achievements (29 definidos, auto-detect, strip en dashboard)
- [~] ProfileModal (info básica, faltan sprites de héroe reales)
- [~] Chart indicators (funcionan, pero sin sincronización cross-pane perfecta)
- [~] Sprites v2 (149 PNGs, cargan en PixiJS, pero algunos fallbacks mejorables)

---

## ❌ Problemas Conocidos

### CRÍTICOS
1. **Double navbar** — ✅ FIXED (commit df4e7143). Causa: la landing page tenía su propio `<nav>` fijo que competía con el Navbar de la app durante la transición auth. Fix: 
   - Landing Navbar ahora solo se renderiza si `!session` (usa `useAuthStore`)
   - Layout wrapper usa `key={session ? 'authed' : 'anon'}` para forzar remount en cambio de auth
   - AuthGate ya tenía loader para cortocircuitar la landing page cuando hay sesión

2. **Navbar texto oculto** — ✅ FIXED. `hidden xs:block` → `hidden sm:block` (xs no es breakpoint de Tailwind, causaba que el texto "HodlVille" estuviera siempre oculto)

3. **Dashboard con fondo extra** — ✅ FIXED. `bg-aurora-dark` removido del layout wrapper. Causaba una imagen de fondo adicional (`/backgrounds/aurora_dark.png`) que competía visualmente con el contenido del dashboard.

### IMPORTANTES
4. **Trades no persisten en guest** — SOLUCIONADO con `userId !== 'guest'` checks, pero verificar que los trades se muestren correctamente en el panel después de abrir.
5. **guest coins sobrescritas** — SOLUCIONADO con `initFromSupabase` skip para guest. Verificar que el portfolio seed (1000 coins) no se pierde.
6. **World page lenta** — MapboxGlobe intenta cargar y falla. Ahora usa PixiWorld (más rápido), pero el dynamic import puede tardar.
7. **Sprite fallbacks** — Algunos sprites v2 pueden no cargar (nombres incorrectos). PixiJS muestra fallback Graphics de color, pero no es bonito.

### MENORES
8. **Housing page sin PixiJS** — Usa CSS grid y emojis, no sprites v2 reales.
9. **Battles sin sprites de héroes** — Usa emojis en vez de los hero_*.png reales.
10. **Sin sonidos en batallas** — Solo trades tienen SFX.
11. **Sin leaderboard** — No hay ranking de jugadores.
12. **Sin multijugador real** — Los "jugadores online" en el mundo son estáticos.
13. **Sin persistencia real para guest** — Al recargar página, guest pierde todo.
14. **Sin limpieza de cache de texturas PixiJS** — Memory leak potencial en sesiones largas.

---

## 📋 TODO Masivo por Prioridad

### 🔴 P0 — Bugs que rompen la experiencia
- [ ] **Arreglar Navbar para mobile/guest** — Verificar que no haya doble navbar. Simplificar: si el AuthGate ya maneja sesión, el Navbar solo debe tener links funcionales y stats correctas.
- [ ] **Dashboard layout** — Quitar `bg-aurora-dark` si no existe el archivo. Simplificar fondo a `bg-[#0a0a1a]` puro.
- [ ] **Verificar que guest trades se vean en el panel** — Test: login guest, abrir trade BTC $10 long 5x, debe aparecer en "Trades Activos".
- [ ] **Verificar TP/SL funcionan para guest** — checkTradeLimits local debe cerrar trade al alcanzar precio.

### 🟠 P1 — Features rotas/incompletas
- [ ] **Housing PixiJS** — Rewrite housing page con PixiJS canvas mostrando la casa real con sprites v2, animaciones de construcción, decoraciones visibles.
- [ ] **Battles con sprites** — Usar hero_{exchange}_{type}_lv{N}.png en vez de emojis en la arena.
- [ ] **ProfileModal con sprites** — Mostrar el sprite real del héroe según exchange+level.
- [ ] **Persistencia guest en localStorage** — Guardar trades/coins/xp en localStorage para que sobrevivan refrescos. Cargar al iniciar sesión guest.
- [ ] **Sincronización cross-pane de charts** — Los 4 paneles (candles, volume, MACD, RSI) deben scroll sincronizado.
- [ ] **Botón "Cerrar Trade" manual** — Actualmente TP/SL son automáticos. Falta botón para cerrar manual.

### 🟡 P2 — Game feel y pulido
- [ ] **PixiJS transition al cambiar de página** — Fade suave entre Reino y Mundo.
- [ ] **Sprite preloader con barra de progreso** — Mostrar loading progress mientras se cargan los 149 sprites.
- [ ] **Animación de coins ganando/perdiendo** — Números flotantes + partículas más elaborados.
- [ ] **Sonidos en batallas** — SFX para ataques, cura, victoria, derrota.
- [ ] **Sonido ambiente en Reino** — Música de fondo suave (Web Audio API).
- [ ] **Efecto de lluvia/niebla en biomas del Mundo** — Más partículas climáticas.
- [ ] **Tooltips mejorados** — En el chart, en el Navbar stats, en los edificios del Reino.
- [ ] **Responsive: KingdomCanvas en mobile** — Ajustar tamaño del canvas 100% width.

### 🟢 P3 — Contenido nuevo
- [ ] **Más pares de trading** — XRP, DOGE, AVAX, ADA (ya están en types).
- [ ] **Leaderboard** — Tabla de top traders (winrate, P&L, nivel).
- [ ] **Misiones semanales** — Más alla de las daily quests.
- [ ] **Tienda de items** — Comprar items con coins que mejoren stats del héroe.
- [ ] **Sistema de ligas** — Bronce → Plata → Oro → Diamante según winrate/trades.
- [ ] **Pets** — Desbloquear mascotas (6 sprites ya existen) que den bonuses pasivos.
- [ ] **Eventos temporales** — Weekend bonus XP, torneos, etc.
- [ ] **Chat global** — Entre jugadores reales (no solo bots).
- [ ] **Notificaciones push** — Cuando un trade se cierra, level up, etc.

### 🔵 P4 — Técnico / Refactor
- [ ] **Migrar a Supabase real** — Cuando haya usuarios reales, conectar base de datos.
- [ ] **Cache de texturas PixiJS con LRU** — Evitar memory leak.
- [ ] **Tests** — Units para gameLogic, achievements, portfolio.
- [ ] **PWA** — Service worker para offline mode.
- [ ] **CI/CD** — GitHub Actions para lint + build.
- [ ] **Analytics** — Seguimiento de uso de features.
- [ ] **i18n** — Multi-idioma (ES/EN al menos).
- [ ] **Modo oscuro / claro** — Alternativa al dark theme fijo.

---

## 🔧 Detalles Técnicos para Otra IA

### PixiJS en Next.js

```tsx
// Patrón correcto para cargar PixiJS en Next.js (SSR=false)
const PixiWorld = dynamic(() => import('@/components/PixiWorld'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
```

```tsx
// Cleanup obligatorio en useEffect
useEffect(() => {
  const app = createGameApp(container, height);
  appRef.current = app;
  return () => {
    app.destroy(true, { children: true });
    appRef.current = null;
  };
}, []);
```

### Auth Flow (Guest + MetaMask)

**Guest:**
1. `signInAsGuest()` → setea `session`, `isGuest=true`, `porfolio seed`
2. AuthGate detecta session → redirect a `/dashboard`
3. `initUser('guest')` → `initFromSupabase('guest')` → `return` (por el check `userId === 'guest'`)
4. Portfolio se queda con los datos de `signInAsGuest()`
5. `openTrade()` detecta `userId === 'guest'` → modo local (zustand)

**MetaMask:**
1. `connectMetaMask()` → `window.ethereum.request('eth_requestAccounts')`
2. Address → `signInAnonymously()` en Supabase
3. `updateProfile(userId, { wallet_address, email: shortAddress })`
4. `initFromSupabase(userId)` → fetchAll desde Supabase

### Cómo añadir un nuevo par de trading

En `src/types/index.ts`, añadir a `CryptoSymbol`:
```typescript
export type CryptoSymbol = 'BTC' | 'ETH' | 'SOL' | 'XRP' | 'DOGE';  // añadir aquí
```

### Cómo generar nuevos sprites

Usar FAL API (key en .env.local: `db8964c5-dba3-433a-a9be-760ad5bca943:a684d89b1a7a10e6ff9895f2d14ff812`):
```bash
curl -s -X POST https://api.fal.ai/v1/run -H "Authorization: Key $FAL_KEY" ...
```

O usar el script `scripts/gen_sprites_template.py`.

### Reglas de Nombres de Sprites v2

```
hero_{exchange}_{type}_lv{1-5}.png    — exchange: bingx, bybit, hyperliquid, uniswap
                                        type: warrior, merchant, ranger, berserker, mage, druid
house_{style}_lv{1-5}.png             — style: tent, wood_house, stone_house, mansion, castle
item_{name}.png                       — 27 items (swords, armor, rings, capes, etc.)
npc_{role}.png                        — blacksmith, merchant, quest_giver, banker
pet_{animal}.png                      — cat, dog, dragon, fox, owl, phoenix
prop_{name}.png                       — tree_oak, tree_pine, rock, lantern, signpost, portal
bg_{1-5}.png                          — general backgrounds
bg_{theme}.png                        — battle_cave, battle_forest, housing_interior, etc.
boss_{exchange}.png                   — bingx, bybit, hyperliquid, uniswap
fx_{type}.png                         — explosion, fire, heal, lightning, poison, shield
vault_lv{1-5}.png                     — treasure vaults
cover_epic.png, cover_login.png       — landing page backgrounds
```

---

## 🔐 Variables de Entorno

```env
# .env.local — REQUERIDO para MetaMask auth (Supabase anónimo)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Opcional — Mapbox para el globo 3D (actualmente no usado, tenemos PixiWorld)
NEXT_PUBLIC_MAPBOX_TOKEN=

# Opcional — FAL API para generar sprites
FAL_KEY=db8964c5-dba3-433a-a9be-760ad5bca943:a684d89b1a7a10e6ff9895f2d14ff812
```

---

## 🚀 Quick Start

```bash
# Clonar
git clone https://github.com/420btc/cryptoniax hodlville
cd hodlville

# Variables de entorno
cp .env.example .env.local
# Editar .env.local con credenciales de Supabase (opcional para guest mode)

# Instalar
npm install

# Desarrollo
npm run dev    # http://localhost:3000

# Build
npx next build

# Deploy
git push origin main  # Vercel auto-deploy
```

---

## 📁 Estructura Completa (src/)

```
src/
├── app/
│   ├── page.tsx                    # Landing page (hero + login)
│   ├── layout.tsx                  # AuthGate + providers
│   ├── globals.css                 # Design tokens + glass + animations
│   ├── dashboard/page.tsx          # Trading dashboard
│   ├── kingdom/page.tsx            # Reino (resource bars + PixiJS canvas)
│   ├── world/page.tsx              # Mundo (stats + PixiJS biomes)
│   ├── battles/page.tsx            # Batallas (arena + chat)
│   ├── housing/page.tsx            # Casas (3 tabs: view/upgrade/decorate)
│   └── auth/callback/page.tsx      # OAuth callback (unused, anónimo ahora)
├── components/
│   ├── Navbar.tsx                  # Game-style tabs + inline stats
│   ├── Footer.tsx                  # Links + branding
│   ├── BackButton.tsx              # ← Volver al dashboard
│   ├── LoginModal.tsx              # MetaMask + Invitado
│   ├── ProfileModal.tsx            # Popup perfil
│   ├── TradePanel.tsx              # Trading form + active list + history
│   ├── Chart.tsx                   # Multi-pane chart (candles, EMA, MACD, RSI)
│   ├── KingdomCanvas.tsx           # PixiJS kingdom (NPCs, buildings, particles)
│   ├── PixiWorld.tsx               # PixiJS world (6 biomes, players)
│   ├── World.tsx                   # DEPRECATED — old simple PixiJS world
│   ├── BattleArena.tsx             # Battle sim
│   ├── BattleTavernChat.tsx        # Bot NPC chat
│   ├── FaucetButton.tsx            # Daily coins (24h cooldown)
│   ├── DailyQuests.tsx             # 3 daily quests auto-detect
│   ├── AchievementsStrip.tsx       # Achievement badges horizontal
│   ├── MapboxGlobe.tsx             # Fallback 3D globe (sin token, no usado)
│   └── ParticlesProvider.tsx       # Canvas particle overlay
├── hooks/
│   ├── useAuth.ts                  # Zustand store: session, isGuest, connectMetaMask
│   └── usePortfolio.ts             # Zustand store: trades, coins, holdings, house
├── lib/
│   ├── gameEngine.ts               # PixiJS helpers (sprite loader, particles, labels)
│   ├── gameLogic.ts                # XP, house levels, character stats
│   ├── achievements.ts             # 29 achievements definitions
│   ├── supabase.ts                 # Supabase client + CRUD
│   ├── web3.tsx                    # wagmi config + MetaMask
│   ├── sfx.ts                      # Web Audio API sounds
│   └── notify.ts                   # Browser notifications
└── types/
    ├── index.ts                    # CryptoSymbol, Trade, Exchange, etc.
    └── declarations.d.ts           # pixi.js + supabase/ssr type fixes
```

---

## 📝 Notas para la próxima IA

**Lo primero que debe hacer:**
1. Leer este README completo
2. `npm run dev` y probar como invitado
3. Abrir el dashboard, hacer un trade, ver si aparece
4. Ir al Reino, ver los NPCs caminando
5. Ir al Mundo, ver los biomas
6. Identificar qué bugs persisten

**Archivos clave para entender el flujo:**
- `src/app/layout.tsx` — AuthGate, el corazón de la navegación
- `src/hooks/useAuth.ts` — Cómo funciona guest y MetaMask
- `src/hooks/usePortfolio.ts` — Cómo se guardan los trades
- `src/lib/gameEngine.ts` — Motor PixiJS completo
- `src/components/KingdomCanvas.tsx` — Ejemplo de juego PixiJS completo
- `src/components/TradePanel.tsx` — Trading UI completa

**Si ves double navbar de nuevo:** Simplificar. El AuthGate debería tener solo 3 estados:
1. NO session → landing page (sin Navbar)
2. Session + pathname '/' → loader → redirect
3. Session → Navbar + children

**Si ves "dashboard encima del fondo":** Revisar si `bg-aurora-dark` tiene sentido. Si el archivo `/backgrounds/aurora_dark.png` no existe, quitar esa clase.

---

*HodlVille — v2.0 · Mayo 2026 · Hecho con 🏡 por la comunidad*
