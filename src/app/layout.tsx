import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import Header from "@/components/header/Header";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/utils/env";
import React, { Suspense } from "react";
import { getSession } from "@/features/auth/utils/apiCalls";
import ClientWrapper from "@/utils/ClientWrapper";
import { Body } from "@/components/Body";

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
  // This Wrapper is here because not using suspense boundary raises error...

  const [cookieStore, user] = await Promise.all([cookies(), getSession()]);
  const theme = cookieStore.get("theme")?.value;

  return (
    <html lang="en">
      <Body theme={theme}>
        <ClientWrapper user={user}>
          <Header />
          {children}
          <Toaster />
        </ClientWrapper>
      </Body>
    </html>
  );
}
