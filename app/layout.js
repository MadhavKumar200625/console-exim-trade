import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApiRequestLogger from "@/components/ApiRequestLogger";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#f5f9ff] text-[#003466] font-sans">
        <ApiRequestLogger />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
