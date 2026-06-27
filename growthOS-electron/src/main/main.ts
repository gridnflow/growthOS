import { app, BrowserWindow, Tray, nativeImage, Menu, systemPreferences, shell } from 'electron'
import path from 'path'
import { registerIpcHandlers } from './ipcHandlers'

let tray: Tray | null = null
let trayWindow: BrowserWindow | null = null

function createTrayWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 320,
    height: 480,
    show: false,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  })

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../renderer/tray/index.html'))
  }

  return win
}

function createTray(win: BrowserWindow): Tray {
  const icon = nativeImage.createEmpty()
  const t = new Tray(icon)

  t.on('click', () => {
    if (win.isVisible()) {
      win.hide()
    } else {
      const { x, y } = t.getBounds()
      win.setPosition(x - 160 + 16, y - 480)
      win.show()
    }
  })

  t.setContextMenu(
    Menu.buildFromTemplate([{ label: 'Quit GrowthOS', click: () => app.quit() }])
  )

  return t
}

// The tracker needs two macOS permissions: Screen Recording (desktopCapturer)
// and Accessibility (active-win). Neither can be toggled programmatically — we
// trigger the system prompt where possible and deep-link to Settings otherwise.
function ensureMacPermissions(): void {
  if (process.platform !== 'darwin') return

  // Screen Recording: getMediaAccessStatus shows current state; first
  // desktopCapturer use surfaces the system prompt. Open Settings if denied.
  const screenStatus = systemPreferences.getMediaAccessStatus('screen')
  if (screenStatus !== 'granted') {
    shell.openExternal(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture'
    )
  }

  // Accessibility: prompt = true makes macOS show the "open Settings" dialog.
  const hasAccessibility = systemPreferences.isTrustedAccessibilityClient(true)
  if (!hasAccessibility) {
    shell.openExternal(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility'
    )
  }
}

app.whenReady().then(() => {
  // macOS: hide from dock — this is a background tracking agent
  if (process.platform === 'darwin') app.dock.hide()

  ensureMacPermissions()

  trayWindow = createTrayWindow()
  tray = createTray(trayWindow)

  registerIpcHandlers()
})

app.on('window-all-closed', (e: Event) => {
  // Prevent quit on window close — app lives in tray
  e.preventDefault()
})
