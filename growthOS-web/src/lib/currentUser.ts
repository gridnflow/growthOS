import { prisma } from '@/lib/prisma'

// The app is single-user (auth removed). Every request resolves to one fixed User:
// the DEFAULT_USER_EMAIL row, falling back to the first User in the database.
const DEFAULT_USER_EMAIL = process.env.DEFAULT_USER_EMAIL ?? 'seed@growthos.dev'

export async function getCurrentUserId(): Promise<string | null> {
  const byEmail = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
    select: { id: true },
  })
  if (byEmail) return byEmail.id

  const first = await prisma.user.findFirst({ select: { id: true } })
  return first?.id ?? null
}
