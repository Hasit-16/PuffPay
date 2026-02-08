
# 🗄️ Database Setup Instructions

To make the application work, you must set up the tables and policies in your Supabase project.

1.  **Go to Supabase Dashboard:**
    - Open your project.
    - Navigate to the **SQL Editor** (icon on the left sidebar).

2.  **Run the Schema Script:**
    - Copy the entire content of `supabase/schema.sql` (located in your project root).
    - Paste it into a new query window in Supabase.
    - Click **Run**.

3.  **Verify Tables:**
    - Go to **Table Editor**.
    - Confirm the existence of:
        - `public.profiles`
        - `public.friendships`
        - `public.transactions`

4.  **Verify Policies:**
    - Go to **Authentication > Policies**.
    - Ensure RLS is enabled and policies are listed for each table.

## Note on Types
The TypeScript interfaces in `types/index.ts` match this schema. If you modify the schema, update the types accordingly or run `supabase gen types` to automate it.
