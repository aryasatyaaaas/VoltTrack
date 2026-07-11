import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CsrfProvider } from "@/components/auth/CsrfProvider";
import { Providers } from "./providers";
import { PWARegister } from "@/components/pwa/PWARegister";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF6B35" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A2E" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // For iPhone notch/Dynamic Island support
};

export const metadata: Metadata = {
  title: "VoltTrack — EV Charging Tracker",
  description:
    "Track your electric vehicle charging sessions, energy usage, and costs with VoltTrack.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VoltTrack",
  },
};

/** Inline script injected in <head> — runs before any paint to prevent flash */
const themeScript = `
(function() {
  try {
    var saved = localStorage.getItem('volttrack-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* No-flash theme restore — must run before CSS paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <CsrfProvider>
          <Providers>
            {children}
          </Providers>
        </CsrfProvider>
        <PWARegister />
      </body>
    </html>
  );
}
