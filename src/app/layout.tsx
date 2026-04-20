import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import pkg from "../../package.json";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "desplega.ai Evals",
  description: "Custom evals for AI agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <a
          href="https://github.com/desplega-ai/desplega.ai-evals"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed top-3 right-3 z-50 px-2 py-1 text-xs font-mono text-gray-500 bg-white/80 backdrop-blur border border-gray-200 rounded hover:text-gray-900 hover:border-gray-400 transition-colors"
          data-testid="app-version"
        >
          v{pkg.version}
        </a>
        {children}
      </body>
    </html>
  );
}
