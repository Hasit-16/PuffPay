-- Enable RLS (safe to run multiple times)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid "already exists" error
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;

-- Re-create policies
CREATE POLICY "Users can delete their own transactions"
ON transactions
FOR DELETE
USING (
  auth.uid() = payer_id OR auth.uid() = borrower_id
);

CREATE POLICY "Users can update their own transactions"
ON transactions
FOR UPDATE
USING (
  auth.uid() = payer_id OR auth.uid() = borrower_id
);
