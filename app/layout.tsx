import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import IOSInstallPrompt from "@/components/IOSInstallPrompt";
import PWAProvider from "@/components/PWAProvider";

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
          <PWAProvider>
            <main className="pb-28">
              {children}
            </main>
          </PWAProvider>
          <IOSInstallPrompt />
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
