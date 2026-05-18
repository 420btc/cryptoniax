'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// ===== AUTH =====
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function signInWithWallet(address: string) {
  // Store wallet address as metadata
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  await supabase.from('profiles').upsert({
    user_id: data.user?.id,
    wallet_address: address,
  });
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ===== PROFILES =====
export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Record<string, any>) {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw error;
}

// ===== HOLDINGS =====
export async function fetchHoldings(userId: string) {
  const { data, error } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

export async function updateHolding(userId: string, symbol: string, amount: number) {
  const { error } = await supabase
    .from('holdings')
    .upsert({
      user_id: userId,
      symbol,
      amount,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,symbol' });
  if (error) throw error;
}

// ===== TRADES =====
export async function fetchActiveTrades(userId: string) {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchClosedTrades(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'open')
    .order('closed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function createTrade(trade: {
  user_id: string;
  symbol: string;
  type: string;
  side: string;
  exchange: string;
  entry_price: number;
  amount: number;
  leverage: number;
  tp_price?: number;
  sl_price?: number;
  entry_fees?: number;
}) {
  const { data, error } = await supabase
    .from('trades')
    .insert({ ...trade, status: 'open', created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function closeTrade(tradeId: string, pnl: number) {
  const { error } = await supabase
    .from('trades')
    .update({
      status: 'closed',
      pnl,
      closed_at: new Date().toISOString(),
    })
    .eq('id', tradeId);
  if (error) throw error;
}

// ===== HOUSES =====
export async function fetchHouse(userId: string) {
  const { data, error } = await supabase
    .from('houses')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upgradeHouse(userId: string, style: string, level: number) {
  const { error } = await supabase
    .from('houses')
    .upsert({
      user_id: userId,
      style,
      level,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  if (error) throw error;
}

// ===== CHARACTERS =====
export async function createCharacter(char: {
  user_id: string;
  trade_id: string;
  type: string;
  exchange: string;
}) {
  const { data, error } = await supabase
    .from('characters')
    .insert({
      ...char,
      hp: 100,
      atk: 10,
      def: 5,
      level: 1,
      xp: 0,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchCharacters(userId: string) {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

// ===== REALTIME SUBSCRIPTIONS =====
export function subscribeToTrades(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('trades-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'trades', filter: `user_id=eq.${userId}` },
      callback
    )
    .subscribe();
}

export function subscribeToHoldings(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('holdings-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'holdings', filter: `user_id=eq.${userId}` },
      callback
    )
    .subscribe();
}
