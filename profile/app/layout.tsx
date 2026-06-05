import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://akashdborkar.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Akash Borkar | Lead Technical Consultant',
    template: '%s | Akash Borkar',
  },
  description: 'Akash Borkar — Lead Technical Consultant with 9+ years of experience in scalable web architecture, cloud delivery, and engineering leadership.',
  keywords: [
    'Akash Borkar',
    'Lead Technical Consultant',
    'Technical Consultant',
    'Software Architect',
    'Cloud Delivery',
    'Engineering Leadership',
    'Akash Borkar profile',
  ],
  authors: [{ name: 'Akash Borkar', url: SITE_URL }],
  creator: 'Akash Borkar',
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Akash Borkar',
    title: 'Akash Borkar | Lead Technical Consultant',
    description: 'Akash Borkar — Lead Technical Consultant with 9+ years of experience in scalable web architecture, cloud delivery, and engineering leadership.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Akash Borkar | Lead Technical Consultant',
    description: 'Akash Borkar — Lead Technical Consultant with 9+ years of experience in scalable web architecture, cloud delivery, and engineering leadership.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-config" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                storage: 'none',
                anonymize_ip: true
              });
            `}</Script>
          </>
        )}
      </body>
    </html>
  )
}
