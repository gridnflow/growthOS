import { ipcMain } from 'electron'
import { sessionManager } from './sessionManager'
import { apiClient } from './apiClient'

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
}
