import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nocturne Swap",
  description: "Nocturne Swap — simulated token/currency swap experience.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      {/* suppressHydrationWarning: some browser extensions (e.g. ColorZilla) inject
          attributes like cz-shortcut-listen onto <body> before hydration, causing a
          false-positive mismatch warning unrelated to app code. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
