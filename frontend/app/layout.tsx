import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dental Multi-Agent Platform",
  description: "Basic scaffold for the SunLife dental care workflow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
