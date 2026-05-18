'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function CallbackHandler() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      try {
        // First: try to get an existing session (hash may already be processed)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && !cancelled) {
          router.replace('/dashboard');
          return;
        }

        // Second: listen for auth state change (hash not yet processed)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event: any, session: any) => {
            if (session && !cancelled) {
              router.replace('/dashboard');
            }
          }
        );

        // Timeout fallback: if nothing happens in 10s, go to landing
        const timeout = setTimeout(() => {
          if (!cancelled) {
            setError('La autenticación tardó demasiado. Intenta de nuevo.');
          }
        }, 10000);

        return () => {
          clearTimeout(timeout);
          subscription.unsubscribe();
        };
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || 'Error al verificar identidad');
        }
      }
    }

    handleCallback();

    return () => { cancelled = true; };
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="text-center space-y-4 glass-card !p-8 max-w-md">
          <div className="text-4xl">⚠️</div>
          <p className="text-[#ef4466] text-sm font-medium">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 rounded-lg glass text-white text-sm hover:bg-[rgba(255,255,255,0.05)] transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
      <div className="text-center space-y-4">
        <div className="animate-spin w-10 h-10 border-2 border-[#818cf8] border-t-transparent rounded-full mx-auto" />
        <p className="text-[#8888b0] text-sm">Verificando identidad...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
