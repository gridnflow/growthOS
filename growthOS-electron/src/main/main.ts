import { app, BrowserWindow, Tray, nativeImage, Menu, systemPreferences, shell, desktopCapturer } from 'electron'
import path from 'path'
import { registerIpcHandlers } from './ipcHandlers'

let tray: Tray | null = null
let trayWindow: BrowserWindow | null = null

function createTrayWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 360,
    height: 520,
    // Show on launch with a normal frame: the empty-icon menu-bar tray is
    // unreliable on recent macOS, so we surface the window directly. The tray
    // still toggles it once it exists.
    show: true,
    frame: true,
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
  // Empty icon is invisible in the menu bar — show a text title so the tray is
  // findable and clickable.
  t.setTitle('● GrowthOS')

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
    Menu.buildFromTemplate([
      { label: 'Open Screen Recording Settings', click: openScreenRecordingSettings },
      { type: 'separator' },
      { label: 'Quit GrowthOS', click: () => app.quit() },
    ])
  )

  return t
}

// The tracker needs two macOS permissions: Screen Recording (desktopCapturer)
// and Accessibility (active-win). macOS only lists an app under a permission
// once it actually exercises the protected API, so we touch both on launch to
// register the app — but we do NOT auto-open Settings (that popped a window on
// every launch while screen stayed denied). Use the tray menu to open Settings.
async function ensureMacPermissions(): Promise<void> {
  if (process.platform !== 'darwin') return

  // Screen Recording: a real frame grab (non-zero thumbnail) registers the app
  // under the permission. No-op once granted.
  if (systemPreferences.getMediaAccessStatus('screen') !== 'granted') {
    try {
      await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1, height: 1 },
      })
    } catch {
      // expected to fail/return empty until granted
    }
  }

  // Accessibility: prompt only if not already trusted, so we don't nag once on.
  if (!systemPreferences.isTrustedAccessibilityClient(false)) {
    systemPreferences.isTrustedAccessibilityClient(true)
  }
}

function openScreenRecordingSettings(): void {
  shell.openExternal(
    'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture'
  )
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    console.log('[perm] screen =', systemPreferences.getMediaAccessStatus('screen'))
    console.log('[perm] accessibility =', systemPreferences.isTrustedAccessibilityClient(false))
  }

  void ensureMacPermissions()

  trayWindow = createTrayWindow()
  tray = createTray(trayWindow)

  // Bring the window to the front on launch so it is reachable without the
  // menu-bar tray (which is unreliable with an empty icon on recent macOS).
  if (process.platform === 'darwin') app.dock.show()
  trayWindow.show()
  trayWindow.focus()
  app.focus({ steal: true })

  registerIpcHandlers()
})

app.on('window-all-closed', (e: Event) => {
  // Prevent quit on window close — app lives in tray
  e.preventDefault()
})
