import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import IOSInstallPrompt from "@/components/IOSInstallPrompt";
import BottomNav from "@/components/layout/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#09090B",
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
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#09090b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/android-chrome-192x192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} text-zinc-50 antialiased`}>
        <div className="fixed inset-0 -z-20 bg-[#09090B]"></div>
        {/* The main soft bulb */}
        <div className="fixed top-[-250px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/30 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

        {/* The bright "hot spot" center */}
        <div className="fixed top-[-100px] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-white/60 blur-[60px] rounded-full -z-10 pointer-events-none"></div>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="pb-32 animate-in fade-in duration-500">
            {children}
          </main>
          <BottomNav />
          <IOSInstallPrompt />
        </ThemeProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            classNames: {
              toast: "group bg-black/60 backdrop-blur-xl border border-white/10 text-zinc-50 shadow-2xl rounded-2xl p-4",
              title: "text-zinc-50 font-medium text-sm",
              description: "text-zinc-400 text-xs",
              actionButton: "bg-green-500 text-zinc-950",
              cancelButton: "bg-white/10 text-zinc-300",
              success: "group-[.toast]:border-green-500/50 group-[.toast]:text-green-400",
              error: "group-[.toast]:border-red-500/50 group-[.toast]:text-red-400",
            }
          }}
        />
      </body>
    </html>
  );
}
