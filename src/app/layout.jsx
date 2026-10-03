import './globals.css'
import { Playfair_Display, Poppins, Dancing_Script } from 'next/font/google'
import ReduxProvider from '../redux/ReduxProvider'
import { Toaster } from 'react-hot-toast'
import Header from '../components/user/Header'
import Footer from '../components/user/Footer'
import Preloader from '../components/user/Preloader'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const dancing = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-dancing',
  display: 'swap',
})

export const metadata = {
  title: 'Kurti Cove — Ethnic Wear for Every Woman',
  description:
    'Discover handpicked kurtis that blend Indian tradition with modern elegance. Shop new arrivals, bestsellers and festive collections at Kurti Cove.',
  keywords: 'kurti, kurta, indian ethnic wear, women fashion, anarkali, cotton kurti',
}

/* Resource hints injected into <head> by Next.js metadata */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

/* Extra link tags for preconnect / dns-prefetch */
export const links = [
  { rel: 'preconnect',    href: 'https://res.cloudinary.com' },
  { rel: 'dns-prefetch',  href: 'https://res.cloudinary.com' },
]

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable} ${dancing.variable}`}>
      <head>
        {/* Preconnect to Cloudinary CDN — eliminates DNS + TLS handshake latency for product images */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Preconnect to Google Fonts (already loaded by next/font but belt-and-suspenders) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans bg-[#FCFAE0] text-[#7B2447] antialiased">
        <ReduxProvider>
          {/* Preloader — full-screen overlay on first session visit */}
          <Preloader />
          {/* Header renders on every page — fixed, floats above content */}
          <Header />
          {/*
            No pt-20 here — Header component itself renders a spacer div
            (h-16 md:h-20) that pushes content below the fixed header.
            HeroBanner uses -mt-16 md:-mt-20 to cancel that spacer for the
            hero slider only.
          */}
          <main className="min-h-screen">
            {children}
          </main>
          {/* Footer renders on every page */}
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a1a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                fontWeight: '400',
                letterSpacing: '0.02em',
                padding: '12px 16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
                marginBottom: '16px',
                marginRight: '8px',
                maxWidth: '340px',
              },
              success: {
                style: {
                  background: '#1a1a1a',
                  color: '#ffffff',
                },
                iconTheme: { primary: '#E05C88', secondary: '#1a1a1a' },
              },
              error: {
                style: {
                  background: '#1a1a1a',
                  color: '#ffffff',
                },
                iconTheme: { primary: '#ef4444', secondary: '#1a1a1a' },
              },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  )
}