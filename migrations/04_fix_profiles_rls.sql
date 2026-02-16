-- Drop the existing policy first to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Re-create it to ensure it's correct
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
TO authenticated
USING ( true );
