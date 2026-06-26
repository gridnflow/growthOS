export type ActivityEntry = {
  app: string
  title: string
  url?: string
  startedAt: Date
  durationSec: number
}

class ActivityTracker {
  private log: ActivityEntry[] = []
  private pollInterval: NodeJS.Timeout | null = null
  private lastApp: string | null = null
  private lastStartedAt: Date | null = null

  start(): void {
    // active-win requires Accessibility permission on macOS
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const activeWin = require('active-win')

    this.pollInterval = setInterval(async () => {
      try {
        const result = await activeWin()
        if (!result) return

        const currentApp = result.owner.name

        if (this.lastApp && this.lastApp !== currentApp && this.lastStartedAt) {
          this.log.push({
            app: this.lastApp,
            title: result.title ?? '',
            startedAt: this.lastStartedAt,
            durationSec: Math.round((Date.now() - this.lastStartedAt.getTime()) / 1000),
          })
        }

        if (currentApp !== this.lastApp) {
          this.lastApp = currentApp
          this.lastStartedAt = new Date()
        }
      } catch {
        // active-win may fail if permissions not granted — fail silently
      }
    }, 10_000)
  }

  stop(): ActivityEntry[] {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }

    if (this.lastApp && this.lastStartedAt) {
      this.log.push({
        app: this.lastApp,
        title: '',
        startedAt: this.lastStartedAt,
        durationSec: Math.round((Date.now() - this.lastStartedAt.getTime()) / 1000),
      })
    }

    const result = [...this.log]
    this.log = []
    this.lastApp = null
    this.lastStartedAt = null
    return result
  }
}

export const activityTracker = new ActivityTracker()
