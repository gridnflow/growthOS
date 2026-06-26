import { getAuth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'

// Electron has no Clerk session cookie, so it sends `Authorization: Bearer <token>`.
// getAuth() reads both the cookie and the Bearer header, unifying web + Electron callers.
export function getUserId(req: NextRequest): string | null {
  return getAuth(req).userId
}
