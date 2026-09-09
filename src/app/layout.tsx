
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";

const fontHeading = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fontBody = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "VIMERO — AI Content Command Center",
  description: "Platform manajemen konten berbasis AI untuk bisnis modern.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vimero",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

import { PwaRegistry } from "@/components/pwa-registry";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${fontHeading.variable} ${fontBody.variable} h-full antialiased dark`}
    >
      <body className={`${fontBody.className} min-h-full flex flex-col`}>
        <PwaRegistry />
        {children}
      </body>
    </html>
  );
}
