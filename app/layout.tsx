import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Connections — Word Grouping Game',
  description: 'Group 16 words into 4 hidden categories. Powered by AI.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
