'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
          <h1 className="text-2xl font-bold text-gray-900">문제가 발생했습니다</h1>
          <p className="mt-2 text-gray-500">잠시 후 다시 시도해 주세요.</p>
        </main>
      </body>
    </html>
  )
}
