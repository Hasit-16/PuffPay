-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to delete their own transactions (where they are payer or borrower)
CREATE POLICY "Users can delete their own transactions"
ON transactions
FOR DELETE
USING (
  auth.uid() = payer_id OR auth.uid() = borrower_id
);

-- Ensure users can update their own transactions too
CREATE POLICY "Users can update their own transactions"
ON transactions
FOR UPDATE
USING (
  auth.uid() = payer_id OR auth.uid() = borrower_id
);
