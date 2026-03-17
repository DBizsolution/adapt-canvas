import type { Metadata } from 'next'
import '@fontsource-variable/dm-sans'
import './globals.css'

export const metadata: Metadata = {
  title: 'VBS Intent Model Review',
  description: 'VBS Intent Model Consensus System — a review tool for business requirements',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased" style={{ fontFamily: "'DM Sans Variable', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
