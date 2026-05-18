'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Chrome, ArrowRight, UserPlus, Sparkles, Shield, Swords } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trigger?: React.ReactNode;
}

export default function LoginModal({ isOpen, onClose, trigger }: Props) {
  const { signInWithGoogle, connectMetaMask, signInAsGuest } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(isOpen);
  const [bgLoaded, setBgLoaded] = useState(true);

  useEffect(() => { setModalOpen(isOpen); }, [isOpen]);

  const close = () => { setModalOpen(false); onClose(); };

  if (trigger && !modalOpen) {
    return <span onClick={() => setModalOpen(true)}>{trigger}</span>;
  }

  if (!modalOpen) return null;

  const handleGoogle = async () => {
    setLoading('google');
    try { await signInWithGoogle(); } catch (e) { console.error(e); }
    setLoading(null);
  };

  const handleMetaMask = async () => {
    setLoading('metamask');
    await connectMetaMask();
    setLoading(null);
    close();
  };

  const handleGuest = () => {
    signInAsGuest();
    close();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[rgba(5,5,15,0.9)] backdrop-blur-xl"
          onClick={close}
        />

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/sprites/v2/cover_login.png"
            alt=""
            className="w-full h-full object-cover opacity-20"
            onError={() => setBgLoaded(false)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/60 to-transparent" />
        </div>

        {/* Ambient particles */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-[#818cf8] rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="relative z-10 glass-card !p-8 w-full max-w-md overflow-hidden"
        >
          {/* Animated border */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(240,185,11,0.1), rgba(34,214,94,0.1), rgba(99,102,241,0.15))',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              padding: '1px',
            }}
          />

          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-[#5c5c80] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition"
          >
            <X size={15} />
          </button>

          {/* Header */}
          <div className="text-center mb-7">
            <motion.div
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="text-5xl mb-4"
            >
              🏡
            </motion.div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              Bienvenido a{' '}
              <span className="text-gradient-gold">Hodl</span>
              <span className="text-gradient">Ville</span>
            </h2>
            <p className="text-[#8888b0] text-sm">
              Donde tus trades construyen tu reino
            </p>
          </div>

          {/* Quick features */}
          <div className="flex justify-center gap-4 mb-7">
            {[
              { icon: <Swords size={11} />, label: 'PvE', color: '#ef4466' },
              { icon: <Shield size={11} />, label: 'Trading', color: '#f0b90b' },
              { icon: <Sparkles size={11} />, label: 'Housing', color: '#22d65e' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-[#5c5c80]">
                <span style={{ color: f.color }}>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            {/* Guest — main CTA */}
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGuest}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#818cf8] hover:to-[#6366f1] rounded-xl py-3.5 px-4 text-sm font-semibold text-white transition disabled:opacity-50 shadow-lg shadow-[#6366f1]/25"
            >
              <UserPlus size={17} />
              Entrar como Invitado
              <ArrowRight size={15} className="ml-auto" />
            </motion.button>

            {/* Separator */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[rgba(99,102,241,0.1)]" />
              <span className="text-[10px] text-[#5c5c80]">o crea tu perfil</span>
              <div className="flex-1 h-px bg-[rgba(99,102,241,0.1)]" />
            </div>

            {/* Google */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogle}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 glass rounded-xl py-3 px-4 text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.05)] transition disabled:opacity-50 group"
            >
              <Chrome size={17} className="text-[#4285f4]" />
              Continuar con Google
              {loading === 'google' ? (
                <div className="ml-auto w-4 h-4 border-2 border-[#5c5c80] border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight size={15} className="ml-auto text-[#5c5c80] group-hover:text-white transition" />
              )}
            </motion.button>

            {/* MetaMask */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMetaMask}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 glass rounded-xl py-3 px-4 text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.05)] transition disabled:opacity-50 group"
            >
              <Wallet size={17} className="text-[#f6851b]" />
              Conectar MetaMask
              <ArrowRight size={15} className="ml-auto text-[#5c5c80] group-hover:text-white transition" />
            </motion.button>
          </div>

          {/* Bottom text */}
          <p className="text-center text-[10px] text-[#5c5c80] mt-5">
            Paper trading simulado · Sin valor real · Sin riesgos
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
