import type { Metadata } from "next";
import { Geist as GeistFont, Geist_Mono as GeistMonoFont } from "next/font/google";

const geistSans = GeistFont({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = GeistMonoFont({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "15 Archivist",
  description: "Creator Dashboard",
};

import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/creator/theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-black text-gray-200`}>
      <ThemeProvider>
        {children}
        <Analytics />
      </ThemeProvider>
    </div>
  );
}
