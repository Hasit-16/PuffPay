# Troubleshooting Guide

## "Failed to upload image" Error

This error usually occurs because the Supabase Storage bucket for `avatars` has not been created or the Row Level Security (RLS) policies are preventing the upload.

### How to Fix

You need to run the SQL commands provided in `supabase/storage.sql` to set up the storage bucket and permissions correctly.

#### Steps:

1.  **Open your Supabase Project Dashboard** in your browser.
2.  Click on the **SQL Editor** icon (represented by `_ >_`) in the left sidebar.
3.  Click **New Query**.
4.  Copy the entire content of the file `supabase/storage.sql` from your project.
5.  Paste the content into the SQL Editor.
6.  Click the **Run** button (bottom right of the editor).

You should see a message indicating the query ran successfully. Once done, try uploading your avatar again.
