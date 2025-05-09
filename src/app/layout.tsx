import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Note Organizer",
  description: "Organize, search, and summarize academic notes with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
