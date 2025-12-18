import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { esES } from "@clerk/localizations"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Vrevia - Aprende inglés de forma personalizada",
    template: "%s | Vrevia",
  },
  description:
    "Clases de inglés individuales y grupales adaptadas a tu ritmo y objetivos. Aprende con metodología personalizada y horarios flexibles.",
  keywords: [
    "clases de inglés",
    "inglés personalizado",
    "aprender inglés",
    "profesor de inglés",
    "clases en línea",
  ],
  authors: [{ name: "Vrevia" }],
  openGraph: {
    title: "Vrevia - Aprende inglés de forma personalizada",
    description:
      "Clases de inglés individuales y grupales adaptadas a tu ritmo y objetivos.",
    url: "https://vrevia.com",
    siteName: "Vrevia",
    locale: "es_MX",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
          suppressHydrationWarning
        >
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
