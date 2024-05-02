import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes';
import RootProviders from "@/components/providers/RootProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "App to track all your budgets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark
      }}>
      <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
        <body className={inter.className}>
          <RootProviders>
            <main>
              {children}
            </main>
          </RootProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
