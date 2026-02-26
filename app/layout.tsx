import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Global Online Regeneration Summit',
  description: 'A global summit on regeneration, sustainability, and systems change.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
