-- Allow creators to update their groups
CREATE POLICY "Users can update their own groups" ON groups FOR UPDATE TO authenticated USING (
    created_by = auth.uid()
) WITH CHECK (
    created_by = auth.uid()
);

-- Allow creators to delete their groups
CREATE POLICY "Users can delete their own groups" ON groups FOR DELETE TO authenticated USING (
    created_by = auth.uid()
);

-- Allow creators to delete members from their groups
CREATE POLICY "Users can remove members from their own groups" ON group_members FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT 1 FROM groups WHERE groups.id = group_members.group_id AND groups.created_by = auth.uid()
    )
);
