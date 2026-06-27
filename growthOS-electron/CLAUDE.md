# growthOS-electron — Claude 지시서

> 글로벌 규칙은 `../CLAUDE.md` 참조. 이 파일은 Electron 레포 전용 규칙.

---

## 이 레포의 역할

**Tracking Agent 전용.** UI는 트레이 팝업 수준만. 모든 비즈니스 로직과 AI는 `growthOS-web`에 있다.

이 레포가 하는 일:
1. 화면 녹화 (5초 chunk mp4)
2. 활성 앱/윈도우 추적
3. 세션 시작/종료 관리
4. FFmpeg로 타임랩스 + 오버레이 생성
5. Next.js 백엔드로 세션 데이터 HTTP 전송

이 레포가 하지 않는 일:
- AI 호출 (전부 growthOS-web에서)
- DB 직접 접근
- 복잡한 UI 렌더링

---

## 기술 스택

- Electron + `electron-vite`
- TypeScript (strict)
- `desktopCapturer` API (화면 캡처)
- `active-win` (활성 윈도우 감지)
- `ffmpeg-static` (FFmpeg 번들)
- Clerk 토큰 (로컬 저장 후 API 요청에 포함)

---

## 프로젝트 구조

```
growthOS-electron/
├── src/
│   ├── main/
│   │   ├── main.ts                 ← 앱 진입점, BrowserWindow 생성
│   │   ├── sessionManager.ts       ← 세션 오케스트레이션
│   │   ├── screenRecorder.ts       ← desktopCapturer chunk 녹화
│   │   ├── activityTracker.ts      ← 활성 앱 10초 폴링
│   │   ├── ffmpegController.ts     ← 타임랩스 + 오버레이 생성
│   │   ├── apiClient.ts            ← growthOS-web HTTP 클라이언트
│   │   └── ipcHandlers.ts          ← IPC 핸들러 등록
│   ├── preload/
│   │   └── index.ts                ← contextBridge (보안 브릿지)
│   └── renderer/
│       └── tray/                   ← 트레이 팝업 UI (세션 시작/종료)
├── resources/
│   └── ffmpeg/                     ← ffmpeg-static 바이너리
└── electron.vite.config.ts
```

---

## 핵심 모듈 책임

### sessionManager.ts
```
startSession(goalId)
  → screenRecorder.start()
  → activityTracker.start()
  → apiClient.post('/api/sessions/start')

stopSession()
  → screenRecorder.stop()
  → activityTracker.stop()
  → ffmpegController.process()   // 타임랩스 생성
  → apiClient.post('/api/sessions/end', { logs, videoPath, duration })
```

### screenRecorder.ts
- `desktopCapturer.getSources({ types: ['screen'] })`로 소스 선택
- MediaRecorder로 5초 단위 chunk 저장
- 저장 경로: `~/Library/Application Support/growthOS/sessions/YYYY-MM-DD/chunks/`
- chunk 파일명: `chunk_{timestamp}.webm` → FFmpeg에서 mp4 변환

### activityTracker.ts
- `active-win` 10초 폴링
- 버퍼: `[{ app, title, url?, startedAt, duration }]`
- `stopSession()` 호출 시 JSON으로 직렬화하여 반환

### ffmpegController.ts
- 입력: chunk 파일 목록 + 세션 통계
- 처리 순서:
  1. chunks → concat → raw.mp4
  2. raw.mp4 → timelapse (속도 8x)
  3. timelapse + 통계 오버레이 (집중 시간, 스트릭, 완료 태스크) → final.mp4
- 출력: `~/Library/Application Support/growthOS/sessions/YYYY-MM-DD/final.mp4`

### apiClient.ts
- Base URL: `http://localhost:3000` (dev) / 환경변수로 prod URL
- 모든 요청에 Clerk 토큰 포함 (`Authorization: Bearer {token}`)
- 재시도 없음 (POC). 실패 시 로컬 큐에 저장 → 연결 복구 시 재전송 (향후)

---

## IPC 채널 목록

| 채널 | 방향 | 설명 |
|------|------|------|
| `session:start` | Renderer → Main | 세션 시작 (goalId 전달) |
| `session:stop` | Renderer → Main | 세션 종료 |
| `session:status` | Main → Renderer | 현재 세션 상태 브로드캐스트 |
| `activity:log` | Main → Renderer | 실시간 활동 현황 |

---

## Electron 보안 설정 (변경 금지)

```typescript
new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,       // 반드시 false
    contextIsolation: true,       // 반드시 true
    preload: path.join(__dirname, 'preload/index.js')
  }
})
```

---

## 로컬 파일 저장 경로

```
~/Library/Application Support/growthOS/
  sessions/
    YYYY-MM-DD/
      chunks/
        chunk_001.webm
        chunk_002.webm
      final.mp4
```

세션 30일 이상 자동 삭제 (향후 구현).

---

## 작업 시 주의

- `desktopCapturer`는 macOS에서 Screen Recording 권한 필요 → 앱 시작 시 `systemPreferences.askForMediaAccess('screen')` 호출
- FFmpeg 처리는 세션 종료 후 백그라운드에서 실행 (UI 블로킹 금지)
- Electron main process에서 직접 무거운 연산 금지 → `worker_threads` 또는 child_process 사용

## 알려진 제약 — 화면 녹화 권한 (보류)

화면 녹화 코드(renderer MediaRecorder → IPC → chunk 저장)는 구현돼 있으나,
**개발 환경에서는 화면 녹화가 동작하지 않는다.** macOS는 Screen Recording 권한을
앱의 코드 서명(CDHash)에 묶는데, 개발용/패키징(`npm run package`) 빌드는 **ad-hoc
서명**이라 권한이 영구 저장되지 않는다 — 토글을 켜도 앱을 재시작하면 `denied`로
돌아가고, 앱 종료 시 권한 목록에서 항목이 사라진다. (Accessibility 권한은 더 관대해서
ad-hoc로도 부여되며, active-win 활동 추적은 정상 동작한다.)

→ **해결: 정식 Apple Developer ID 인증서로 코드 서명한 빌드에서만 화면 녹화가 동작한다.**
그때까지 세션은 녹화 없이 동작한다 — `recorder:get-source-id`는 권한이 없으면 `null`을
반환하고, tray는 "Session active (no recording)"으로 표시하며 활동 추적·AI 파이프라인은
정상 진행된다. 즉 화면 녹화는 best-effort 부가 기능으로 격리돼 있다.
