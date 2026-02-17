-- Create groups table
CREATE TABLE groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create group_members table
CREATE TABLE group_members (
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Policies for groups
CREATE POLICY "Users can create groups" ON groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view groups they are members of" ON groups FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM group_members WHERE group_members.group_id = groups.id AND group_members.user_id = auth.uid()
    )
);

-- Policies for group_members
CREATE POLICY "Users can add members to groups they created" ON group_members FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
        SELECT 1 FROM groups WHERE groups.id = group_members.group_id AND groups.created_by = auth.uid()
    )
);

CREATE POLICY "Users can view members of their groups" ON group_members FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
    )
);
