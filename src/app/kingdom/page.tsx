'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { useAuthStore } from '@/hooks/useAuth';
import {
  Home, Swords, Shield, Zap, Wallet, Sparkles,
  Building2, BookOpen, Ship, Warehouse, Users, Gem,
  ArrowRight, Crown, TreePine, Lamp, PawPrint, Pickaxe
} from 'lucide-react';
import Link from 'next/link';
import { EXCHANGE_THEMES, ExchangeType } from '@/types';

const NPC_LIST = [
  { id: 'blacksmith', sprite: 'npc_blacksmith.png', name: 'Herrero', x: 'left-[5%]', y: 'top-[35%]', desc: 'Forja armas y armaduras', color: '#ef4466' },
  { id: 'merchant', sprite: 'npc_merchant.png', name: 'Mercader', x: 'right-[5%]', y: 'top-[40%]', desc: 'Compra y vende objetos', color: '#f0b90b' },
  { id: 'quest_giver', sprite: 'npc_quest_giver.png', name: 'Mago', x: 'left-[50%]', y: 'top-[15%]', desc: 'Misiones y recompensas', color: '#818cf8' },
  { id: 'banker', sprite: 'npc_banker.png', name: 'Banquero', x: 'left-[10%]', y: 'top-[55%]', desc: 'Guarda tus ahorros', color: '#22d65e' },
];

const PROPS_LIST = [
  { sprite: 'prop_tree_oak.png', x: 'left-[3%]', y: 'top-[20%]', w: 28 },
  { sprite: 'prop_tree_pine.png', x: 'right-[12%]', y: 'top-[20%]', w: 28 },
  { sprite: 'prop_rock.png', x: 'left-[15%]', y: 'top-[68%]', w: 24 },
  { sprite: 'prop_lantern.png', x: 'left-[45%]', y: 'top-[70%]', w: 18 },
  { sprite: 'prop_lantern.png', x: 'right-[35%]', y: 'top-[70%]', w: 18 },
  { sprite: 'prop_signpost.png', x: 'left-[25%]', y: 'top-[55%]', w: 22 },
  { sprite: 'prop_portal.png', x: 'right-[8%]', y: 'top-[55%]', w: 32 },
];

export default function KingdomPage() {
  const { coins, level, activeTrades, closedTrades, house } = usePortfolioStore();
  const { profile } = useAuthStore();
  const [selectedBldg, setSelectedBldg] = useState<string | null>(null);

  const username = profile?.email?.split('@')[0] || 'Fundador';

  // Recursos calculados
  const totalTrades = closedTrades.length;
  const winRate = closedTrades.length > 0
    ? Math.round((closedTrades.filter(t => (t.pnl || 0) > 0).length / closedTrades.length) * 100) : 0;
  const totalProfit = closedTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  const gold = Math.floor(totalProfit * 0.1); // 10% de profit se convierte en oro pasivo
  const materials = Math.floor(totalTrades * 0.5); // materiales por trades
  const influence = level;

  // Ciudadanos = héroes basados en trades activos
  const citizens = useMemo(() => activeTrades.map((t, i) => {
    const level = Math.min(5, Math.max(1, Math.ceil(totalTrades / 10)));
    const exchange = (t.exchange || 'bingx') as ExchangeType;
    const role = t.type === 'futures' ? 'warrior' : 'merchant';
    return {
      id: `cit-${i}`,
      symbol: t.symbol,
      exchange: t.exchange,
      role,
      level,
      sprite: `/sprites/v2/hero_${exchange}_${role}_lv${level}.png`,
      assignedTo: getBuildingForSymbol(t.symbol),
    };
  }), [activeTrades, totalTrades]);

  // Edificios construidos según pares tradeados
  const buildings = useMemo(() => {
    const tradedSymbols = new Set([
      ...activeTrades.map(t => t.symbol),
      ...closedTrades.map(t => t.symbol),
    ]);
    const allBuildings = [
      { id: 'bank', name: 'Banco BTC', icon: '🏦', symbol: 'BTC', desc: 'Genera oro pasivo', color: '#f0b90b', built: tradedSymbols.has('BTC'), x: 'left-[8%]', y: 'top-[30%]' },
      { id: 'academy', name: 'Academia ETH', icon: '📚', symbol: 'ETH', desc: '+XP para héroes', color: '#818cf8', built: tradedSymbols.has('ETH'), x: 'left-[38%]', y: 'top-[8%]' },
      { id: 'market', name: 'Mercado SOL', icon: '⚡', symbol: 'SOL', desc: 'Mejores precios', color: '#22d65e', built: tradedSymbols.has('SOL'), x: 'right-[8%]', y: 'top-[30%]' },
      { id: 'port', name: 'Puerto', icon: '🚢', symbol: 'XRP', desc: 'Rutas comerciales', color: '#00e6ff', built: false, x: 'left-[30%]', y: 'top-[65%]' },
    ];
    return allBuildings;
  }, [activeTrades, closedTrades]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-white">🏰 Mi Reino</h1>
        <p className="text-[#8888b0] text-sm mt-1">{username}, gestiona tu reino y sus ciudadanos</p>
      </motion.div>

      {/* Resources Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-2">
        {[
          { icon: <Gem size={14} />, label: 'Oro', value: gold.toLocaleString(), color: '#f0b90b', sub: '± ingresos' },
          { icon: <Pickaxe size={14} />, label: 'Materiales', value: materials.toLocaleString(), color: '#f59e0b', sub: `${totalTrades} trades` },
          { icon: <Crown size={14} />, label: 'Influencia', value: influence.toString(), color: '#818cf8', sub: `Nv.${level}` },
          { icon: <Users size={14} />, label: 'Ciudadanos', value: citizens.length.toString(), color: '#22d65e', sub: `${activeTrades.length} trabajando` },
        ].map((r, i) => (
          <motion.div key={i} className="glass-card !p-2.5 text-center" whileHover={{ y: -2 }}>
            <div className="flex justify-center mb-1" style={{ color: r.color }}>{r.icon}</div>
            <div className="text-xs font-bold text-white">{r.value}</div>
            <div className="text-[8px] text-[#5c5c80]">{r.label}</div>
            <div className="text-[7px] text-[#3c3c60]">{r.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* City Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative glass-card !p-0 overflow-hidden"
        style={{ minHeight: 450, background: 'linear-gradient(135deg, var(--bg-deep) 0%, #0a0b2e 50%, var(--bg-base) 100%)' }}
      >
        {/* Background - city ground */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-1/4"
          style={{ background: 'linear-gradient(0deg, rgba(34,214,94,0.05) 0%, transparent 100%)' }}
        />

        {/* PROPS scattered */}
        {PROPS_LIST.map((prop, i) => (
          <div key={`prop-${i}`} className={`absolute ${prop.x} ${prop.y} z-5 pointer-events-none`}>
            <img src={`/sprites/v2/${prop.sprite}`} alt="" className="opacity-60"
              style={{ width: prop.w, height: prop.w, objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ))}

        {/* NPCS */}
        {NPC_LIST.map((npc) => (
          <motion.button
            key={npc.id}
            className={`absolute ${npc.x} ${npc.y} z-10 flex flex-col items-center group`}
            whileHover={{ scale: 1.1, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedBldg(npc.id)}
          >
            <img src={`/sprites/v2/${npc.sprite}`} alt={npc.name}
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-[0_0_10px_rgba(128,128,255,0.2)]"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                (el.nextElementSibling as HTMLElement).style.display = 'block';
              }}
            />
            <div className="hidden text-2xl" style={{ display: 'none' }}>
              {npc.id === 'blacksmith' ? '🔨' : npc.id === 'merchant' ? '💰' : npc.id === 'quest_giver' ? '🧙' : '🏦'}
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
              <div className="glass !rounded-lg px-2 py-0.5 text-[9px] font-medium text-white">{npc.name}</div>
            </div>
          </motion.button>
        ))}

        {/* BUILDINGS */}
        {buildings.map((b) => (
          <motion.button
            key={b.id}
            className={`absolute ${b.x} ${b.y} z-10 flex flex-col items-center ${b.built ? 'group' : 'opacity-30'}`}
            whileHover={b.built ? { scale: 1.08, y: -2 } : {}}
            whileTap={b.built ? { scale: 0.95 } : {}}
            onClick={() => b.built && setSelectedBldg(b.id)}
          >
            <div className={`text-4xl sm:text-5xl ${b.built ? 'drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'grayscale'} transition-all`}>
              {b.icon}
            </div>
            <div className="text-[9px] font-bold text-white mt-1 text-center">
              {b.name}
              {!b.built && <span className="block text-[7px] text-[#5c5c80]">Bloqueado</span>}
            </div>
            {b.built && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#22d65e] border border-[#0a0a1a]" />
            )}
          </motion.button>
        ))}

        {/* YOUR HOUSE (center) */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-[42%] z-10 flex flex-col items-center"
          animate={{ y: [0, -3, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <div className="text-5xl sm:text-6xl drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            {house?.style === 'tent' ? '🏕️' : house?.style === 'wood_house' ? '🪵' : house?.style === 'stone_house' ? '🏠' : house?.style === 'mansion' ? '🏛️' : '🏰'}
          </div>
          <div className="text-[9px] font-bold text-white mt-1 glass !rounded-lg px-2 py-0.5">
            Tu Casa · Nv.{house?.level || 1}
          </div>
        </motion.div>

        {/* CITIZENS (heroes assigned to buildings) */}
        {citizens.slice(0, 6).map((c, i) => {
          // Position near their building
          const bldg = buildings.find(b => b.symbol === c.symbol);
          const posX = bldg ? bldg.x : `${8 + (i * 15)}%`;
          const posY = bldg ? `calc(${bldg.y.replace('top:', '')} + 40px)` : '50%';
          return (
            <motion.div
              key={c.id}
              className="absolute z-15"
              style={{ left: posX, top: posY }}
              animate={{ y: [0, -2, 0], transition: { duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <img src={c.sprite} alt={c.symbol}
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain opacity-80"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </motion.div>
          );
        })}

        {/* Selected Building Info Panel */}
        <AnimatePresence>
          {selectedBldg && (
            <motion.div
              initial={{ opacity: 0, y: 20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className="absolute bottom-4 left-1/2 z-20 glass-card !p-3 w-[90%] max-w-xs"
            >
              <BuildingInfoPanel
                id={selectedBldg}
                buildings={buildings}
                citizens={citizens}
                onClose={() => setSelectedBldg(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/world" className="glass-card !p-3 flex items-center gap-3 hover:bg-[rgba(255,255,255,0.03)] transition group">
          <GlobeIcon size={32} className="text-[#818cf8]" />
          <div className="flex-1">
            <div className="text-xs font-bold text-white">🌍 Explorar Mundo</div>
            <div className="text-[9px] text-[#5c5c80]">Mapa global con traders</div>
          </div>
          <ArrowRight size={14} className="text-[#5c5c80] group-hover:translate-x-0.5 transition" />
        </Link>
        <Link href="/dashboard" className="glass-card !p-3 flex items-center gap-3 hover:bg-[rgba(255,255,255,0.03)] transition group">
          <ChartIcon size={32} className="text-[#22d65e]" />
          <div className="flex-1">
            <div className="text-xs font-bold text-white">📊 Ir a Trading</div>
            <div className="text-[9px] text-[#5c5c80]">Abre nuevos trades</div>
          </div>
          <ArrowRight size={14} className="text-[#5c5c80] group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      {/* Citizens list */}
      {citizens.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card !p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={15} className="text-[#22d65e]" />
            <span className="text-sm font-bold text-white">Ciudadanos trabajando ({citizens.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {citizens.map((c) => {
              const theme = EXCHANGE_THEMES[c.exchange as ExchangeType] || { color: '#5c5c80', name: c.exchange, insignia: '?' };
              return (
                <div key={c.id} className="glass !rounded-lg p-2 flex items-center gap-2">
                  <img src={c.sprite} alt="" className="w-7 h-7 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-white truncate">{c.symbol}</div>
                    <div className="text-[8px]" style={{ color: theme.color }}>{theme.name} · Lv.{c.level}</div>
                    <div className="text-[7px] text-[#5c5c80]">→ {c.assignedTo}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function BuildingInfoPanel({ id, buildings, citizens, onClose }: {
  id: string;
  buildings: any[];
  citizens: any[];
  onClose: () => void;
}) {
  // Check if it's an NPC or a building
  const npc = NPC_LIST.find(n => n.id === id);
  const bldg = buildings.find(b => b.id === id);
  const assigned = citizens.filter(c => c.assignedTo === (bldg?.name || npc?.name));

  return (
    <div>
      <button onClick={onClose} className="absolute top-2 right-2 text-[#5c5c80] hover:text-white text-xs">✕</button>
      {npc && (
        <div className="flex items-center gap-2">
          <img src={`/sprites/v2/${npc.sprite}`} alt="" className="w-8 h-8 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <div className="text-xs font-bold text-white">{npc.name}</div>
            <div className="text-[9px] text-[#5c5c80]">{npc.desc}</div>
          </div>
        </div>
      )}
      {bldg && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{bldg.icon}</span>
          <div>
            <div className="text-xs font-bold text-white">{bldg.name}</div>
            <div className="text-[9px] text-[#5c5c80]">{bldg.desc}</div>
          </div>
        </div>
      )}
      {assigned.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[rgba(99,102,241,0.06)]">
          <div className="text-[8px] text-[#5c5c80] mb-1">Ciudadanos asignados: {assigned.length}</div>
          <div className="flex gap-1">
            {assigned.map(c => (
              <img key={c.id} src={c.sprite} alt="" className="w-5 h-5 object-contain rounded" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { AnimatePresence } from 'framer-motion';
function GlobeIcon({ size, className }: { size: number; className: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}
function ChartIcon({ size, className }: { size: number; className: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}

function getBuildingForSymbol(symbol: string): string {
  const map: Record<string, string> = { BTC: 'Banco BTC', ETH: 'Academia ETH', SOL: 'Mercado SOL', XRP: 'Puerto' };
  return map[symbol] || 'Ciudad';
}
