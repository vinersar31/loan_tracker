import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Loan Tracker — Mortgage Dashboard",
  description: "Track your mortgage payments, balance and progress.",
};

export const viewport = {
  themeColor: "#111315",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans`}>{children}</body>
    </html>
  );
}
