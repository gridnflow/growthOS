import type { BadgeTone } from './Badge'

// Single source for status→tone mapping (DESIGN.md §1). Statuses across Task,
// Goal, PostStatus, and ReelStatus are disjoint, so one lookup table covers all.
const STATUS_TONE: Record<string, BadgeTone> = {
  // TaskStatus
  TODO: 'neutral',
  IN_PROGRESS: 'progress',
  DONE: 'positive',
  SKIPPED: 'warn',
  // GoalStatus
  ACTIVE: 'positive',
  PAUSED: 'neutral',
  COMPLETED: 'neutral',
  // PostStatus
  DRAFT: 'neutral',
  PUBLISHED: 'positive',
  // ReelStatus
  PENDING: 'neutral',
  PROCESSING: 'progress',
  READY: 'positive',
  EXPORTED: 'positive',
}

export function statusTone(status: string): BadgeTone {
  return STATUS_TONE[status] ?? 'neutral'
}
