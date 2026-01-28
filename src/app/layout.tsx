import type { Metadata } from "next";
import { AppProvider } from "@/contexts/AppContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeddyNote - Developer Memo App",
  description: "A specialized memo application for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AppProvider>
          {children}
          {/* <Header /> */}
          {/* <main className="pt-14 pb-10">
            {children}
          </main> */}
          {/* <Footer /> */}
        </AppProvider>
      </body>
    </html>
  );
}
