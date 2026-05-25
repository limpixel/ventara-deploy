import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "leaflet/dist/leaflet.css";
import "./globals.css";

import { TrainingProvider } from "@/app/context/TrainingContext";      // ← ADD
import TrainingBanner from "@/app/components/training/TrainingBanner"; // ← ADD
import { GenerateProvider } from "@/app/context/GenerateContext";
import GenerateBanner from "@/app/components/training/GenerateBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ventara",
  description: "Forecasting & Prediction Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`
          ${inter.variable}
          font-sans
          antialiased
          min-h-screen
          bg-gray-50
          text-gray-900
        `}
      >
        <TrainingProvider>
        <GenerateProvider>  {/* ← tambah */}
          {children}
          <TrainingBanner />
          <GenerateBanner /> {/* ← toast generate global */}
        </GenerateProvider>
      </TrainingProvider>
      </body>
    </html>
  );
}