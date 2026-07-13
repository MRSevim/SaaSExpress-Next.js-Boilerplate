import { Geist, Geist_Mono } from "next/font/google";
import { Provider as ThemeProvider } from "@/features/theme/utils/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const Body = async ({
  theme,
  children,
}: {
  theme?: string;
  children: React.ReactNode;
}) => {
  "use cache";
  console.log("Body Rendered");
  return (
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col 
        justify-between ${theme === "dark" ? "dark" : ""}`}
    >
      <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>{" "}
    </body>
  );
};
