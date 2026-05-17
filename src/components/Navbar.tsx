'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import { usePortfolioStore } from '@/hooks/usePortfolio';
import { Home, BarChart3, Globe, LogOut, Wallet } from 'lucide-react';
import { signOut } from '@/lib/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const { profile } = useAuthStore();
  const { coins } = usePortfolioStore();

  const links = [
    { href: '/dashboard', label: 'Trading', icon: <BarChart3 size={16} /> },
    { href: '/world', label: 'Mundo', icon: <Globe size={16} /> },
  ];

  return (
    <nav className="bg-[#12122a]/90 backdrop-blur-lg border-b border-[#2a2a5a] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🏡</span>
            <span className="font-pixel text-sm text-[#F0B90B] hidden sm:inline">HodlVille</span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  pathname === link.href
                    ? 'bg-[#7C3AED]/20 text-[#7C3AED]'
                    : 'text-[#8888aa] hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-[#1a1a3a] px-3 py-1.5 rounded-lg">
            <Wallet size={14} className="text-[#F0B90B]" />
            <span className="text-sm font-bold">${coins.toFixed(2)}</span>
          </div>

          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="avatar"
              className="w-7 h-7 rounded-full border border-[#2a2a5a]"
            />
          )}

          <button
            onClick={() => signOut()}
            className="text-[#8888aa] hover:text-[#ef4444] transition p-1"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
