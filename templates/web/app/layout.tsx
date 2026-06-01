import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '{{projectName}}',
  description: 'Built with webview-vibe-stack',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="max-w-md mx-auto min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
