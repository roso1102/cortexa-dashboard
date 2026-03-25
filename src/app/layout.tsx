import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Cortexa Dashboard",
  description: "Interactive dashboard for your Cortexa memory system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} ${manrope.variable} ${newsreader.variable} font-sans antialiased text-zinc-900`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
