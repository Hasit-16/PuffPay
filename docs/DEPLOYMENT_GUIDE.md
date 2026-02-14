# PuffPay Deployment Guide

This guide will walk you through deploying your PuffPay application to Vercel for production.

## Step 1: Push to GitHub

Ensure your latest code is pushed to your GitHub repository.

1.  Open your terminal.
2.  Run the following commands:
    ```bash
    git add .
    git commit -m "ready for deploy"
    git push origin main
    ```
    *(If you haven't set up a remote repository yet, create one on GitHub and follow the instructions to push your existing code.)*

## Step 2: Vercel Setup

1.  Go to [Vercel.com](https://vercel.com) and log in.
2.  Click **"Add New..."** -> **"Project"**.
3.  Select **"Import"** next to your `PuffPay` repository.

## Step 3: Environment Variables (Crucial)

**Do not deploy yet!** You must configure your environment variables first.

1.  In the Vercel project configuration screen, find the **"Environment Variables"** section.
2.  Add the following variables (copy values from your local `.env.local` file):
    *   **`NEXT_PUBLIC_SUPABASE_URL`**: Your Supabase project URL.
    *   **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Your Supabase anonymous API key.

3.  Click **Deploy**.

## Step 4: Supabase Auth Redirects (CRITICAL)

For login to work in production, you must whitelist your Vercel URL in Supabase.

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project.
3.  Go to **Authentication** -> **URL Configuration**.
4.  In **"Site URL"**, enter your main Vercel domain (e.g., `https://puffpay.vercel.app`).
5.  In **"Redirect URLs"**, add:
    *   `https://puffpay.vercel.app/**` (This allows redirects to any page on your site).
6.  Click **Save**.

## Verification

Visit your deployed URL (e.g., `https://puffpay.vercel.app`).
1.  Try logging in.
2.  Verify that your dashboard loads correctly.
3.  Test creating an expense.

**Congratulations! Your PWA is live! 🚀**
