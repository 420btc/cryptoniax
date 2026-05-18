-- ==========================================
-- HodlVille Database Schema v1
-- Paste into Supabase SQL Editor: 
-- https://supabase.com/dashboard/project/xnbtqkqzjmrgyokzungs/sql/new
-- ==========================================

-- PROFILES (extended user data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT,
  avatar_url TEXT,
  wallet_address TEXT,
  coins DECIMAL DEFAULT 10.0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- HOLDINGS (crypto amounts per user)
CREATE TABLE IF NOT EXISTS holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  amount DECIMAL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- TRADES (all trade history)
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL,
  side TEXT NOT NULL,
  exchange TEXT NOT NULL,
  entry_price DECIMAL NOT NULL,
  amount DECIMAL NOT NULL,
  leverage INTEGER DEFAULT 1,
  pnl DECIMAL DEFAULT 0,
  tp_price DECIMAL,
  sl_price DECIMAL,
  entry_fees DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'open',
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  _tp_extended BOOLEAN DEFAULT false,
  _wc_extended BOOLEAN DEFAULT false,
  _eff_locked BOOLEAN DEFAULT false,
  _t60_extension INTEGER DEFAULT 0,
  _trail_price DECIMAL,
  _trail_timestamp TIMESTAMPTZ
);

-- HOUSES (player house state)
CREATE TABLE IF NOT EXISTS houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  style TEXT DEFAULT 'tent',
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CHARACTERS (heroes linked to active trades)
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  exchange TEXT NOT NULL,
  hp INTEGER DEFAULT 100,
  atk INTEGER DEFAULT 10,
  def INTEGER DEFAULT 5,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, trade_id)
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_trades_user_status ON trades(user_id, status);
CREATE INDEX IF NOT EXISTS idx_holdings_user ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_user ON characters(user_id);

-- ==========================================
-- AUTO-PROVISION ON SIGNUP
-- ==========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (user_id, email, coins, xp, level)
  VALUES (NEW.id, NEW.email, 10, 0, 1);
  
  INSERT INTO holdings (user_id, symbol, amount)
  VALUES
    (NEW.id, 'BTC', 0),
    (NEW.id, 'ETH', 0),
    (NEW.id, 'SOL', 0);
    
  INSERT INTO houses (user_id, style, level)
  VALUES (NEW.id, 'tent', 1);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Holdings
CREATE POLICY "Users can read own holdings" ON holdings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own holdings" ON holdings
  FOR ALL USING (auth.uid() = user_id);

-- Trades
CREATE POLICY "Users can manage own trades" ON trades
  FOR ALL USING (auth.uid() = user_id);

-- Houses
CREATE POLICY "Users can manage own house" ON houses
  FOR ALL USING (auth.uid() = user_id);

-- Characters
CREATE POLICY "Users can manage own characters" ON characters
  FOR ALL USING (auth.uid() = user_id);
