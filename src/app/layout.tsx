import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { OnlineStatus } from "@/components/online-status";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CryptoShop - Premium Decentralized Marketplace",
  description: "Anonymous decentralized marketplace with Bitcoin payments. Premium shopping experience with Web3 technology.",
  keywords: ["CryptoShop", "Bitcoin", "Marketplace", "Decentralized", "Web3", "Anonymous"],
  authors: [{ name: "CryptoShop Team" }],
  openGraph: {
    title: "CryptoShop - Premium Decentralized Marketplace",
    description: "Anonymous decentralized marketplace with Bitcoin payments",
    url: "https://cryptoshop.example.com",
    siteName: "CryptoShop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CryptoShop - Premium Decentralized Marketplace",
    description: "Anonymous decentralized marketplace with Bitcoin payments",
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'CryptoShop',
    'application-name': 'CryptoShop',
    'theme-color': '#000000',
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'manifest', url: '/manifest.json' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CryptoShop" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster />
          <PerformanceMonitor />
          <OnlineStatus />
          <script src="/chunk-error-handler.js" async></script>
          
          {/* Service Worker Registration */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js')
                      .then(registration => {
                        console.log('SW registered: ', registration);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                          const installingWorker = registration.installing;
                          installingWorker.addEventListener('statechange', () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              // New content is available
                              if (confirm('New version available! Reload to update?')) {
                                window.location.reload();
                              }
                            }
                          });
                        });
                      })
                      .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }

                // Initialize offline database
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.ready.then(registration => {
                    registration.active?.postMessage({ type: 'INIT_OFFLINE_DB' });
                  });
                }

                // PWA Install Prompt
                let deferredPrompt;
                window.addEventListener('beforeinstallprompt', (e) => {
                  e.preventDefault();
                  deferredPrompt = e;
                  
                  // Show custom install button if desired
                  const installButton = document.getElementById('pwa-install-button');
                  if (installButton) {
                    installButton.style.display = 'block';
                    installButton.addEventListener('click', () => {
                      deferredPrompt.prompt();
                      deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                          console.log('User accepted the install prompt');
                        } else {
                          console.log('User dismissed the install prompt');
                        }
                        deferredPrompt = null;
                      });
                    });
                  }
                });

                // Handle app installed
                window.addEventListener('appinstalled', (evt) => {
                  console.log('CryptoShop was installed.');
                  const installButton = document.getElementById('pwa-install-button');
                  if (installButton) {
                    installButton.style.display = 'none';
                  }
                });

                // Initialize online status is now handled by OnlineStatus component
              `,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
