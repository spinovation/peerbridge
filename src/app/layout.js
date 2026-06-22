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
  title: "Peer Bridge | Private Debt, Equity & AI Brokerage Ecosystem",
  description: "Compliant peer-to-peer commercial debt notes and SAFE crowdfunding syndicate engine. Bypasses traditional credit bureaus via Plaid & ADP verified payroll telemetry.",
  keywords: [
    "P2P Lending", 
    "Private Debt Notes", 
    "Venture Equity", 
    "Regulation Crowdfunding", 
    "Reg CF", 
    "Reg D", 
    "SEC Compliance", 
    "Payroll Underwriting Bypass", 
    "Behavioral Risk Score BRS", 
    "Post-Quantum Cryptography"
  ],
  authors: [{ name: "Peer Bridge Networks Inc." }],
  openGraph: {
    title: "Peer Bridge | Private Debt, Equity & AI Brokerage Ecosystem",
    description: "Compliant peer-to-peer commercial debt notes and SAFE crowdfunding syndicate engine. Bypasses traditional credit bureaus via Plaid & ADP verified payroll telemetry.",
    url: "https://peerbridge.ai",
    siteName: "Peer Bridge",
    images: [
      {
        url: "https://peerbridge.ai/logo.png",
        width: 1200,
        height: 630,
        alt: "Peer Bridge Private Capital Ecosystem",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Peer Bridge | Private Debt, Equity & AI Brokerage Ecosystem",
    description: "Compliant peer-to-peer commercial debt notes and SAFE crowdfunding syndicate engine with ADP & Plaid underwriting bypass.",
    images: ["https://peerbridge.ai/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
