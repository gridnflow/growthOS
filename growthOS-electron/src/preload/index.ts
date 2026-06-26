import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  startSession: (goalId: string) => ipcRenderer.invoke('session:start', goalId),
  stopSession: () => ipcRenderer.invoke('session:stop'),
  getSessionStatus: () => ipcRenderer.invoke('session:status'),
  getTodayTasks: () => ipcRenderer.invoke('tasks:today'),
  onActivityUpdate: (callback: (log: unknown) => void) => {
    ipcRenderer.on('activity:log', (_event, data) => callback(data))
  },
})
