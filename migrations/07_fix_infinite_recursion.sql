-- Create a secure function to check membership
CREATE OR REPLACE FUNCTION is_group_member(_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = _group_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;

-- Create new policy using the function
CREATE POLICY "Users can view members of their groups" ON group_members FOR SELECT TO authenticated USING (
    -- User can see their own row
    user_id = auth.uid() OR
    -- Group creator can see all members
    EXISTS (
        SELECT 1 FROM groups 
        WHERE groups.id = group_members.group_id 
        AND groups.created_by = auth.uid()
    ) OR
    -- Members can see other members (using secure function to avoid recursion)
    is_group_member(group_id)
);
