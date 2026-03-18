-- Alerts table for persistent alert storage
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  module TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Global',
  resolved BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Everyone can read alerts
CREATE POLICY "Anyone can read alerts"
  ON public.alerts FOR SELECT TO authenticated USING (true);

-- Admin/analyst can create alerts
CREATE POLICY "Authenticated users can create alerts"
  ON public.alerts FOR INSERT TO authenticated WITH CHECK (true);

-- Admin can resolve/update alerts
CREATE POLICY "Admin can update alerts"
  ON public.alerts FOR UPDATE TO authenticated USING (true);

-- Admin can delete alerts
CREATE POLICY "Admin can delete alerts"
  ON public.alerts FOR DELETE TO authenticated USING (true);

-- Extend uploads table with new columns
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS ndvi_value NUMERIC;
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS ndwi_value NUMERIC;
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS flood_risk TEXT;
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS processing_time NUMERIC;
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS model_version TEXT;
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS image_size TEXT;
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS band_info TEXT;
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS analysis_model TEXT DEFAULT 'rgb';
