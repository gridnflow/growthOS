import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { clerkId: 'seed_user_clerk_id' },
    update: {},
    create: {
      clerkId: 'seed_user_clerk_id',
      email: 'seed@growthos.dev',
    },
  })

  await prisma.goal.upsert({
    where: { id: 'seed_goal_id' },
    update: {},
    create: {
      id: 'seed_goal_id',
      userId: user.id,
      title: 'AI Product Manager 되기',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
      dailyHours: 2,
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
