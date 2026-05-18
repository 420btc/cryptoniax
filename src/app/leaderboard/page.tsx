'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Trophy, Medal, Star, Hash } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useAuthStore } from '@/hooks/useAuth';

interface LeaderboardEntry {
  user_id: string;
  email: string;
  xp: number;
  level: number;
  coins: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuthStore();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, email, xp, level, coins')
          .order('xp', { ascending: false })
          .limit(100);

        if (error) throw error;
        setEntries(data || []);
      } catch (e: any) {
        console.error('Error fetching leaderboard:', e);
        setError('No se pudo cargar la tabla de clasificación. Asegúrate de haber ejecutado las migraciones SQL en Supabase.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Suscripción en tiempo real
    const channel = supabase.channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <BackButton />
        <h1 className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
          <Trophy className="text-yellow-400" /> Leaderboard Global
        </h1>
        <p className="text-[#8888b0] text-sm mt-1">
          Los mejores traders de HodlVille. Gana XP en batallas y trades para subir de rango.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[#8888b0] animate-pulse">Cargando clasificación...</div>
      ) : error ? (
        <div className="glass-card !p-6 border-red-500/20 bg-red-500/5 text-red-200 text-center">
          {error}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(99,102,241,0.08)] bg-[rgba(5,5,15,0.3)]">
                  <th className="p-4 text-[#8888b0] font-medium text-xs w-16 text-center"><Hash size={14} className="mx-auto" /></th>
                  <th className="p-4 text-[#8888b0] font-medium text-xs">Trader</th>
                  <th className="p-4 text-[#8888b0] font-medium text-xs text-right">Nivel</th>
                  <th className="p-4 text-[#8888b0] font-medium text-xs text-right">XP Total</th>
                  <th className="p-4 text-[#8888b0] font-medium text-xs text-right">Monedas</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#5c5c80]">No hay datos disponibles.</td>
                  </tr>
                ) : (
                  entries.map((entry, index) => {
                    const isMe = profile?.user_id === entry.user_id;
                    return (
                      <tr 
                        key={entry.user_id} 
                        className={`border-b border-[rgba(99,102,241,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors ${isMe ? 'bg-[rgba(34,214,94,0.05)]' : ''}`}
                      >
                        <td className="p-4 text-center font-bold">
                          {index === 0 ? <Medal className="text-yellow-400 mx-auto" size={18} /> : 
                           index === 1 ? <Medal className="text-gray-300 mx-auto" size={18} /> : 
                           index === 2 ? <Medal className="text-amber-600 mx-auto" size={18} /> : 
                           <span className="text-[#5c5c80]">{index + 1}</span>}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-[10px] text-white font-bold">
                              {entry.email.charAt(0).toUpperCase()}
                            </div>
                            <span className={`font-medium ${isMe ? 'text-[#22d65e]' : 'text-[#d0d0e0]'}`}>
                              {entry.email.split('@')[0]} {isMe && '(Tú)'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="px-2 py-1 rounded bg-[rgba(255,255,255,0.05)] text-xs font-bold text-white">
                            Nv.{entry.level}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono text-sm text-[#8888b0]">
                          {entry.xp.toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-mono text-sm text-yellow-500">
                          {entry.coins.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}