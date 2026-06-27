import type { Metadata } from 'next'
import './globals.css'
import { PostHogProvider } from '@/components/PostHogProvider'

export const metadata: Metadata = {
  title: 'GrowthOS',
  description: 'AI-powered personal growth operating system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
