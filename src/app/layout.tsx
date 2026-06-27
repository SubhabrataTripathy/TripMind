import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "700", "800"]
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "TripMind - Smart AI Travel Planner",
  description: "Plan your perfect trip in seconds with AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <body className="font-sans antialiased text-slate-800 bg-slate-50">{children}</body>
    </html>
  );
}
