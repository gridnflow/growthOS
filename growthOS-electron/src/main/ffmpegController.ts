import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
// @ts-expect-error — ffmpeg-static types are loose
import ffmpegPath from 'ffmpeg-static'

const execFileAsync = promisify(execFile)

export type ProcessSessionParams = {
  chunkPaths: string[]
  outputDir: string
  stats: {
    durationSec: number
    streak: number
    tasksCompleted: string[]
    focusScore?: number
  }
}

export async function processSession(params: ProcessSessionParams): Promise<string> {
  const { chunkPaths, outputDir, stats } = params

  if (chunkPaths.length === 0) return ''

  const listFile = path.join(outputDir, 'concat_list.txt')
  const rawOutput = path.join(outputDir, 'raw.mp4')
  const timelapseOutput = path.join(outputDir, 'timelapse.mp4')
  const finalOutput = path.join(outputDir, 'final.mp4')

  // Step 1: Write concat list
  const listContent = chunkPaths.map((p) => `file '${p}'`).join('\n')
  fs.writeFileSync(listFile, listContent)

  // Step 2: Concat chunks into raw mp4. The chunks are webm/VP8 (MediaRecorder),
  // which cannot be stream-copied into an mp4 container — re-encode to H.264.
  await execFileAsync(ffmpegPath, [
    '-f', 'concat', '-safe', '0', '-i', listFile,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-an', '-y', rawOutput,
  ])

  // Step 3: Create 8x timelapse
  await execFileAsync(ffmpegPath, [
    '-i', rawOutput,
    '-filter:v', 'setpts=0.125*PTS',
    '-an', '-y', timelapseOutput,
  ])

  // Step 4: Add stats overlay
  const durationMin = Math.round(stats.durationSec / 60)
  const tasksText = stats.tasksCompleted.slice(0, 2).join(' • ') || 'Deep work session'
  const overlayFilter = [
    `drawtext=text='Day ${stats.streak}':fontsize=52:fontcolor=white:x=30:y=30:box=1:boxcolor=black@0.5:boxborderw=8`,
    `drawtext=text='${durationMin}m focused':fontsize=36:fontcolor=white:x=30:y=100:box=1:boxcolor=black@0.5:boxborderw=6`,
    `drawtext=text='${tasksText}':fontsize=24:fontcolor=white:x=30:y=160:box=1:boxcolor=black@0.4:boxborderw=5`,
  ].join(',')

  // No audio track in the screen capture, so don't try to copy one (-an).
  await execFileAsync(ffmpegPath, [
    '-i', timelapseOutput,
    '-vf', overlayFilter,
    '-an', '-y', finalOutput,
  ])

  // Cleanup intermediate files
  fs.unlinkSync(listFile)
  fs.unlinkSync(rawOutput)
  fs.unlinkSync(timelapseOutput)

  return finalOutput
}
