declare global {
  interface Window {
    api: {
      startSession: (goalId: string) => Promise<{ sessionId: string }>
      stopSession: () => Promise<void>
      getSessionStatus: () => Promise<{ isRecording: boolean; sessionId: string | null; startedAt: string | null }>
      getTodayTasks: () => Promise<Array<{ id: string; title: string; status: string }>>
    }
  }
}

const statusEl = document.getElementById('status')!
const timerEl = document.getElementById('timer')!
const startBtn = document.getElementById('startBtn') as HTMLButtonElement
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement
const taskListEl = document.getElementById('taskList')!

let timerInterval: number | null = null
let sessionStart: Date | null = null

// Hardcoded goalId for POC — will be replaced with goal selector
const POC_GOAL_ID = 'poc-goal-id'

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function startTimer(): void {
  sessionStart = new Date()
  timerInterval = window.setInterval(() => {
    if (!sessionStart) return
    timerEl.textContent = formatDuration(Date.now() - sessionStart.getTime())
  }, 1000)
}

function stopTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  sessionStart = null
  timerEl.textContent = '00:00'
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true
  statusEl.textContent = 'Starting...'

  try {
    await window.api.startSession(POC_GOAL_ID)
    startBtn.style.display = 'none'
    stopBtn.style.display = 'block'
    statusEl.textContent = 'Session active'
    startTimer()
  } catch {
    statusEl.textContent = 'Failed to start'
    startBtn.disabled = false
  }
})

stopBtn.addEventListener('click', async () => {
  stopBtn.disabled = true
  statusEl.textContent = 'Processing...'

  try {
    await window.api.stopSession()
    stopBtn.style.display = 'none'
    startBtn.style.display = 'block'
    startBtn.disabled = false
    statusEl.textContent = 'Session saved. AI analyzing...'
    stopTimer()
  } catch {
    statusEl.textContent = 'Error saving session'
    stopBtn.disabled = false
  }
})

async function loadTasks(): Promise<void> {
  try {
    const tasks = await window.api.getTodayTasks()
    taskListEl.innerHTML = tasks.length
      ? tasks.map((t) => `<div class="task">${t.title}</div>`).join('')
      : '<div class="task" style="color:#555">No tasks yet</div>'
  } catch {
    taskListEl.innerHTML = '<div class="task" style="color:#555">Could not load tasks</div>'
  }
}

loadTasks()
