'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { connectMetaMask } from '@/lib/web3';
import { create } from 'zustand';

interface AuthState {
  session: any | null;
  profile: any | null;
  loading: boolean;
  setSession: (s: any | null) => void;
  setProfile: (p: any) => void;
  setLoading: (l: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  loading: true,
  setSession: (s) => set({ session: s }),
  setProfile: (p) => set({ profile: p }),
  setLoading: (l) => set({ loading: l }),
}));

export function useAuth() {
  const { session, profile, loading, setSession, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  }

  return { session, profile, loading, signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } }), signOut: () => supabase.auth.signOut(), connectMetaMask, refreshProfile: () => session?.user && fetchProfile(session.user.id) };
}
