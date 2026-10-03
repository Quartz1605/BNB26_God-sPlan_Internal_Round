import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const caveatHandwriting = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "CreatorAI — Digital Creative Studio",
  description: "An editorial digital creative studio for filmmakers and content creators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${dmSerif.variable} ${jetbrainsMono.variable} ${caveatHandwriting.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#210709] text-[#F4EDE4] selection:bg-[#C94345]/30 selection:text-[#F4EDE4]">
        {children}
      </body>
    </html>
  );
}
