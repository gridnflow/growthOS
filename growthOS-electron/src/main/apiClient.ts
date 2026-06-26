import type { ActivityEntry } from './activityTracker'

const BASE_URL = process.env.WEB_APP_URL ?? 'http://localhost:3000'

type Task = {
  id: string
  title: string
  estimatedMin: number
  status: string
}

type StartSessionResponse = { sessionId: string }

class ApiClient {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${await res.text()}`)
    }

    return res.json() as Promise<T>
  }

  async startSession(goalId: string): Promise<StartSessionResponse> {
    return this.request<StartSessionResponse>('/api/sessions/start', {
      method: 'POST',
      body: JSON.stringify({ goalId, startedAt: new Date().toISOString() }),
    })
  }

  async endSession(data: {
    sessionId: string
    durationSec: number
    activityLog: ActivityEntry[]
    videoLocalPath?: string
  }): Promise<void> {
    return this.request('/api/sessions/end', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getTodayTasks(): Promise<Task[]> {
    return this.request<Task[]>('/api/tasks/today')
  }

  async getSession(sessionId: string): Promise<unknown> {
    return this.request(`/api/sessions/${sessionId}`)
  }
}

export const apiClient = new ApiClient()
