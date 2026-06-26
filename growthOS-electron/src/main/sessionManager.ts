import { app } from 'electron'
import path from 'path'
import { screenRecorder } from './screenRecorder'
import { activityTracker } from './activityTracker'
import { processSession } from './ffmpegController'
import { apiClient } from './apiClient'

type SessionStatus = {
  isRecording: boolean
  sessionId: string | null
  startedAt: Date | null
}

class SessionManager {
  private currentSessionId: string | null = null
  private startedAt: Date | null = null

  async startSession(goalId: string): Promise<{ sessionId: string }> {
    const { sessionId } = await apiClient.startSession(goalId)
    this.currentSessionId = sessionId
    this.startedAt = new Date()

    screenRecorder.startNewSession()
    activityTracker.start()

    return { sessionId }
  }

  async stopSession(): Promise<void> {
    if (!this.currentSessionId || !this.startedAt) return

    const chunkPaths = screenRecorder.stopSession()
    const activityLog = activityTracker.stop()

    const durationSec = Math.round((Date.now() - this.startedAt.getTime()) / 1000)

    const today = new Date().toISOString().split('T')[0]
    const outputDir = path.join(app.getPath('userData'), 'sessions', today)

    let videoLocalPath: string | undefined
    try {
      videoLocalPath = await processSession({
        chunkPaths,
        outputDir,
        stats: {
          durationSec,
          streak: 1,
          tasksCompleted: [],
        },
      })
    } catch {
      // FFmpeg failure doesn't abort session save
    }

    await apiClient.endSession({
      sessionId: this.currentSessionId,
      durationSec,
      activityLog,
      videoLocalPath,
    })

    this.currentSessionId = null
    this.startedAt = null
  }

  getStatus(): SessionStatus {
    return {
      isRecording: this.currentSessionId !== null,
      sessionId: this.currentSessionId,
      startedAt: this.startedAt,
    }
  }
}

export const sessionManager = new SessionManager()
