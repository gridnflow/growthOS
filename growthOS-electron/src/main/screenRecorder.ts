import { app } from 'electron'
import path from 'path'
import fs from 'fs'

// desktopCapturer must be called from renderer process (Electron security model).
// Renderer calls desktopCapturer.getSources(), sends sourceId via IPC,
// then MediaRecorder chunks are sent to main via IPC for file writing.

export type ChunkWriteRequest = {
  buffer: ArrayBuffer
  timestamp: number
}

class ScreenRecorder {
  private chunks: string[] = []
  private sessionDir: string | null = null

  getSessionDir(): string {
    const today = new Date().toISOString().split('T')[0]
    const dir = path.join(app.getPath('userData'), 'sessions', today, 'chunks')
    fs.mkdirSync(dir, { recursive: true })
    return dir
  }

  startNewSession(): string {
    this.chunks = []
    this.sessionDir = this.getSessionDir()
    return this.sessionDir
  }

  writeChunk(request: ChunkWriteRequest): string {
    if (!this.sessionDir) throw new Error('Session not started')

    const filename = `chunk_${request.timestamp}.webm`
    const filepath = path.join(this.sessionDir, filename)
    fs.writeFileSync(filepath, Buffer.from(request.buffer))
    this.chunks.push(filepath)
    return filepath
  }

  stopSession(): string[] {
    const result = [...this.chunks]
    this.chunks = []
    this.sessionDir = null
    return result
  }
}

export const screenRecorder = new ScreenRecorder()
