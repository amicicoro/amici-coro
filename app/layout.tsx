import type React from "react"
import "./globals.css"
import { Playfair_Display } from "next/font/google"
import { CookieConsent } from "@/components/CookieConsent"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={playfair.variable}>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
