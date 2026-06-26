# GrowthOS — 프로젝트 계획서

> "Study, build, grow. AI가 당신의 성장을 자동으로 기록하고 증명으로 바꾼다."

---

## 1. 제품 개요

### 핵심 가치
사용자가 목표를 입력하면 AI가 계획을 세우고, 매일 집중 세션을 자동 기록하며, 세션 종료 후 AI가 리플렉션 + LinkedIn 포스트 + 인스타그램 릴스를 자동 생성한다.

### 타깃 유저
- "Build in Public"을 하고 싶은 개발자/PM/크리에이터
- 장기 목표가 있지만 일관성 유지가 어려운 사람
- 성장 과정을 콘텐츠로 자동화하고 싶은 사람

---

## 2. 확정된 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 데스크탑 | Electron (electron-vite) | Tracking Agent 전용 |
| 웹/백엔드 | Next.js 15 (App Router) | UI + API Routes 통합 |
| DB | PostgreSQL (로컬 Docker → 이후 Neon) | Prisma ORM |
| Auth | Clerk | 웹 + Electron 공용 |
| AI | OpenAI GPT-4.1 | 에이전트 5개 전부 |
| 영상 처리 | FFmpeg (Electron 번들) | 로컬 실행 |
| 영상 생성 | Remotion | 릴스 렌더링 |
| 음성 → 텍스트 | Whisper | 나레이션 스크립트용 |
| 영상 저장 | 로컬 파일시스템 (POC) → S3/R2 (이후) | |
| 모니터링 | Sentry | |
| 분석 | PostHog | |
| CI/CD | GitHub Actions | |

---

## 3. 레포 구조

```
growthOS/                         ← 계획 문서 루트
├── PROJECT_PLAN.md               ← 이 파일
├── CLAUDE.md                     ← 글로벌 Claude 지시서
├── growthOS-electron/            ← Tracking Agent 레포
│   └── CLAUDE.md
└── growthOS-web/                 ← Next.js 웹앱 레포
    └── CLAUDE.md
```

---

## 4. 시스템 아키텍처

### 데이터 흐름

```
[Electron - Tracking Agent]
  세션 시작
    → screenRecorder: 5초 chunk mp4 저장 (로컬)
    → activityTracker: 10초마다 활성 앱/URL 기록
  세션 종료
    → ffmpegController: 타임랩스 + 통계 오버레이 생성
    → apiClient: POST /api/sessions (세션 데이터 전송)

[Next.js API - Backend]
  /api/sessions 수신
    → Session Module: DB 저장
    → AI Pipeline 트리거:
        1. Reflection Agent
        2. Content Creation Agent (Reflection 완료 후)
        3. Reels Generator Agent (Content 완료 후)

[Next.js App - Frontend]
  대시보드: 세션 현황, 연속 달성 스트릭
  목표 페이지: 목표 입력 → Goal Planner 트리거
  리플렉션 페이지: 세션별 AI 분석 결과
  콘텐츠 허브: LinkedIn 포스트 + 릴스 스크립트
```

### Electron ↔ Next.js 통신 계약

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/sessions/start` | POST | 세션 시작 (goal_id, started_at) |
| `/api/sessions/end` | POST | 세션 종료 (logs, duration, video_path) |
| `/api/tasks/today` | GET | 오늘 할 일 목록 |
| `/api/sessions/:id` | GET | 세션 결과 조회 (폴링용) |

---

## 5. AI 에이전트 상세 설계

### 에이전트 실행 흐름

```
목표 생성 시:
  Goal Planner → Task Breakdown

세션 종료 시:
  Reflection → Content Creation → Reels Generator
```

---

### Agent 1: Goal Planner

**역할:** 사용자의 목표를 월간 마일스톤으로 분해

**트리거:** 사용자가 새 목표 생성 시

**입력:**
```typescript
{
  goal: string,           // "AI Product Manager 되기"
  deadline: Date,         // 6개월 후
  daily_hours: number,    // 2
  current_level: string   // 사용자가 입력한 현재 수준 (선택)
}
```

**출력:**
```typescript
{
  monthly_milestones: [
    {
      month: number,
      objective: string,
      key_results: string[],
      focus_areas: string[]
    }
  ]
}
```

**프롬프트 원칙:**
- 강도보다 일관성 우선 (2시간/일 기준 현실적 목표)
- 월마다 명확한 성취 지표 포함
- 너무 추상적이지 않게, 실행 가능한 수준으로

---

### Agent 2: Task Breakdown

**역할:** 월간 마일스톤을 주간/일간 할 일로 세분화

**트리거:** Goal Planner 완료 후 + 매주 월요일 자동 갱신

**입력:**
```typescript
{
  monthly_milestone: MonthlyMilestone,
  week_number: number,
  completed_tasks: string[],  // 지난주 완료 항목
  daily_hours: number
}
```

**출력:**
```typescript
{
  weekly_theme: string,
  daily_tasks: [
    {
      date: Date,
      tasks: [
        {
          title: string,
          estimated_minutes: number,
          resources: string[]   // 링크, 도구 등
        }
      ]
    }
  ]
}
```

**프롬프트 원칙:**
- 하루 최대 3개 태스크 (집중력 유지)
- 각 태스크는 45분 이내 완료 가능하게
- 이전 주 완료율 반영해서 난이도 조정

---

### Agent 3: Reflection

**역할:** 세션 데이터를 분석해서 진솔하고 실행 가능한 회고 생성

**트리거:** 세션 종료 후 즉시

**입력:**
```typescript
{
  session: {
    duration_seconds: number,
    tasks_completed: string[],
    tasks_skipped: string[],
    apps_used: [{ name: string, duration_seconds: number }],
    goal_context: string
  }
}
```

**출력:**
```typescript
{
  accomplishments: string[],    // 오늘 이룬 것
  distractions: string[],       // 방해 요소
  focus_score: number,          // 0-100
  key_insight: string,          // 핵심 인사이트 1줄
  next_step: string,            // 내일 가장 먼저 할 것
  encouragement: string         // 동기부여 한 줄
}
```

**프롬프트 원칙:**
- 솔직하되 비판적이지 않게
- 데이터 기반 (앱 사용 시간 언급)
- 항상 다음 행동으로 마무리

---

### Agent 4: Content Creation

**역할:** 세션 회고를 LinkedIn "Build in Public" 포스트로 변환

**트리거:** Reflection Agent 완료 후

**입력:**
```typescript
{
  reflection: ReflectionOutput,
  goal_title: string,
  streak_count: number,
  total_hours_this_week: number,
  progress_percentage: number
}
```

**출력:**
```typescript
{
  hook: string,         // 첫 줄 (스크롤 멈추게 만드는)
  body: string,         // 본문 (3-5 bullet)
  cta: string,          // 마무리 질문/행동 유도
  hashtags: string[],   // 5-7개
  full_post: string     // 완성 포스트
}
```

**프롬프트 원칙:**
- 홍보성 아닌 진정성 있는 어조
- 숫자 + 구체적 성취 포함 (Day X, N시간)
- 공감 유발하는 훅 (완벽하지 않아도 됨)
- 한국어 / 영어 중 사용자 설정에 따라

---

### Agent 5: Reels Generator

**역할:** 세션 데이터 + 회고를 인스타그램 릴스 스크립트 + 오버레이 데이터로 변환

**트리거:** Content Creation Agent 완료 후 (또는 병렬)

**입력:**
```typescript
{
  session_stats: {
    duration_seconds: number,
    tasks_completed: string[],
    top_apps: string[],
    streak_count: number
  },
  reflection: {
    key_insight: string,
    focus_score: number
  },
  goal_title: string
}
```

**출력:**
```typescript
{
  narration_script: string,       // 나레이션 전체 텍스트 (TTS용)
  overlay_sequence: [
    {
      timestamp_sec: number,      // 영상 내 타이밍
      text: string,               // 화면 표시 텍스트
      style: 'title' | 'stat' | 'caption'
    }
  ],
  hook_text: string,              // 첫 3초 텍스트
  cta_text: string,               // 마지막 텍스트
  music_mood: 'focus' | 'hype' | 'chill',
  estimated_duration_sec: number
}
```

**프롬프트 원칙:**
- 첫 3초가 핵심 (스크롤 멈춤)
- 통계 숫자는 크고 명확하게
- 나레이션은 자연스러운 구어체
- 15-30초 기준

---

## 6. DB 스키마 (PostgreSQL + Prisma)

```prisma
model User {
  id          String   @id @default(cuid())
  clerkId     String   @unique
  email       String   @unique
  createdAt   DateTime @default(now())
  goals       Goal[]
  sessions    Session[]
}

model Goal {
  id              String   @id @default(cuid())
  userId          String
  title           String
  deadline        DateTime
  dailyHours      Float
  status          GoalStatus @default(ACTIVE)
  createdAt       DateTime @default(now())
  user            User     @relation(fields: [userId], references: [id])
  plans           Plan[]
  sessions        Session[]
}

model Plan {
  id         String   @id @default(cuid())
  goalId     String
  type       PlanType             // MONTHLY | WEEKLY | DAILY
  weekNumber Int?
  month      Int?
  content    Json                 // 에이전트 출력 저장
  createdAt  DateTime @default(now())
  goal       Goal     @relation(fields: [goalId], references: [id])
  tasks      Task[]
}

model Task {
  id           String     @id @default(cuid())
  planId       String
  title        String
  date         DateTime
  estimatedMin Int
  status       TaskStatus @default(TODO)
  plan         Plan       @relation(fields: [planId], references: [id])
}

model Session {
  id             String   @id @default(cuid())
  userId         String
  goalId         String
  startedAt      DateTime
  endedAt        DateTime?
  durationSec    Int?
  activityLog    Json?               // 앱 사용 로그
  videoLocalPath String?             // 로컬 영상 경로
  user           User       @relation(fields: [userId], references: [id])
  goal           Goal       @relation(fields: [goalId], references: [id])
  reflection     Reflection?
  linkedinPost   LinkedInPost?
  reel           Reel?
}

model Reflection {
  id              String   @id @default(cuid())
  sessionId       String   @unique
  accomplishments String[]
  distractions    String[]
  focusScore      Int
  keyInsight      String
  nextStep        String
  encouragement   String
  createdAt       DateTime @default(now())
  session         Session  @relation(fields: [sessionId], references: [id])
}

model LinkedInPost {
  id        String      @id @default(cuid())
  sessionId String      @unique
  hook      String
  body      String
  cta       String
  hashtags  String[]
  fullPost  String
  status    PostStatus  @default(DRAFT)
  createdAt DateTime    @default(now())
  session   Session     @relation(fields: [sessionId], references: [id])
}

model Reel {
  id                  String     @id @default(cuid())
  sessionId           String     @unique
  narrationScript     String
  overlaySequence     Json
  hookText            String
  ctaText             String
  musicMood           String
  estimatedDurationSec Int
  localVideoPath      String?
  status              ReelStatus @default(PENDING)
  createdAt           DateTime   @default(now())
  session             Session    @relation(fields: [sessionId], references: [id])
}

enum GoalStatus  { ACTIVE PAUSED COMPLETED }
enum PlanType    { MONTHLY WEEKLY DAILY }
enum TaskStatus  { TODO IN_PROGRESS DONE SKIPPED }
enum PostStatus  { DRAFT PUBLISHED }
enum ReelStatus  { PENDING PROCESSING READY EXPORTED }
```

---

## 7. Electron 내부 모듈 구조

### Session Manager
- 세션 시작/종료 전체 오케스트레이션
- Recorder, Tracker, FFmpeg, API Client 조율

### Screen Recorder
- `desktopCapturer.getSources()` 로 화면 캡처
- 5초 chunk 단위 mp4 저장 (`/sessions/YYYY-MM-DD/chunks/`)
- crash-safe: chunk 단위 저장으로 중간 종료 대응

### Activity Tracker
- `active-win` 라이브러리로 활성 윈도우 감지
- 10초마다 `{ app, title, url?, duration }` 기록
- 메모리 버퍼 → 세션 종료 시 JSON 직렬화

### FFmpeg Controller
- 세션 종료 후 chunks → 타임랩스 변환 (속도 8~16배)
- 통계 오버레이 합성 (집중 시간, 스트릭, 태스크)
- 최종 릴스용 mp4 생성

### API Client
- Clerk 토큰 포함 HTTP 요청
- `/api/sessions/start`, `/api/sessions/end` 호출
- 세션 결과 폴링 (`/api/sessions/:id`)

---

## 8. 30일 빌드 로드맵

### Week 1 (1-7일): 기반 구조
- [ ] Electron 프로젝트 초기화 (electron-vite)
- [ ] Next.js 프로젝트 초기화 (App Router + Prisma + Clerk)
- [ ] PostgreSQL Docker 설정
- [ ] DB 스키마 마이그레이션
- [ ] 기본 IPC + API 통신 확인

### Week 2 (8-14일): 트래킹 + 목표 설정
- [ ] Screen Recorder 구현 (chunk 방식)
- [ ] Activity Tracker 구현
- [ ] Session Manager 구현
- [ ] Goal Planner Agent 구현 + API
- [ ] Task Breakdown Agent 구현 + API
- [ ] 목표 입력 → 계획 생성 플로우 완성

### Week 3 (15-21일): AI 파이프라인
- [ ] Reflection Agent 구현
- [ ] Content Creation Agent 구현
- [ ] Reels Generator Agent 구현
- [ ] 세션 종료 → AI 파이프라인 자동 트리거
- [ ] 결과 저장 + 조회 API

### Week 4 (22-30일): 영상 + UI + 통합
- [ ] FFmpeg 타임랩스 + 오버레이 구현
- [ ] 대시보드 UI (세션 현황, 스트릭)
- [ ] 리플렉션 뷰 UI
- [ ] 콘텐츠 허브 UI (LinkedIn + 릴스)
- [ ] 전체 플로우 통합 테스트

---

## 9. 주요 기술 리스크

| 리스크 | 가능성 | 대응 |
|--------|--------|------|
| desktopCapturer 권한 거부 (macOS) | 높음 | 앱 시작 시 권한 요청 플로우 명확히 |
| FFmpeg 번들링 크기 (50-100MB) | 중간 | ffmpeg-static 패키지 사용 |
| OpenAI API 레이턴시 (에이전트 5개) | 중간 | 순차 실행, 각 단계 로딩 UI |
| Electron + Clerk 토큰 관리 | 중간 | 토큰 로컬 저장 + 자동 갱신 |
| 영상 로컬 저장 용량 | 중간 | 30일 이상 자동 삭제 정책 |
