import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Container from "@/app/container";
import Modal from "@/components/Modal";
import { LocaleProvider } from "../context/LocaleContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Openware Myanmar",
  description: "POS & Inventory Management",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="min-h-screen">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
         <LocaleProvider>
            <Container>
              {children}
            </Container>
            <Modal/>
         </LocaleProvider>
      </body>
    </html>
  );
}
