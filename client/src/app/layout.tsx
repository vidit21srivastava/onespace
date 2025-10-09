import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Onespace",
  description: "One space for productivity",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logolight.svg",
        href: "/logolight.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logodark.svg",
        href: "/logodark.svg",
      }
    ]
  }

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
