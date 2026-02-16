-- Drop existing check constraint if it exists (handles 'pending', 'paid', 'confirmed', 'rejected')
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;

-- Add new check constraint with 'confirming' and 'settled'
ALTER TABLE transactions
ADD CONSTRAINT transactions_status_check
CHECK (status IN ('pending', 'paid', 'confirming', 'settled', 'rejected'));

-- Note: 'paid' and 'confirmed' might be legacy. 
-- Ideally we migrate 'paid' -> 'settled' if that's the intention, but let's keep them valid for now to avoid data loss.
