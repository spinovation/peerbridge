import { Geist, Geist_Mono, Caveat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "Peer Bridge | Invitation-Only P2P Funding Platform",
  description: "A secure, vetted peer-to-peer ecosystem connecting entrepreneurs, professional affiliates, and investors with advanced background screening, KYC verification, and full-stack portfolio capabilities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
