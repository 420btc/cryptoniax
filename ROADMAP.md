# 🏡 HodlVille — Roadmap v2.5

> **HodlVille**: Juego 2D pixel art donde tus HODLs construyen tu reino y tus trades forjan tus héroes.
> Trading simulado con charts reales (BTC/ETH/XRP/SOL vía Binance), economía virtual, personajes por exchange, y mundo pixelado.

---

## ✅ Hecho (v2.5 — 18 Mayo 2026)

### 🏗️ Proyecto Base
- [x] Next.js 14 + TypeScript + TailwindCSS
- [x] PixiJS 7 para render 2D del mundo pixel
- [x] TradingView Lightweight Charts — 4 paneles separados y sincronizados
- [x] Supabase (Google Auth) + wagmi/viem (MetaMask Auth)
- [x] Zustand para estado global
- [x] Arquitectura de componentes modular
- [x] Vercel deploy automático en cada push

### 🔐 Autenticación
- [x] Login con Google (Supabase OAuth)
- [x] Login con MetaMask (wagmi + ethers)
- [x] Login como Invitado (sin registro)
- [x] Auth gate con redirects: `/` → `/dashboard` cuando hay sesión
- [x] Bloqueo de rutas protegidas: `/dashboard`, `/world`, `/housing`, `/battles`

### 📊 Trading (Paper Trading con DATOS REALES)
- [x] **4 símbolos**: BTC, ETH, XRP, SOL
- [x] Hook `useRealtimeCrypto` — Binance REST (velas 120d) + WebSocket (precio en vivo)
- [x] Chart multi-pane (4 paneles independientes sincronizados)
- [x] Panel de nueva orden: Spot/Futuros, Long/Short, Cantidad, Apalancamiento, Exchange
- [x] Trades activos con P&L en tiempo real + marcadores en chart
- [x] Historial de trades cerrados
- [x] Estadísticas: Balance, Win Rate, P&L Total, Mejor Trade
- [x] Sistema de monedas virtuales (10,000 iniciales)
- [x] Quick amount buttons + leverage selector
- [x] Fee awareness: 0.07% taker fee
- [x] Mobile: tabs scroll horizontal, leverage wrap responsive

### 👤 Personajes (Trade → Héroe)
- [x] Cada trade abierto crea un personaje único
- [x] Spot → Mercader | Futuros → Guerrero
- [x] Color e insignia según exchange
- [x] Sistema de niveles por XP
- [x] Stats: HP, Attack, Defense

### 🏠 Sistema de Casas
- [x] Holdings (BTC/ETH/SOL) → nivel de casa
- [x] 5 estilos: Tienda → Cabaña → Casa Piedra → Mansión → Castillo
- [x] **Página /housing con 3 tabs**: Mi Casa, Mejorar, Decorar
- [x] Sprites pixel art para 5 estilos × 5 niveles (25 casas)
- [x] Tienda de 5 decoraciones desbloqueables por estilo
- [x] Camino de progresión visual con barras de progreso
- [x] Rango del jugador: Aldeano → Burgués → Noble → Rey
- [x] Casas visibles en el World Map con emojis

### 🌍 World Map (Mapbox Globe 3D)
- [x] Globo con atmósfera, estrellas, auto-rotación
- [x] 9 traders mock + tu ubicación
- [x] Marcadores de casas por estilo (🏕️🪵🏠🏛️🏰)
- [x] Popups con info de jugador + casa

### 💬 Taberna de Traders (20 bots)
- [x] 20 bots con personalidad única por país/idioma
- [x] 10 idiomas nativos (ES, EN, RU, KR, JP, FR, DE, PT, TR, ZH)
- [x] Boolean talkative: bots callados vs charlatanes
- [x] Memoria por bot (no repiten frases)
- [x] 8 categorías de respuesta contextual
- [x] Conversaciones ambientales entre bots (cada 15-45s)
- [x] Respuestas staggered (1-8s) simulando tiempo humano
- [x] Sidebar con lista de traders online/offline (toggle)
- [x] 0 coste: sin API de IA, todo local
- [x] Reemplaza el antiguo chat IA (BattleAIChat)

### 🎨 Assets Visuales (FAL.ai)
- [x] **94 sprites v2** — gpt-image-2 1024×1024 ($3.48 total)
  - 40 héroes: 4 exchanges × 2 tipos × 5 niveles
  - 25 casas: 5 estilos × 5 niveles
  - 19 items: espadas, armaduras, cascos, escudos, capas
  - 5 backgrounds + 4 bosses
- [x] **16 fondos UI** — flux/schnell 1024×1024 ($0.016 total, 42s)
  - Dashboard, cards, battle, housing ×4, world, aurora, cyber, particles
- [x] Script `scripts/gen_v2.py` — sprites con gpt-image-2
- [x] Script `scripts/gen_backgrounds.py` — fondos con flux/schnell

### 🎨 UI/UX
- [x] Tema oscuro glassmorphism + Aurora Background
- [x] Animaciones framer-motion en todas las páginas
- [x] **Clases CSS de fondos**: `.bg-dashboard-dark`, `.bg-card-glass`, `.bg-battle-arena`, `.bg-housing-castle`, etc.
- [x] Layout global con `bg-aurora-dark` (fondo etéreo animado)
- [x] **Navbar móvil premium** — drawer lateral slide-in con:
  - Avatar, nombre, nivel, tipo de casa
  - Barra XP animada
  - Quick stats: saldo, win rate, trades activos
  - Links con íconos grandes + colores por sección
  - P&L total + logout

### 📁 Estructura Actual del Proyecto
```
hodlville/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing (Aurora bg)
│   │   ├── layout.tsx                  # Root + AuthGate + bg-aurora-dark
│   │   ├── globals.css                 # Glassmorphism + 16 fondos CSS
│   │   ├── dashboard/page.tsx          # Trading dashboard
│   │   ├── world/page.tsx              # Globo 3D Mapbox
│   │   ├── housing/page.tsx            # Casas: Mi Casa, Mejorar, Decorar
│   │   ├── battles/page.tsx            # Arena + Taberna 20 bots
│   │   ├── auth/callback/page.tsx
│   │   └── api/chat/route.ts           # GPT-4o-mini endpoint
│   ├── components/
│   │   ├── Chart.tsx                   # Multi-pane Binance
│   │   ├── TradePanel.tsx              # Panel trading + stats
│   │   ├── World.tsx                   # Mundo PixiJS
│   │   ├── MapboxGlobe.tsx             # Globo 3D con casas
│   │   ├── BattleArena.tsx             # Arena de batalla
│   │   ├── BattleTavernChat.tsx        # 20 bots realistas
│   │   ├── ProfileModal.tsx            # Perfil flotante
│   │   ├── Navbar.tsx                  # Nav + drawer móvil
│   │   ├── LoginModal.tsx
│   │   ├── FaucetButton.tsx            # Faucet diario
│   │   ├── DailyQuests.tsx             # Misiones diarias
│   │   ├── LossOverlay.tsx
│   │   └── ui/
│   │       └── aurora-background.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePortfolio.ts
│   │   ├── useAIChat.ts
│   │   └── useRealtimeCrypto.ts
│   ├── lib/
│   │   ├── gameLogic.ts
│   │   ├── supabase.ts
│   │   └── web3.ts
│   └── types/
│       ├── index.ts
│       └── database.ts
├── public/
│   ├── sprites/v2/                     # 94 sprites 1024×1024
│   └── backgrounds/                    # 16 fondos UI 1024×1024
├── scripts/
│   ├── gen_v2.py                       # Sprites gpt-image-2
│   └── gen_backgrounds.py              # Fondos flux/schnell
├── supabase/migrations/
├── .env.local
└── ROADMAP.md
```

---

## 📋 Por Hacer — Tareas para IDE (Claude Code / Codex / OpenCode)

> ⚠️ **Estas tareas son largas y repetitivas** — perfectas para un subagente de IDE.
> Ejecuta cada tarea como un agente independiente con contexto claro.

### 🔴 PRIORIDAD 1 — Base de Datos Real

#### 1.1 Conectar Stores a Supabase
**Tiempo estimado:** 1-2h | **Dificultad:** Media
```
Tarea: Reemplazar localStorage por Supabase en todos los stores.
Archivos a modificar: src/hooks/usePortfolio.ts, useAuth.ts
Contexto: El schema SQL ya existe en supabase/migrations/001_init.sql.
Hay que crear las tablas en Supabase, ejecutar las migraciones, y cambiar
los stores para leer/escribir en Supabase en vez de localStorage.
Mantener el guest mode (sin login) usando localStorage como fallback.
Añadir Row Level Security (RLS) para que cada usuario solo vea sus datos.
```

#### 1.2 Ejecutar Migraciones SQL
**Tiempo estimado:** 30min | **Dificultad:** Baja
```
Tarea: Crear proyecto Supabase, ejecutar 001_init.sql y 002_user_locations.sql.
Credenciales en .env.local.
Tablas: profiles, holdings, trades, houses, characters, user_locations.
Verificar que las tablas se crean correctamente desde el dashboard de Supabase.
```

### 🟡 PRIORIDAD 2 — Gameplay

#### 2.1 Sistema de Batalla PvE Automático
**Tiempo estimado:** 2-3h | **Dificultad:** Alta
```
Tarea: Sistema de batalla automática entre personajes del jugador y enemigos NPC.
Archivos: src/components/BattleArena.tsx (ya existe, mejorarlo), nuevo src/lib/battleEngine.ts
- Lógica de turnos con stats reales (HP, ATK, DEF)
- Animaciones de ataque, daño, victoria/derrota
- Recompensas: XP + monedas al ganar
- 10 enemigos NPC con niveles 1-10 y stats balanceados
- Efectos visuales (shake, flash, partículas)
- Sonidos de batalla (usar Howler.js o Web Audio API)
- Integrar con el sistema de personajes existente
```

#### 2.2 Leaderboard Global
**Tiempo estimado:** 1h | **Dificultad:** Media
```
Tarea: Tabla de clasificación con Supabase.
- Nueva página /leaderboard o sección en /world
- Query a Supabase: TOP 100 por P&L total, XP, nivel de casa
- Actualización en tiempo real con Supabase Realtime
- Filtros: Global, Por exchange, Semanal
- Tu posición resaltada
```

#### 2.3 Achievements / Logros
**Tiempo estimado:** 1.5h | **Dificultad:** Media
```
Tarea: Sistema de logros desbloqueables.
- 20+ logros: "Primer Trade", "100 Trades", "Rey del Castillo", "Ballena", etc.
- Notificación toast al desbloquear
- Página /achievements o sección en el perfil
- Guardar en Supabase o localStorage
- Iconos para cada logro
```

#### 2.4 Chat de Taberna Persistente
**Tiempo estimado:** 1h | **Dificultad:** Baja
```
Tarea: Guardar mensajes de la taberna para que no se pierdan al recargar.
- Almacenar últimos 200 mensajes en localStorage
- Cargar historial al entrar
- El player puede poner su nombre (input en settings)
- Opcional: guardar en Supabase para chat cross-player
```

### 🟢 PRIORIDAD 3 — Contenido

#### 3.1 Más Pares de Trading
**Tiempo estimado:** 1h | **Dificultad:** Baja
```
Tarea: Añadir DOGE, ADA, LINK, AVAX al panel de trading.
- Añadir a CRYPTO_SYMBOLS y BINANCE_SYMBOLS en types/index.ts
- Actualizar Chart.tsx para manejar más símbolos
- Actualizar TradePanel.tsx tabs para scroll si hay muchos
- Probar que los WebSockets funcionan con los nuevos símbolos
```

#### 3.2 Sonidos y Música Ambiental
**Tiempo estimado:** 1h | **Dificultad:** Baja
```
Tarea: Añadir efectos de sonido y música de fondo.
- Usar Howler.js para gestión de audio
- Sonidos: click, trade abierto, trade cerrado, profit, loss, level up
- Música ambiental lo-fi para el dashboard
- Toggle on/off en settings
- Sonidos gratis de freesound.org o similares
```

#### 3.3 Tienda de Skins para Personajes
**Tiempo estimado:** 2h | **Dificultad:** Media
```
Tarea: Tienda donde comprar apariencias para personajes con monedas del juego.
- Los sprites v2 ya tienen variaciones de items equipables
- Nueva sección en /housing o página /shop
- Skins: sombreros, capas, efectos de partículas
- Precios en monedas (50-500)
- Preview visual del personaje con el item equipado
```

### 🔵 PRIORIDAD 4 — Técnico

#### 4.1 PWA — Instalable como App
**Tiempo estimado:** 45min | **Dificultad:** Baja
```
Tarea: Convertir HodlVille en PWA instalable.
- next-pwa o manual con manifest.json + service worker
- Iconos en múltiples tamaños
- Splash screen
- Modo offline básico (cachear assets estáticos)
- Instalar desde Chrome/Safari en móvil
```

#### 4.2 Tests Unitarios
**Tiempo estimado:** 1.5h | **Dificultad:** Media
```
Tarea: Configurar Vitest y escribir tests para la lógica del juego.
- Instalar vitest + @testing-library/react
- Tests para gameLogic.ts: calcTradeXp, getLevel, calcHouseLevel, getHouseStyle
- Tests para usePortfolio store
- Tests para TradePanel (renderizado, interacción)
- CI con GitHub Actions para correr tests en cada push
```

#### 4.3 Sistema de Notificaciones Toast
**Tiempo estimado:** 45min | **Dificultad:** Baja
```
Tarea: Sistema de toasts para feedback al usuario.
- Componente Toast con framer-motion
- Tipos: success, error, info, reward
- Auto-dismiss después de 3-5 segundos
- Cola de toasts (máximo 3 visibles)
- Usar en: trade abierto, trade cerrado, faucet, misiones, logros
```

### ⚪ PRIORIDAD 5 — Mundo y Social

#### 5.1 Mapa del Mundo Scrollable (Chunks)
**Tiempo estimado:** 3h | **Dificultad:** Alta
```
Tarea: Mapa 2D infinito con chunks procedurales.
- Reemplazar o extender World.tsx (PixiJS)
- Chunks de 512×512 píxeles que cargan según cámara
- Biomas: bosque, desierto, montaña, ciudad
- Casas de otros jugadores visibles (datos de Supabase)
- Zoom y pan con el ratón/touch
- Mini-mapa en esquina
```

#### 5.2 Eventos y Torneos
**Tiempo estimado:** 2h | **Dificultad:** Media
```
Tarea: Sistema de eventos temporales.
- Evento diario: "Hora de Trading" (13:00-14:00) — doble XP
- Torneo semanal: mejor P&L gana monedas extra
- Notificación en el dashboard cuando hay evento activo
- Countdown timer
- Tabla de clasificación del torneo
```

---

## 🤖 Cómo Delegar a un IDE

```bash
# Ejemplo con Claude Code:
claude "En /home/choco/hodlville, lee ROADMAP.md y ejecuta la tarea 1.1 (Conectar Stores a Supabase)"

# O con OpenCode:
opencode --task "hodlville: conectar stores a supabase, schema en supabase/migrations/001_init.sql"

# O con Codex:
codex exec "Implementa el sistema de batalla PvE descrito en ROADMAP.md tarea 2.1"
```

### 🎯 Prioridades para mañana (19 Mayo):
1. **Supabase real** — crear proyecto, ejecutar migraciones, conectar stores
2. **Leaderboard** — rápido, gran impacto visual
3. **Notificaciones Toast** — feedback inmediato al usuario
4. **Sonidos** — inmersión instantánea
5. **PWA** — instalable en el móvil

---

## 📐 Notas Técnicas

- **Chart**: lightweight-charts v4 con 4 instancias separadas sincronizadas. Datos de Binance REST (klines 1d) + WebSocket (ticker en vivo).
- **PixiJS**: v7, `image-rendering: pixelated`. Fix: `appRef.current?.ticker` antes de cleanup.
- **MapboxGlobe**: Mapbox GL JS v3 con proyección globe, atmósfera, auto-rotación.
- **Auth**: MetaMask firma mensaje. Supabase OAuth. Guest mode con estado local.
- **Estados**: Zustand stores client-side con fallback a localStorage. Próximo: Supabase.
- **Taberna**: 20 bots con patrones de respuesta locales, 0 coste. Sin API externa.
- **Fees**: 0.07% taker (BingX realista) + fee awareness en trades.
- **XP**: `XP = amount * leverage * 0.1 + (pnl > 0 ? pnl * 10 : 0)`. Nivel = `floor(sqrt(XP/100)) + 1`.
- **Casas**: Nivel basado en holdings totales. 5 estilos con 5 niveles visuales cada uno.
- **Fondos**: 16 imágenes generadas con flux/schnell (~$0.001/img). Script reusable.
- **Sprites v2**: 94 sprites gpt-image-2 1024×1024 (~$0.037/img). Listo para usar.
- **FAL key**: `db8964c5-dba3-433a-a9be-760ad5bca943:a684d89b1a7a10e6ff9895f2d14ff812`
- **GitHub**: repo `420btc/cryptoniax`, token con scope repo.
- **Vercel**: deploy automático en cada push a main.
- **Binance API**: pública, sin key. REST `api.binance.com/api/v3/klines`, WS `stream.binance.com:9443/ws`.

---

## 🔑 Credenciales

> ⚠️ No subir a GitHub público.

| Servicio | Archivo | Variable |
|----------|---------|----------|
| OpenAI | `.env.local` | `OPENAI_API_KEY=sk-proj-...` |
| Supabase | `.env.local` | `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` |
| Mapbox | `.env.local` | `NEXT_PUBLIC_MAPBOX_TOKEN` |
| FAL.ai | `scripts/gen_*.py` | `FAL_KEY=db8964c5-...` |
| GitHub | Push URL | Token en git remote |

---

*HodlVille v2.5 — Donde tus HODLs construyen tu reino*
*Creado: 18 Mayo 2026 · Última actualización: 18 Mayo 2026 06:45*
