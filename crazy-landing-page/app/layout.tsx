import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

const inter = localFont({
  src: "./fonts/geist.woff2",
  variable: "--font-ui",
  display: "swap",
  weight: "100 900",
})
const mono = localFont({
  src: "./fonts/geist-mono.woff2",
  variable: "--font-code",
  display: "swap",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "BestLang — Software writes itself. Expertise stays yours.",
  description:
    "The autonomous programming language for a human-led future. Describe your system. Watch BestLang build it. Stay essential.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
