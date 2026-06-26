import { auth, getAuth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// Electron has no Clerk session cookie, so it sends `Authorization: Bearer <token>`.
// getAuth() reads both the cookie and the Bearer header, unifying web + Electron callers.
export function getUserId(req: NextRequest): string | null {
  return getAuth(req).userId
}

// Services key off the internal cuid, not the Clerk id, so dashboard pages resolve
// the signed-in Clerk user to the local User row before calling any service.
export async function getInternalUserId(): Promise<string | null> {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  })
  return user?.id ?? null
}
