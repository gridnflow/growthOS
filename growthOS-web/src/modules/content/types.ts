export type PostItem = {
  id: string
  hook: string
  body: string
  hashtags: string[]
  status: string
  sessionGoalTitle: string
  createdAt: Date
}

export type ReelItem = {
  id: string
  hookText: string
  narrationScript: string
  musicMood: string
  estimatedDurationSec: number
  overlayCount: number
  status: string
  sessionGoalTitle: string
  createdAt: Date
}

export type ContentItems = {
  posts: PostItem[]
  reels: ReelItem[]
}
