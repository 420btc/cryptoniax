'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore, ToastMessage } from '@/hooks/useToast';
import { CheckCircle2, AlertCircle, Info, Gift, X } from 'lucide-react';

const icons = {
  success: <CheckCircle2 className="text-[#22d65e]" size={20} />,
  error: <AlertCircle className="text-[#ef4466]" size={20} />,
  info: <Info className="text-[#00e6ff]" size={20} />,
  reward: <Gift className="text-[#f0b90b]" size={20} />,
};

const bgColors = {
  success: 'bg-[rgba(34,214,94,0.1)] border-[#22d65e]/20',
  error: 'bg-[rgba(239,68,102,0.1)] border-[#ef4466]/20',
  info: 'bg-[rgba(0,230,255,0.1)] border-[#00e6ff]/20',
  reward: 'bg-[rgba(240,185,11,0.1)] border-[#f0b90b]/20',
};

export default function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-20 right-4 z-[100] flex flex-col gap-2 w-72 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 p-3 rounded-xl border backdrop-blur-md shadow-lg ${bgColors[t.type]}`}
          >
            <div className="mt-0.5">{icons[t.type]}</div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">{t.title}</h4>
              {t.message && <p className="text-xs text-[#8888b0] mt-0.5">{t.message}</p>}
            </div>
            <button 
              onClick={() => removeToast(t.id)}
              className="text-[#5c5c80] hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}