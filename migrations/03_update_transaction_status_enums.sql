-- Migration to standardize transaction statuses
-- We are moving to: 'pending', 'confirming', 'settled', 'rejected'

-- Update 'paid' to 'settled' (assuming 'paid' meant fully complete in old system)
UPDATE transactions
SET status = 'settled'
WHERE status = 'paid';

-- Update 'confirmed' to 'settled' (if used)
UPDATE transactions
SET status = 'settled'
WHERE status = 'confirmed';

-- Optional: Add check constraint to enforce these values
-- ALTER TABLE transactions ADD CONSTRAINT status_check CHECK (status IN ('pending', 'confirming', 'settled', 'rejected'));
