-- Add puff_score to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS puff_score INTEGER DEFAULT 500;

-- Update existing profiles that might have NULL to have the default 500
UPDATE public.profiles
SET puff_score = 500
WHERE puff_score IS NULL;
