export type SessionTaskBreakdown = {
  tasksCompleted: string[]
  tasksSkipped: string[]
}

export type SessionAggregates = SessionTaskBreakdown & {
  streakCount: number
  progressPercentage: number
}

export type SessionAggregatesInput = {
  userId: string
  goalId: string
  // Anchors the day window and the streak's most recent day.
  sessionDate: Date
}

export type DashboardSummary = {
  currentStreak: number
  todayFocusedMin: number
  weekFocusedMin: number
  activeGoalsCount: number
  overallProgressPct: number
}
