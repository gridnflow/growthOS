import { packager } from '@electron/packager'
import { fileURLToPath } from 'url'
import path from 'path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

// macOS only registers an app under Screen Recording / Accessibility once it
// has a stable code signature and the matching usage-description Info.plist
// keys. The dev electron binary is linker-signed ad-hoc with no such keys, so
// TCC never keeps the grant. Packaging a real .app with a fixed ad-hoc
// signature + these keys makes the permission stick.
const appPaths = await packager({
  dir: root,
  out: path.join(root, 'packaged'),
  overwrite: true,
  platform: 'darwin',
  arch: 'arm64',
  name: 'GrowthOS',
  appBundleId: 'com.growthos.agent',
  // Re-sign ad-hoc so the bundle (with our injected plist) gets one stable
  // CDHash instead of the per-file linker signatures from the dev binary.
  osxSign: { identity: '-' },
  extendInfo: {
    NSScreenCaptureUsageDescription:
      'GrowthOS records your screen to build focus-session timelapses.',
    NSAppleEventsUsageDescription:
      'GrowthOS reads the active window to track which apps you use during a focus session.',
    // Background tracking agent: no dock icon.
    LSUIElement: true,
  },
})

console.log('Packaged:', appPaths.join(', '))
