import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Osmo — Ciências que Conectam",
    template: "%s | Osmo",
  },
  description: "Plataforma educacional de ciências com vídeos, artigos interativos e simulações.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={montserrat.variable}>
        {children}
      </body>
    </html>
  );
}
