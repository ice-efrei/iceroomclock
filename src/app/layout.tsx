import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import {Providers} from "@/app/providers";

const poppins = Poppins({ subsets: ["latin"], style: ["italic", "normal"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "ICE Room Clock",
  description: "Animated clock for the Low Caltech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en" className="overflow-hidden">
    <Providers>
      <body className={poppins.className}>{children}</body>
    </Providers>
  </html>
  );
}
