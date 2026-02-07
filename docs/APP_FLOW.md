# 🗺️ APP_FLOW & DIRECTORY STRUCTURE

## 1. User Journey Map
1.  **Onboarding:**
    * User lands on `/login` -> Authenticates via Google (Supabase).
    * Redirects to `/dashboard`.
2.  **Dashboard (Home):**
    * Views "Net Balance" (Green/Red card).
    * Views List of Friends (Traffic Light status).
    * **Action A:** Tap "They Owe" -> Go to `/expense/add`.
    * **Action B:** Tap "I Owe" -> Go to `/settle/[friendId]`.
3.  **Add Expense:**
    * Select Friend/Group -> Enter Amount -> Select Tag (Puff/Chai) -> Confirm.
    * Redirect to `/dashboard`.
4.  **Settle Up:**
    * Enter Amount (Partial/Full) -> Confirm Payment.
    * Redirect to `/dashboard`.

## 2. Directory Structure (Next.js App Router)
The project MUST follow this structure. Do not create `pages/` directory.

```text
/app
  /layout.tsx          # Main layout (Supabase Provider, Toaster)
  /page.tsx            # Redirects to /dashboard or /login
  /login/
    page.tsx           # Login Screen (Google Auth Button)
  /dashboard/
    page.tsx           # Main Traffic Light UI
    loading.tsx        # Skeleton loaders
  /expense/
    add/
      page.tsx         # Add Expense Form
  /settle/
    [id]/
      page.tsx         # Settle Up Screen (Dynamic Route for Friend ID)
  /activity/
    page.tsx           # Transaction History List
  /profile/
    page.tsx           # User Settings & Trust Score
/components
  /ui                  # Shadcn UI Components (Button, Card, Input)
  /dashboard           # Specific components (BalanceCard, FriendRow)
  /forms               # Forms (AddExpenseForm, SettleForm)
/lib
  supabase.ts          # Supabase Client definition
  utils.ts             # CN helper for Tailwind
/types
  index.ts             # TypeScript Interfaces (Profile, Transaction)