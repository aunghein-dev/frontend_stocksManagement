import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google"; // Import Inter and Roboto
import "./globals.css";
import Container from "@/app/container";
import Modal from "@/components/Modal";
import { LocaleProvider } from "../context/LocaleContext";

// Configure Inter font with Roboto as a fallback
const inter = Inter({
  variable: "--font-inter", // Define a CSS variable for Inter
  subsets: ["latin"],
  display: "swap", // Optimize font loading
});

const roboto = Roboto({
  variable: "--font-roboto", // Define a CSS variable for Roboto
  weight: ["400", "700"], // Specify weights you want to use for Roboto
  subsets: ["latin"],
  display: "swap", // Optimize font loading
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
      {/* Apply the Inter font variable with Roboto as a fallback */}
      <body className={`${inter.variable} ${roboto.variable} font-sans antialiased min-h-screen`}>
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

