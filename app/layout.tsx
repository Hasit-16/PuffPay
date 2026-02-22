import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "PuffPay",
  description: "Track shared expenses with friends.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "PuffPay",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} text-zinc-50 antialiased`}>
        <div className="fixed inset-0 -z-20 bg-[#09090B]"></div>
        <div className="fixed top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-500/15 blur-[120px] rounded-[100%] pointer-events-none -z-10"></div>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="pb-28">
            {children}
          </main>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
