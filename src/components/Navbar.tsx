'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import {
  BarChart3, Globe, LogOut, Wallet, TrendingUp, Menu, X, User, Home, Swords,
  ShoppingBag, Building2, Crown, Zap, Star, Clock, Target, ChevronRight, Activity
} from 'lucide-react';
import { signOut } from '@/lib/supabase';
import { useState } from 'react';
import ProfileModal from './ProfileModal';

export default function Navbar() {
  const pathname = usePathname();
  const { profile } = useAuthStore();
  const { coins, level, xp, activeTrades, closedTrades, house } = usePortfolioStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Trading', icon: BarChart3, color: '#f0b90b' },
    { href: '/kingdom', label: 'Reino', icon: Crown, color: '#818cf8' },
    { href: '/world', label: 'Mundo', icon: Globe, color: '#00e6ff' },
    { href: '/battles', label: 'Batallas', icon: Swords, color: '#ef4466' },
    { href: '/housing', label: 'Casas', icon: Building2, color: '#c084fc' },
    { href: '#shop', label: 'Tienda', icon: ShoppingBag, color: '#f59e0b', disabled: true },
  ];

  const username = profile?.email?.split('@')[0] || 'Trader';
  const levelXp = level * level * 100;
  const xpProgress = Math.min(100, (xp / levelXp) * 100);
  const winRate = closedTrades.length > 0
    ? Math.round((closedTrades.filter(t => (t.pnl || 0) > 0).length / closedTrades.length) * 100)
    : 0;
  const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl || 0), 0);

  // Close drawer on route change
  const handleNav = () => setMobileOpen(false);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-[rgba(5,5,15,0.85)] backdrop-blur-2xl border-b border-[rgba(99,102,241,0.08)] sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* LEFT: Logo */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 sm:gap-2.5 group no-underline flex-shrink-0">
              <motion.div
                whileHover={{ rotate: -8, scale: 1.1 }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center text-base sm:text-lg shadow-lg shadow-[#6366f1]/20 group-hover:shadow-[#6366f1]/40 transition"
              >🏡</motion.div>
              <span className="text-base sm:text-lg font-bold text-white tracking-tight hidden xs:block">
                Hodl<span className="text-[#f0b90b]">Ville</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link key={link.href} href={link.disabled ? '#' : link.href}
                    onClick={(e) => link.disabled && e.preventDefault()}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      link.disabled ? 'text-[#3c3c60] cursor-not-allowed opacity-40'
                      : active ? 'glass text-white' : 'text-[#5c5c80] hover:text-white hover:bg-white/[0.03]'}`}
                    title={link.disabled ? 'Próximamente' : link.label}>
                    <Icon size={15} style={{ color: active ? link.color : undefined }} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Quick info + hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wallet — always visible */}
            <div className="flex items-center gap-1 sm:gap-1.5 glass rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-1.5">
              <Wallet size={13} className="text-[#f0b90b] flex-shrink-0" />
              <motion.span
                key={coins.toFixed(2)}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-xs sm:text-sm font-bold text-white tabular-nums"
              >
                ${coins < 1000 ? coins.toFixed(2) : coins.toFixed(0)}
              </motion.span>
            </div>

            {/* Level — desktop */}
            <div className="hidden md:flex items-center gap-1.5 glass rounded-xl px-2.5 py-1.5">
              <Star size={13} className="text-[#818cf8] flex-shrink-0" fill="#818cf8" />
              <span className="text-xs font-bold text-white">Nv.{level}</span>
            </div>

            {/* Active trades indicator */}
            {activeTrades.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 glass rounded-lg px-2 py-1">
                <Activity size={11} className="text-[#22d65e]" />
                <span className="text-[10px] font-medium text-[#22d65e]">{activeTrades.length}</span>
              </div>
            )}

            {/* Desktop: user button */}
            <button onClick={() => setProfileOpen(true)}
              className="hidden md:flex items-center gap-2 glass rounded-xl pl-1.5 pr-2.5 py-1 hover:bg-[rgba(255,255,255,0.03)] transition cursor-pointer">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" className="w-7 h-7 rounded-lg border border-[rgba(99,102,241,0.15)]" />
                : <div className="w-7 h-7 rounded-lg bg-[rgba(99,102,241,0.15)] flex items-center justify-center"><User size={14} className="text-[#818cf8]" /></div>}
              <div className="hidden lg:block text-left">
                <div className="text-xs font-medium text-white truncate max-w-[80px]">{username}</div>
                <div className="text-[10px] text-[#5c5c80] flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#22d65e]" /> Online
                </div>
              </div>
            </button>

            {/* Desktop: logout */}
            <button onClick={() => signOut()} className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-[#5c5c80] hover:text-[#ef4466] hover:bg-[rgba(239,68,102,0.1)] transition" title="Salir">
              <LogOut size={15} />
            </button>

            {/* Mobile: hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden relative w-9 h-9 rounded-lg flex items-center justify-center text-[#818cf8] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition"
            >
              {activeTrades.length > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#22d65e] shadow-lg shadow-[#22d65e]/40"
                />
              )}
              <Menu size={18} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ─── MOBILE DRAWER ──────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"
              onClick={handleNav}
            />

            {/* Drawer panel — slides from right */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-[360px] bg-[rgba(8,8,20,0.98)] backdrop-blur-3xl border-l border-[rgba(99,102,241,0.1)] flex flex-col overflow-hidden"
            >
              {/* ── Drawer Header: Player Card ── */}
              <div className="p-5 border-b border-[rgba(99,102,241,0.08)] space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Menu size={14} className="text-[#818cf8]" /> Menú
                  </h2>
                  <button
                    onClick={handleNav}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5c5c80] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Player identity */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-xl border-2 border-[rgba(99,102,241,0.2)]" />
                      : <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center text-xl shadow-lg shadow-[#6366f1]/20">👤</div>}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#22d65e] border-2 border-[#0a0a1a] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{username}</div>
                    <div className="flex items-center gap-2 text-[10px] mt-0.5">
                      <span className="text-[#818cf8] font-medium">Nv.{level}</span>
                      <span className="text-[#5c5c80]">·</span>
                      <span className="text-[#f0b90b]">{house?.style?.replace('_', ' ') || 'Sin casa'}</span>
                    </div>
                  </div>
                </div>

                {/* XP bar */}
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-[#5c5c80]">XP</span>
                    <span className="text-[#818cf8]">{xp}/{levelXp}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[rgba(99,102,241,0.1)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#818cf8]"
                    />
                  </div>
                </div>

                {/* Quick stats trio */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Wallet, label: 'Saldo', value: `$${coins.toFixed(0)}`, color: '#f0b90b' },
                    { icon: Target, label: 'Win Rate', value: `${winRate}%`, color: winRate >= 50 ? '#22d65e' : '#ef4466' },
                    { icon: Activity, label: 'Activos', value: activeTrades.length.toString(), color: '#818cf8' },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="glass !rounded-lg p-2 text-center">
                        <Icon size={12} className="mx-auto mb-0.5" style={{ color: s.color }} />
                        <div className="text-xs font-bold text-white">{s.value}</div>
                        <div className="text-[9px] text-[#5c5c80]">{s.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Navigation Links ── */}
              <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
                <p className="text-[10px] text-[#5c5c80] px-3 mb-2 font-medium uppercase tracking-wider">
                  Navegación
                </p>
                {links.map((link, i) => {
                  const Icon = link.icon;
                  const active = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                    >
                      <Link
                        href={link.disabled ? '#' : link.href}
                        onClick={(e) => {
                          if (link.disabled) e.preventDefault();
                          else handleNav();
                        }}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group ${
                          link.disabled
                            ? 'opacity-30 cursor-not-allowed'
                            : active
                            ? 'bg-[rgba(99,102,241,0.12)] text-white'
                            : 'text-[#8888b0] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
                            active ? 'bg-[rgba(99,102,241,0.2)]' : 'bg-[rgba(255,255,255,0.03)] group-hover:bg-[rgba(255,255,255,0.06)]'
                          }`}
                        >
                          <Icon size={17} style={{ color: active ? link.color : undefined }} />
                        </div>
                        <span className="flex-1">{link.label}</span>
                        {!link.disabled && <ChevronRight size={14} className="text-[#3c3c60] group-hover:text-[#5c5c80] transition" />}
                        {link.disabled && <span className="text-[9px] text-[#3c3c60]">Pronto</span>}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* ── Footer: Logout + Brand ── */}
              <div className="border-t border-[rgba(99,102,241,0.08)] p-4 space-y-3">
                {/* P&L summary */}
                {closedTrades.length > 0 && (
                  <div className="glass !rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={13} className={totalPnl >= 0 ? 'text-[#22d65e]' : 'text-[#ef4466]'} />
                      <span className="text-[11px] text-[#5c5c80]">P&L Total</span>
                    </div>
                    <span className={`text-xs font-bold tabular-nums ${totalPnl >= 0 ? 'text-[#22d65e]' : 'text-[#ef4466]'}`}>
                      {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => { handleNav(); signOut(); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass text-[#ef4466] text-sm font-medium hover:bg-[rgba(239,68,102,0.1)] transition"
                >
                  <LogOut size={15} />
                  Cerrar sesión
                </button>

                <p className="text-center text-[9px] text-[#3c3c60]">
                  HodlVille · El reino de los traders
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop profile modal */}
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
