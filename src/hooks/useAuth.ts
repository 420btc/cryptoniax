'use client';

import { useEffect } from 'react';
import { supabase, signOut as supabaseSignOut, fetchProfile, updateProfile } from '@/lib/supabase';
import { connectMetaMask as web3Connect } from '@/lib/web3';
import { create } from 'zustand';
import { usePortfolioStore } from './usePortfolio';

interface AuthState {
  session: any;
  profile: any;
  loading: boolean;
  isGuest: boolean;
  setSession: (session: any) => void;
  setProfile: (profile: any) => void;
  connectMetaMask: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  loading: true,
  isGuest: false,

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),

  connectMetaMask: async () => {
    const address = await web3Connect();
    if (!address) return;

    // Sign in anonymously with Supabase
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Failed to create session:', error);
      return;
    }

    if (data?.user) {
      const userId = data.user.id;
      const displayName = address.slice(0, 8) + '...' + address.slice(-4);
      
      // Create/update profile with wallet address
      await updateProfile(userId, {
        wallet_address: address,
        email: displayName,
        avatar_url: null,
      });

      set({
        session: data.session,
        profile: {
          user_id: userId,
          wallet_address: address,
          email: displayName,
        },
        isGuest: false,
        loading: false,
      });

      await usePortfolioStore.getState().initFromSupabase(userId);
    }
  },

  signInAsGuest: () => {
    set({
      session: { user: { id: 'guest', email: 'invitado@hodlville.game' } },
      profile: { email: 'invitado@hodlville.game', avatar_url: null },
      isGuest: true,
      loading: false,
    });
    usePortfolioStore.setState({
      userId: 'guest',
      coins: 1000,
      xp: 25,
      level: 2,
      holdings: { BTC: 0.05, ETH: 0.5, SOL: 2 },
      activeTrades: [],
      closedTrades: [],
      house: { id: 'house_guest', user_id: 'guest', level: 2, style: 'wood_house', size: 40, decorations: [], x: 200, y: 100 },
    });
  },

  signOut: async () => {
    await supabaseSignOut();
    set({ session: null, profile: null, isGuest: false });
    usePortfolioStore.setState({
      userId: null, coins: 10, xp: 0, level: 1,
      activeTrades: [], closedTrades: [],
      holdings: { BTC: 0, ETH: 0, SOL: 0 },
    });
  },

  initAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, loading: false, isGuest: false });

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          set({ profile });
          await usePortfolioStore.getState().initFromSupabase(session.user.id);
        }
      }
    } catch (e) {
      set({ loading: false });
    }

    supabase.auth.onAuthStateChange(async (_e: any, session: any) => {
      set({ session, loading: false, isGuest: false });
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          set({ profile });
          await usePortfolioStore.getState().initFromSupabase(session.user.id);
        }
      } else {
        set({ profile: null });
        usePortfolioStore.setState({
          userId: null, coins: 10, xp: 0, level: 1,
          activeTrades: [], closedTrades: [],
          holdings: { BTC: 0, ETH: 0, SOL: 0 },
        });
      }
    });
  },
}));

export function useAuth() {
  const auth = useAuthStore();
  useEffect(() => {
    if (!auth.session && !auth.profile) auth.initAuth();
  }, []);
  return auth;
}
