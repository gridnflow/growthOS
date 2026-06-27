declare global {
  interface Window {
    api: {
      startSession: (goalId: string) => Promise<{ sessionId: string }>
      stopSession: () => Promise<void>
      getSessionStatus: () => Promise<{ isRecording: boolean; sessionId: string | null; startedAt: string | null }>
      getTodayTasks: () => Promise<Array<{ id: string; title: string; status: string }>>
      getScreenSourceId: () => Promise<string | null>
      writeChunk: (buffer: ArrayBuffer, timestamp: number) => Promise<string>
    }
  }
}

// MediaRecorder lives in the renderer; desktopCapturer (main) hands us the
// screen source id, we capture it, and stream 5s chunks back to main for
// crash-safe disk writes.
let mediaRecorder: MediaRecorder | null = null
let captureStream: MediaStream | null = null

async function startRecording(): Promise<void> {
  const sourceId = await window.api.getScreenSourceId()
  if (!sourceId) throw new Error('No screen source available')

  // chromeMediaSource constraints are the Electron-specific way to target a
  // desktopCapturer source through getUserMedia.
  captureStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      // @ts-expect-error — Electron desktopCapturer constraints are non-standard
      mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: sourceId },
    },
  })

  mediaRecorder = new MediaRecorder(captureStream, { mimeType: 'video/webm;codecs=vp8' })
  mediaRecorder.ondataavailable = async (e) => {
    if (e.data.size === 0) return
    const buffer = await e.data.arrayBuffer()
    await window.api.writeChunk(buffer, Date.now())
  }
  mediaRecorder.start(5000) // emit a chunk every 5s
}

function stopRecording(): void {
  mediaRecorder?.stop()
  captureStream?.getTracks().forEach((t) => t.stop())
  mediaRecorder = null
  captureStream = null
}

const statusEl = document.getElementById('status')!
const timerEl = document.getElementById('timer')!
const startBtn = document.getElementById('startBtn') as HTMLButtonElement
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement
const taskListEl = document.getElementById('taskList')!

let timerInterval: number | null = null
let sessionStart: Date | null = null

// Hardcoded goalId for POC — will be replaced with goal selector
const POC_GOAL_ID = 'seed_goal_id'

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
    await startRecording()
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
    stopRecording()
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
