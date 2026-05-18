'use client';

import Link from 'next/link';
import { Github, Twitter, Heart, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(99,102,241,0.08)] bg-[rgba(5,5,15,0.6)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏡</span>
              <span className="text-lg font-bold text-white">
                Hodl<span className="text-[#f0b90b]">Ville</span>
              </span>
            </div>
            <p className="text-[#5c5c80] text-sm leading-relaxed">
              Donde tus HODLs construyen tu reino y tus trades forjan tus héroes.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-bold text-[#8888b0] uppercase tracking-wider mb-3">Juego</h4>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="text-[#5c5c80] hover:text-white text-sm transition">Trading</Link>
              <Link href="/world" className="text-[#5c5c80] hover:text-white text-sm transition">Mundo</Link>
              <span className="text-[#3c3c60] text-sm cursor-not-allowed">Batallas</span>
              <span className="text-[#3c3c60] text-sm cursor-not-allowed">Subastas</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#8888b0] uppercase tracking-wider mb-3">Recursos</h4>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-[#5c5c80] hover:text-white text-sm transition">Documentación</a>
              <a href="#" className="text-[#5c5c80] hover:text-white text-sm transition">Changelog</a>
              <a href="https://github.com/420btc/cryptoniax" target="_blank" rel="noopener" className="text-[#5c5c80] hover:text-white text-sm transition">GitHub</a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#8888b0] uppercase tracking-wider mb-3">Comunidad</h4>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-[#5c5c80] hover:text-white text-sm transition flex items-center gap-1.5">
                <Twitter size={14} /> Twitter
              </a>
              <a href="#" className="text-[#5c5c80] hover:text-white text-sm transition flex items-center gap-1.5">
                <Github size={14} /> GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[rgba(99,102,241,0.08)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#5c5c80] text-xs">
            © 2026 HodlVille — Paper trading gamificado. Sin valor real. No es asesoramiento financiero.
          </p>
          <p className="text-[#3c3c60] text-xs flex items-center gap-1">
            Hecho con <Heart size={10} className="text-[#ef4466]" /> por la comunidad
          </p>
        </div>
      </div>
    </footer>
  );
}
