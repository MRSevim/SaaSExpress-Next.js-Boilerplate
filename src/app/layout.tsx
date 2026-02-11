import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { Provider as ThemeProvider } from "@/features/theme/utils/contexts/ThemeContext";
import Header from "@/components/header/Header";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/utils/env";
import { Suspense } from "react";
import { getSession } from "@/features/auth/utils/apiCalls";
import ClientWrapper from "@/utils/ClientWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Next.js SaaSExpress Starter Kit";
const description = "Start your Next.js project with this SaaS starter kit!";

export const metadata: Metadata = {
  metadataBase: new URL(env.BASE_URL!),
  title: {
    template: "%s | WordBattles",
    default: title,
  },
  alternates: {
    canonical: "/",
  },
  description,
  keywords: "wow, such , nice , kit",
  openGraph: {
    title,
    description,
    url: "/",
    siteName: title,
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <BodyWrapper>
        {children}
        <Toaster />
      </BodyWrapper>
    </Suspense>
  );
}

async function BodyWrapper({ children }: { children: React.ReactNode }) {
  const [cookieStore, user] = await Promise.all([cookies(), getSession()]);
  const theme = cookieStore.get("theme")?.value;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col 
        justify-between ${theme === "dark" ? "dark" : ""}`}
      >
        <ThemeProvider initialTheme={theme}>
          <ClientWrapper user={user}>
            <Header />
            {children}
            <Toaster />
          </ClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
