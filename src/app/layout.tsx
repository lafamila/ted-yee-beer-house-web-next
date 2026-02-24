import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { AppProvider } from "@/contexts/AppContext";
import "./globals.css";

import BackgroundEffect from "@/components/layout/BackgroundEffect";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

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
      <body className={`${spaceGrotesk.className} antialiased font-sans min-h-screen bg-black text-white selection:bg-[#3994ef] selection:text-white relative`}>
        <BackgroundEffect />
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
