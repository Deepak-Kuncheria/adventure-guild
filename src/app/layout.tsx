import type { Metadata } from "next";
import { Playfair_Display, Lora, UnifrakturCook } from "next/font/google";
import "@/styles/main.scss";
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});
const unifrakturCook = UnifrakturCook({
  variable: "--font-unifrakturCook",
  weight: "700",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Adventure Guild",
  description: "AI driven fictional adventures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${lora.variable} ${unifrakturCook.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
