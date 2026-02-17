-- Drop the recursive policy on groups
DROP POLICY IF EXISTS "Users can view groups they are members of or created" ON groups;

-- Re-create policy using the secure function to avoid recursion
CREATE POLICY "Users can view groups they are members of or created" ON groups FOR SELECT TO authenticated USING (
    created_by = auth.uid() OR
    is_group_member(id)
);
