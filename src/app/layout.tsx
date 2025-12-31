import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { Provider as ThemeProvider } from "@/features/theme/utils/contexts/ThemeContext";
import Header from "@/components/header/Header";
import { Toaster } from "@/components/ui/sonner";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
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
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col 
        justify-between ${theme === "dark" ? "dark" : ""}`}
      >
        <ThemeProvider initialTheme={theme}>
          <Header />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
