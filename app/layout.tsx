import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
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
  title: "Smart Hospital Workflow System",
  description:
    "A modern hospital management system with multi-role dashboards, appointment management, and prescription tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className:
              "!bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100 !shadow-lg !rounded-xl !border !border-slate-200 dark:!border-slate-700",
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
