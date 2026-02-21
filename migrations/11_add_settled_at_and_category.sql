-- Add settled_at column to track when a transaction status changes to 'settled'
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS settled_at TIMESTAMP WITH TIME ZONE;

-- Add category column with a default of 'Other'
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';

-- Update existing settled transactions to have a settled_at date (fallback to created_at + 1 day for legacy data)
UPDATE public.transactions 
SET settled_at = created_at + interval '1 day'
WHERE status = 'settled' AND settled_at IS NULL;
