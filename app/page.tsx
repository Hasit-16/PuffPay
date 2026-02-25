import { redirect } from "next/navigation";

export default function Home() {
  // Automatically redirect users from the root to the dashboard.
  // (Your auth middleware should handle kicking them to /login if they are unauthenticated)
  redirect("/dashboard");
}
