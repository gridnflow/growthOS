export type CreateGoalInput = {
  userId: string
  title: string
  deadline: Date
  dailyHours: number
  currentLevel?: string
}

export type GoalWithPlans = {
  id: string
  title: string
  deadline: Date
  dailyHours: number
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  createdAt: Date
}
