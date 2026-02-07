# 🎨 FRONTEND DESIGN GUIDELINES

## 1. Color Palette (Traffic Light Theme)
* **Primary Green (Owed to You):** `bg-green-500` (#22c55e)
* **Primary Red (You Owe):** `bg-red-500` (#ef4444)
* **Warning Yellow (Pending):** `bg-yellow-400` (#facc15)
* **Background:** Dark Mode default (`bg-slate-950`).

## 2. Component Rules
* **Cards:** Use `shadcn/card` with rounded-xl borders.
* **Buttons:**
    * Primary Actions: Full width, h-12 (large touch target).
    * Secondary Actions: Ghost or Outline variant.
* **Typography:**
    * Headings: Bold, Tracking-tight.
    * Numbers: Monospace or Tabular nums (for prices).

## 3. Mobile-First Logic
* **Touch Targets:** All clickable elements must be at least 44px height.
* **Navigation:** Bottom Tab Bar is sticky.
* **Safe Area:** Ensure padding-bottom accounts for iOS Home Indicator.