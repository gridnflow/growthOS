import { app, BrowserWindow, Tray, nativeImage, Menu, systemPreferences, shell, desktopCapturer } from 'electron'
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
    Menu.buildFromTemplate([{ label: 'Quit GrowthOS', click: () => app.quit() }])
  )

  return t
}

// The tracker needs two macOS permissions: Screen Recording (desktopCapturer)
// and Accessibility (active-win). Neither can be toggled programmatically, and
// macOS only lists an app under a permission once the app actually exercises
// the protected API — so we trigger both on launch, then deep-link to Settings.
async function ensureMacPermissions(): Promise<void> {
  if (process.platform !== 'darwin') return

  // Screen Recording: actually call desktopCapturer so macOS registers the app
  // and shows its prompt. getMediaAccessStatus only reports state; it does not
  // register the app on its own.
  if (systemPreferences.getMediaAccessStatus('screen') !== 'granted') {
    try {
      await desktopCapturer.getSources({ types: ['screen'] })
    } catch {
      // expected to fail/return empty until granted
    }
    shell.openExternal(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture'
    )
  }

  // Accessibility: prompt = true makes macOS register the app and show the
  // "open Settings" dialog.
  if (!systemPreferences.isTrustedAccessibilityClient(true)) {
    shell.openExternal(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility'
    )
  }
}

app.whenReady().then(() => {
  // macOS: hide from dock — this is a background tracking agent
  if (process.platform === 'darwin') app.dock.hide()

  void ensureMacPermissions()

  trayWindow = createTrayWindow()
  tray = createTray(trayWindow)

  registerIpcHandlers()
})

app.on('window-all-closed', (e: Event) => {
  // Prevent quit on window close — app lives in tray
  e.preventDefault()
})
