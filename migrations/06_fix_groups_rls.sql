-- Drop existing policy
DROP POLICY IF EXISTS "Users can view groups they are members of" ON groups;

-- Re-create policy to include creators
CREATE POLICY "Users can view groups they are members of or created" ON groups FOR SELECT TO authenticated USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM group_members WHERE group_members.group_id = groups.id AND group_members.user_id = auth.uid()
    )
);
