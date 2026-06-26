// ─── Goal Planner ────────────────────────────────────────────────────────────

export type GoalPlannerInput = {
  goal: string
  deadline: Date
  dailyHours: number
  currentLevel?: string
}

export type MonthlyMilestone = {
  month: number
  objective: string
  keyResults: string[]
  focusAreas: string[]
}

export type GoalPlannerOutput = {
  monthlyMilestones: MonthlyMilestone[]
}

// ─── Task Breakdown ───────────────────────────────────────────────────────────

export type TaskBreakdownInput = {
  monthlyMilestone: MonthlyMilestone
  weekNumber: number
  completedTasks: string[]
  dailyHours: number
}

export type DailyTask = {
  title: string
  estimatedMinutes: number
  resources: string[]
}

export type DayPlan = {
  date: string
  tasks: DailyTask[]
}

export type TaskBreakdownOutput = {
  weeklyTheme: string
  dayPlans: DayPlan[]
}

// ─── Reflection ───────────────────────────────────────────────────────────────

export type ActivityEntry = {
  app: string
  title: string
  url?: string
  durationSec: number
}

export type ReflectionInput = {
  durationSeconds: number
  tasksCompleted: string[]
  tasksSkipped: string[]
  appsUsed: ActivityEntry[]
  goalContext: string
}

export type ReflectionOutput = {
  accomplishments: string[]
  distractions: string[]
  focusScore: number
  keyInsight: string
  nextStep: string
  encouragement: string
}

// ─── Content Creator ─────────────────────────────────────────────────────────

export type ContentCreatorInput = {
  reflection: ReflectionOutput
  goalTitle: string
  streakCount: number
  totalHoursThisWeek: number
  progressPercentage: number
}

export type ContentCreatorOutput = {
  hook: string
  body: string
  cta: string
  hashtags: string[]
  fullPost: string
}

// ─── Reels Generator ─────────────────────────────────────────────────────────

export type OverlayItem = {
  timestampSec: number
  text: string
  style: 'title' | 'stat' | 'caption'
}

export type ReelsGeneratorInput = {
  sessionStats: {
    durationSeconds: number
    tasksCompleted: string[]
    topApps: string[]
    streakCount: number
  }
  reflection: Pick<ReflectionOutput, 'keyInsight' | 'focusScore'>
  goalTitle: string
}

export type ReelsGeneratorOutput = {
  narrationScript: string
  overlaySequence: OverlayItem[]
  hookText: string
  ctaText: string
  musicMood: 'focus' | 'hype' | 'chill'
  estimatedDurationSec: number
}
