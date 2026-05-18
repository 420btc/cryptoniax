'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, Wallet, Chrome, ArrowRight, UserPlus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: Props) {
  const { signInWithGoogle, connectMetaMask, signInAsGuest } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogle = async () => {
    setLoading('google');
    try { await signInWithGoogle(); } catch (e) { console.error(e); }
    setLoading(null);
  };

  const handleMetaMask = async () => {
    setLoading('metamask');
    await connectMetaMask();
    setLoading(null);
    onClose();
  };

  const handleGuest = () => {
    signInAsGuest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-[rgba(5,5,15,0.85)] backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-card !p-8 w-full max-w-md animate-scale-in">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[#5c5c80] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition">
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏡</div>
          <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
            Bienvenido a HodlVille
          </h2>
          <p className="text-[#8888b0] text-sm mt-2">
            Elige cómo quieres entrar
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          {/* Guest — main CTA */}
          <button
            onClick={handleGuest}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#818cf8] hover:to-[#6366f1] rounded-xl py-3.5 px-4 text-sm font-semibold text-white transition disabled:opacity-50 shadow-lg shadow-[#6366f1]/20"
          >
            <UserPlus size={18} />
            Entrar como Invitado
            <ArrowRight size={16} className="ml-auto" />
          </button>

          {/* Separator */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-[rgba(99,102,241,0.1)]" />
            <span className="text-[10px] text-[#5c5c80]">o crea tu perfil</span>
            <div className="flex-1 h-px bg-[rgba(99,102,241,0.1)]" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 glass rounded-xl py-3 px-4 text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.05)] transition disabled:opacity-50 group"
          >
            <Chrome size={18} className="text-[#4285f4]" />
            Continuar con Google
            {loading === 'google' ? (
              <div className="ml-auto w-4 h-4 border-2 border-[#5c5c80] border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowRight size={16} className="ml-auto text-[#5c5c80] group-hover:text-white transition" />
            )}
          </button>

          {/* MetaMask */}
          <button
            onClick={handleMetaMask}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 glass rounded-xl py-3 px-4 text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.05)] transition disabled:opacity-50 group"
          >
            <Wallet size={18} className="text-[#f6851b]" />
            Conectar MetaMask
            <ArrowRight size={16} className="ml-auto text-[#5c5c80] group-hover:text-white transition" />
          </button>
        </div>
      </div>
    </div>
  );
}
