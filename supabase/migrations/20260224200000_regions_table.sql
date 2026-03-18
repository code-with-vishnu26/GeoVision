-- Regions table for automated monitoring
CREATE TABLE IF NOT EXISTS public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  bbox JSONB DEFAULT '{}',
  last_processed TIMESTAMPTZ,
  average_ndvi NUMERIC,
  average_ndwi NUMERIC,
  risk_level TEXT DEFAULT 'Unknown',
  ndvi_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read regions"
  ON public.regions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage regions"
  ON public.regions FOR ALL TO authenticated USING (true);

-- Seed monitored regions
INSERT INTO public.regions (name, latitude, longitude, bbox) VALUES
  ('Amazon Basin', -3.4653, -62.2159, '{"south":-15,"north":5,"west":-73,"east":-50}'),
  ('Congo Basin', 0.0, 22.0, '{"south":-5,"north":5,"west":15,"east":30}'),
  ('Ganges Delta', 22.5, 90.0, '{"south":21,"north":24,"west":88,"east":92}'),
  ('Lake Chad', 13.0, 14.5, '{"south":12,"north":14,"west":13,"east":16}'),
  ('Borneo Rainforest', 1.0, 114.0, '{"south":-4,"north":7,"west":108,"east":119}'),
  ('Great Barrier Reef', -18.0, 147.0, '{"south":-24,"north":-10,"west":143,"east":153}')
ON CONFLICT DO NOTHING;
