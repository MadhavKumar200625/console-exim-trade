import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#f5f9ff] text-[#003466] font-sans">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}