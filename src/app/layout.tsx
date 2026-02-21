import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VoltTrack — EV Charging Tracker",
  description:
    "Track your electric vehicle charging sessions, energy usage, and costs with VoltTrack.",
  icons: {
    icon: "/favicon.ico",
  },
};

import { CsrfProvider } from "@/components/auth/CsrfProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-black text-zinc-100">
        <CsrfProvider>
          {children}
        </CsrfProvider>
      </body>
    </html>
  );
}
