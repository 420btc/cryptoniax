'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BackButton() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 }}
    >
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-[#5c5c80] hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.03)] group"
      >
        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition" />
        <span>Volver</span>
      </Link>
    </motion.div>
  );
}
