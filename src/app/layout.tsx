import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/utils/env";
import { getSession } from "@/features/auth/utils/apiCalls";
import ClientWrapper from "@/utils/ClientWrapper";
import { Suspense } from "react";

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
  const userPromise = getSession();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
          try
          { var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);
            if(m&&decodeURIComponent(m[1])==="dark"){
            // Use cookie theme
             document.documentElement.classList.add(decodeURIComponent(m[1]));
            }
            else if(!m){
            // Auto-detect dark system preference on first load
             const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
             document.documentElement.classList.add("dark")
             document.cookie = "theme=${encodeURIComponent("dark")}; path=/; max-age=${365 * 24 * 60 * 60}"
            }
          }
          catch(e){console.error(e)}})()`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col justify-between`}
      >
        <ClientWrapper userPromise={userPromise}>
          <Header />
          {children}
          <Toaster />
        </ClientWrapper>
      </body>
    </html>
  );
}
