import { ipcMain, desktopCapturer } from 'electron'
import { sessionManager } from './sessionManager'
import { apiClient } from './apiClient'
import { screenRecorder } from './screenRecorder'

export function registerIpcHandlers(): void {
  ipcMain.handle('session:start', async (_event, goalId: string) => {
    return sessionManager.startSession(goalId)
  })

  ipcMain.handle('session:stop', async () => {
    return sessionManager.stopSession()
  })

  ipcMain.handle('session:status', async () => {
    return sessionManager.getStatus()
  })

  ipcMain.handle('tasks:today', async () => {
    return apiClient.getTodayTasks()
  })

  // desktopCapturer is a main-process API; expose the screen source id to the
  // renderer so it can feed getUserMedia and record with MediaRecorder.
  ipcMain.handle('recorder:get-source-id', async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen'] })
    return sources[0]?.id ?? null
  })

  // Renderer streams 5s MediaRecorder chunks back here for crash-safe writes.
  ipcMain.handle('recorder:write-chunk', async (_event, buffer: ArrayBuffer, timestamp: number) => {
    return screenRecorder.writeChunk({ buffer, timestamp })
  })
}
