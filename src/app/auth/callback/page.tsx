'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function CallbackHandler() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session) {
        router.push('/dashboard');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
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
