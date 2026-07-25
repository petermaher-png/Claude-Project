import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PMG Solution Engine",
  description:
    "Internal tool that translates client needs into equipment, material, and sourcing recommendations.",
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
