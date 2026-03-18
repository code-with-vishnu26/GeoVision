-- Add ndvi_value column to uploads table
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS ndvi_value NUMERIC;
-- Add analysis model type
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS analysis_model TEXT DEFAULT 'rgb';
