import "./globals.css";
import Script from "next/script";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MemoCross",
  description: "Mnemonic-based AI language learning",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Google Identity */}
      <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />

      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
