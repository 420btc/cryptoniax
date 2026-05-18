'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { BarChart3, Globe, LogOut, Wallet, TrendingUp, Menu, X } from 'lucide-react';
import { signOut } from '@/lib/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const { profile } = useAuthStore();
  const { coins, level, xp, activeTrades } = usePortfolioStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Trading', icon: <BarChart3 size={16} /> },
    { href: '/world', label: 'Mundo', icon: <Globe size={16} /> },
  ];

  const levelXp = level * level * 100;
  const xpProgress = Math.min(100, (xp / levelXp) * 100);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-[rgba(5,5,15,0.85)] backdrop-blur-2xl border-b border-[rgba(99,102,241,0.1)] sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center text-lg shadow-lg shadow-[#6366f1]/20 group-hover:shadow-[#6366f1]/40 transition">
              🏡
            </div>
            <span className="text-lg font-bold text-white tracking-tight hidden sm:block">
              Hodl<span className="text-[#f0b90b]">Ville</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  pathname === link.href
                    ? 'glass text-[#818cf8]'
                    : 'text-[#5c5c80] hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* XP Bar */}
          <div className="hidden sm:flex items-center gap-2.5 glass rounded-xl px-3 py-1.5">
            <TrendingUp size={14} className="text-[#818cf8]" />
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-medium text-[#5c5c80]">Nv.{level}</span>
                <span className="text-[10px] text-[#5c5c80]">{xp}/{levelXp} XP</span>
              </div>
              <div className="w-20 h-1 rounded-full bg-[rgba(99,102,241,0.15)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#818cf8] transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1.5 glass rounded-xl px-3 py-1.5">
            <Wallet size={14} className="text-[#f0b90b]" />
            <span className="text-sm font-bold text-white tabular-nums">${coins.toFixed(2)}</span>
          </div>

          {/* Avatar */}
          {profile?.avatar_url && (
            <div className="relative">
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-8 h-8 rounded-xl border border-[rgba(99,102,241,0.15)]"
              />
              {activeTrades.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#22d65e] text-[8px] font-bold flex items-center justify-center text-white shadow-lg shadow-[#22d65e]/30">
                  {activeTrades.length}
                </span>
              )}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={() => signOut()}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5c5c80] hover:text-[#ef4466] hover:bg-[rgba(239,68,102,0.1)] transition"
            title="Cerrar sesión"
          >
            <LogOut size={15} />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#5c5c80] hover:text-white transition"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(99,102,241,0.08)] px-4 py-3 bg-[rgba(5,5,15,0.95)] backdrop-blur-2xl animate-slide-up">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  pathname === link.href ? 'glass text-[#818cf8]' : 'text-[#5c5c80] hover:text-white'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.nav>
  );
}
