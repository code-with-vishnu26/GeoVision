-- Add CNN and heat anomaly columns to uploads table
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS cnn_class TEXT;
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS cnn_confidence NUMERIC;
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS temperature_avg NUMERIC;
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS heat_risk TEXT;
