'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, Wallet, Chrome, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: Props) {
  const { signInWithGoogle, connectMetaMask } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogle = async () => {
    setLoading('google');
    try { await signInWithGoogle(); }
    catch (e) { console.error(e); }
    setLoading(null);
  };

  const handleMetaMask = async () => {
    setLoading('metamask');
    const address = await connectMetaMask();
    if (address) {
      alert(`🔗 MetaMask conectado: ${address.slice(0,6)}...${address.slice(-4)}`);
    } else {
      alert('No se detectó MetaMask. Instala la extensión.');
    }
    setLoading(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(5,5,15,0.8)] backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card !rounded-2xl p-8 md:p-10 max-w-sm w-full mx-4 animate-scale-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[#5c5c80] hover:text-white hover:bg-white/5 transition"
        >
          <X size={16} />
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-[#6366f1]/25">
            🏡
          </div>
          <h2 className="text-2xl font-bold text-white">HodlVille</h2>
          <p className="text-[#8888b0] text-sm mt-1.5">Conecta para empezar tu aventura</p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogle}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 glass rounded-xl py-3.5 px-4 text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.05)] transition disabled:opacity-50 group"
          >
            <Chrome size={18} />
            Continuar con Google
            <ArrowRight size={16} className="ml-auto text-[#5c5c80] group-hover:text-white transition" />
          </button>

          <button
            onClick={handleMetaMask}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 glass rounded-xl py-3.5 px-4 text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.05)] transition disabled:opacity-50 group"
          >
            <Wallet size={18} className="text-[#f6851b]" />
            Conectar MetaMask
            <ArrowRight size={16} className="ml-auto text-[#5c5c80] group-hover:text-white transition" />
          </button>
        </div>

        {loading && (
          <div className="mt-4 text-center text-xs text-[#8888b0] animate-pulse">
            {loading === 'google' ? 'Autenticando con Google...' : 'Conectando MetaMask...'}
          </div>
        )}

        <p className="text-center text-xs text-[#5c5c80] mt-6 leading-relaxed">
          Al continuar, aceptas que HodlVille es un juego de trading simulado.
          <br />Sin valor real. No es asesoramiento financiero.
        </p>
      </div>
    </div>
  );
}
