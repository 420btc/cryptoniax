'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, Wallet, Chrome } from 'lucide-react';

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
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  };

  const handleMetaMask = async () => {
    setLoading('metamask');
    const address = await connectMetaMask();
    if (address) {
      // TODO: sign message with MetaMask to verify + create/link user in Supabase
      alert(`MetaMask conectado: ${address.slice(0,6)}...${address.slice(-4)}`);
    } else {
      alert('No se detectó MetaMask. Instala la extensión.');
    }
    setLoading(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a3a] p-8 rounded-2xl pixel-border max-w-sm w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#8888aa] hover:text-white">
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏡</div>
          <h2 className="text-2xl font-pixel text-[#F0B90B]">HodlVille</h2>
          <p className="text-[#8888aa] text-sm mt-2">Donde tus HODLs construyen tu reino</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogle}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-3 px-4 transition disabled:opacity-50"
          >
            <Chrome size={20} />
            <span className="font-medium">Continuar con Google</span>
          </button>

          <button
            onClick={handleMetaMask}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 bg-[#F6851B]/20 hover:bg-[#F6851B]/30 border border-[#F6851B]/30 rounded-xl py-3 px-4 transition disabled:opacity-50"
          >
            <Wallet size={20} className="text-[#F6851B]" />
            <span className="font-medium">Conectar MetaMask</span>
          </button>
        </div>

        <p className="text-center text-xs text-[#8888aa] mt-6">
          HodlVille — Juego de trading simulado. Sin valor real.
        </p>
      </div>
    </div>
  );
}
