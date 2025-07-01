import type { Metadata } from "next";
import { Poppins, Source_Sans_3 as SourceSansPro } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["600", "700"],
});

const sourceSansPro = SourceSansPro({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans-pro",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Flicklog",
  description: "Your personal and shared movie scrapbook.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen font-body antialiased",
          poppins.variable,
          sourceSansPro.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}