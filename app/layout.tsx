import type { Metadata } from 'next'
import './globals.css'
import { getSettings, buildCssVars } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Global Online Regeneration Summit',
  description: 'A global summit on regeneration, sustainability, and systems change.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  const cssVars = buildCssVars(settings)

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root { ${cssVars} }` }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
