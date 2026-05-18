-- HodlVille: User Locations for 3D Battle Globe
-- Stores real user locations (opt-in) for the global battle map

CREATE TABLE IF NOT EXISTS public.user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS: Users can read all locations, but only update their own
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view locations"
  ON public.user_locations FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own location"
  ON public.user_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own location"
  ON public.user_locations FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast nearby queries
CREATE INDEX idx_user_locations_geo ON public.user_locations (latitude, longitude);
CREATE INDEX idx_user_locations_online ON public.user_locations (is_online) WHERE is_online = true;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_locations_updated_at
  BEFORE UPDATE ON public.user_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
