# 📄 Product Requirement Document (PRD)

**Project Name:** PuffPay
**Version:** 1.0
**Status:** Draft
**Platform:** Progressive Web App (PWA)
**Target Device:** Mobile First (iOS/Android)

## 1. Executive Summary
PuffPay is a mobile-first Progressive Web App designed to solve "Canteen Amnesia"—the phenomenon where friends forget to pay back small, casual debts (tea, puffs, snacks). Unlike complex bill-splitting apps, PuffPay focuses on speed, "Traffic Light" status tracking, and maintaining social harmony through a casual, gamified interface.

## 2. Problem Statement
* **The Friction:** Existing payment apps are too formal for ₹20 debts.
* **The Memory Gap:** Small expenses are easily forgotten if not logged immediately.
* **The Awkwardness:** Asking a friend for ₹20 feels petty; an app notification removes the social awkwardness.

## 3. Target Audience
* College Students (Primary)
* Roommates / Flatmates
* Close Friend Circles

## 4. Key Features (MVP)

### A. Authentication & Onboarding
* **Google Login:** One-tap sign-in (via Supabase Auth).
* **Profile Setup:** Auto-fetch name and avatar from Google.
* **"Ghost" Handling:** Strict Mode. Users must invite friends to join via link before adding debts to them.

### B. Dashboard (The "Traffic Light" Hub)
* **Net Balance Card:** Shows a single calculated value (Green `+` or Red `-`).
* **Active Friends List:**
    * 🔴 **Red:** Debts the user owes (Action: "Pay").
    * 🟡 **Yellow:** Payments made but not confirmed (Action: "Wait").
    * 🟢 **Green:** Debts friends owe the user (Action: "Nudge").

### C. Adding Expenses (Lending)
* **Quick Add:** Input Amount → Select "Puff/Chai" Chip → Select Friend.
* **Group Mode:** Select a Group → Tap to exclude specific members (e.g., the birthday person) → Auto-split.

### D. Settling Up (Repayment)
* **Partial Payments:** User can pay ₹50 of a ₹100 debt.
* **Confirmation Flow:** Payer marks as "Paid" → Transaction becomes `PENDING` → Receiver must click "Confirm" to settle.

### E. Notifications
* **WhatsApp Integration:** "Nudge" button opens WhatsApp with a pre-filled message.
* **PWA Push Notifications:** For "New Debt Added" and "Payment Confirmation" requests.

## 5. Non-Functional Requirements
* **Performance:** App must load "Quick Add" screen in under 2 seconds.
* **Offline Mode:** Users can queue a debt while offline; syncs automatically when online.
* **Responsiveness:** Mobile-first design (looks like a native app on iOS/Android).
* **Security:** Row Level Security (RLS) ensures users only see their own transactions.

## 6. Success Metrics
* **"Time to Log":** Average time to add a debt should be < 10 seconds.
* **Retention:** Users logging at least 1 transaction per week.
* **Trust Score Adoption:** Users confirming payments within 24 hours.