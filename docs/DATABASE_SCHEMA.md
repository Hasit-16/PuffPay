# 🦴 DATABASE SCHEMA (Supabase/PostgreSQL)

## 1. Table: profiles
*Extends Supabase Auth*
* `id` (uuid, PK) - Links to `auth.users.id`
* `username` (text)
* `avatar_url` (text)
* `trust_score` (int, default: 100)
* `updated_at` (timestamp)

## 2. Table: groups
* `id` (uuid, PK)
* `name` (text)
* `created_by` (uuid, FK -> profiles.id)
* `created_at` (timestamp)

## 3. Table: group_members
* `group_id` (uuid, FK -> groups.id)
* `user_id` (uuid, FK -> profiles.id)
* *Composite PK (group_id, user_id)*

## 4. Table: transactions
* `id` (uuid, PK)
* `payer_id` (uuid, FK -> profiles.id) - The person who PAID.
* `borrower_id` (uuid, FK -> profiles.id) - The person who OWES.
* `amount` (numeric, precision 10,2)
* `description` (text) - e.g., "Puff", "Chai"
* `status` (text) - Enum: 'PENDING', 'CONFIRMED', 'REJECTED'
* `created_at` (timestamp)

## 5. Row Level Security (RLS) Policies
* **Profiles:** Public read, Owner update.
* **Transactions:** Users can see transactions where they are either `payer_id` or `borrower_id`.