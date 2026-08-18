import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Lightfall Clock | Lightfall Countdown",
  description:
    "Countdown to Lightfall: releasing November 16, 2026.",
  keywords: [
    "Lightfall",
    "Ninefold Chord",
  ],
  authors: [{ name: "Ninefold Chord", url: "https://ninefold-chord-lightfall.vercel.app" }],
  creator: "Ninefold Chord",
  twitter: {
    card: "summary_large_image",
    creator: "@Ninefold Chord",
  },
  metadataBase: new URL("https://ninefold-chord-lightfall.vercel.app/"),

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cinzel.variable}>
        {children}
      </body>
    </html>
  );
}
