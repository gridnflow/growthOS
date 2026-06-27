# 대시보드 UI 설계 (Task 1-2)

> **이 문서가 단일 정본(canonical)이다.** (DESIGN_SPEC.md는 폐기·삭제됨 — 내용은 이 문서에 흡수.)
> design 에이전트 최종 산출물. developer가 이 문서 기준으로 구현한다.
> content 레이아웃 = **탭**(ContentTabs Client 컴포넌트). 경로 = `/dashboard`(`app/(dashboard)/dashboard/...`).
> 제약: Next.js 15 App Router, **Server Component 기본**, 상호작용 필요한 부분만 `'use client'`. Tailwind only(UI 라이브러리 추가 금지). 톤은 기존 landing의 흑백(`bg-black text-white`) 유지.

---

## 0. 열린 항목 결정 (근거 포함)

### 결정 1 — 세션 상세: **별도 `sessions/[id]/page.tsx` 페이지** 채택

- 근거:
  - 세션 상세에는 reflection(accomplishments/distractions/insight/nextStep), LinkedIn 포스트 전문, 릴스 스크립트+오버레이 시퀀스, 영상 경로까지 들어간다. 모달/드로어에 담기엔 정보량이 많고 스크롤이 길다.
  - 공유 가능한 URL(`/dashboard/sessions/{id}`)이 있어야 추후 "이 세션 결과 보기" 링크(콘텐츠 발행 후 역링크 등)에 쓸 수 있다.
  - App Router에서 Server Component로 단순하게 데이터 패칭 가능 — 모달은 인터셉트 라우트/클라이언트 상태가 필요해 복잡도만 늘어난다.
- 단, **상세 페이지 자체 구현은 이 태스크(1-2) 범위 밖**. 이번엔 sessions 목록의 각 행을 `/dashboard/sessions/{id}`로 링크만 걸어 둔다(라우트는 후속 태스크).

### 결정 2 — 메인 통계 vs sessions 요약 바 중복: **역할 분리로 중복 제거**

- 메인 대시보드 통계 카드 = **"오늘/현재 상태"** 관점: 현재 스트릭, 목표 진행률(%), 오늘 완료 태스크 수. (시간축 = now)
- sessions 페이지 = **"누적 히스토리"** 관점. 상단에 별도의 통계 카드를 두지 않고, 가벼운 **요약 한 줄**(총 세션 수, 총 집중 시간)만 리스트 헤더에 인라인으로 표기.
- 근거: 같은 StatCard 3종을 두 페이지에 반복하면 정보가 중복되고 "어디서 봐야 하지" 혼란이 생긴다. 메인은 액션 유도(today/streak), sessions는 탐색(history)으로 의도를 분리한다. → 중복 없음.

### 결정 3 — content 페이지: **탭 전환** 채택

- 근거:
  - LinkedIn 포스트와 Reels는 카드 구조·정보 밀도가 서로 다르다(포스트=텍스트 위주, 릴스=영상 메타+스크립트). 2컬럼으로 나란히 두면 좁은 컬럼에 텍스트가 눌려 가독성이 떨어진다.
  - 사용자는 보통 "지금은 포스트만" 또는 "지금은 릴스만" 보고 싶어 한다 → 탭이 의도에 맞다.
  - 탭은 활성 상태 관리가 필요해 작은 `'use client'` 경계 1개가 생기지만, URL 쿼리(`?tab=posts`)로도 처리 가능. **구현은 가장 단순한 클라이언트 로컬 state 탭**으로 한다(공유 URL 불필요).

---

## 1. 디자인 토큰 (Tailwind 유틸 직접 사용 — config 확장 불필요)

| 용도 | 클래스 |
|------|--------|
| 페이지 배경 | `bg-gray-50` |
| 카드 표면 | `bg-white border border-gray-200 rounded-xl p-6` |
| 주요 텍스트 | `text-gray-900` |
| 보조 텍스트 | `text-gray-500` |
| 액션 버튼 | `bg-black text-white hover:bg-gray-800 rounded-lg px-4 py-2` |
| 섹션 라벨 | `text-sm font-medium text-gray-500` |
| 큰 숫자 | `text-3xl font-bold text-gray-900` |
| 그리드 간격 | `gap-6` |

상태 톤(Badge 매핑):
| tone | 클래스 | 사용처 |
|------|--------|--------|
| `positive` | `text-emerald-700 bg-emerald-50` | DONE / ACTIVE / READY / PUBLISHED / 스트릭 활성 |
| `progress` | `text-amber-700 bg-amber-50` | IN_PROGRESS / PROCESSING / In progress |
| `neutral` | `text-gray-600 bg-gray-100` | TODO / DRAFT / PENDING / PAUSED |
| `warn` | `text-rose-700 bg-rose-50` | SKIPPED / Overdue |

---

## 2. 공통 컴포넌트 (`src/components/ui/` 신규)

모두 순수 표현 컴포넌트 → **Server Component로 동작**(별도 `'use client'` 불필요). 3회 이상 반복되는 것만 컴포넌트화.

| 컴포넌트 | props 개요 | 설명 |
|----------|-----------|------|
| `Card` | `{ children, className? }` | 카드 표면 래퍼 |
| `StatCard` | `{ label: string; value: string\|number; sub?: string; emphasis?: boolean }` | 라벨+큰 숫자+보조텍스트. `emphasis`면 숫자 색 강조 |
| `Badge` | `{ tone: 'positive'\|'progress'\|'neutral'\|'warn'; children }` | `rounded-full px-2.5 py-0.5 text-xs font-medium` |
| `PageHeader` | `{ title: string; description?: string; action?: ReactNode }` | 페이지 상단 제목줄 + 우측 액션 슬롯 |
| `EmptyState` | `{ title: string; description?: string; action?: ReactNode }` | `border border-dashed border-gray-200 rounded-xl py-16 text-center` |
| `ProgressBar` | `{ value: number }` (0–100) | 트랙 `bg-gray-100`, 채움 `bg-black`, `h-2 rounded-full` |
| `SessionRow` | `{ session }` (아래 4번 데이터) | sessions 리스트 1행. 날짜/목표/duration/focus/AI칩 |
| `ContentCard` | 변형 2개(아래 5번) | 포스트용/릴스용 분기 — 또는 `PostCard`/`ReelCard` 별도 |

> `SessionRow`, `ContentCard`도 표시 전용이라 Server Component. 날짜/duration 포맷은 **서버에서 string으로 변환해 props로 전달**(Date 객체를 Client로 내리지 않기 위함, 그리고 직렬화 안정성).

포맷 헬퍼(`src/lib/format.ts` 신규 제안):
- `formatDuration(sec: number): string` → `"1h 23m"` / `"45m"` (sessions duration, 초 단위)
- `formatMinutes(min: number): string` → `"1h 20m"` / `"45m"` (analytics 합계는 분 단위로 옴 — todayFocusedMin 등)
- `formatDate(d: Date): string` → `toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })`
- `formatDateTime(d: Date): string` → 위 + 시:분

---

## 3. 공유 셸 — `(dashboard)/layout.tsx`

좌측 고정 사이드바 + 우측 콘텐츠. Server Component(셸 자체).

```
┌────────────┬──────────────────────────────────┐
│ Sidebar    │  Topbar (앱 이름/빈 영역, 인증 없음) │
│ (w-56,     ├──────────────────────────────────┤
│  hidden    │                                  │
│  md:flex)  │   <main className="              │
│            │     mx-auto max-w-6xl px-8 py-8"> │
│  GrowthOS  │     {children}                   │
│  ───       │   </main>                        │
│  Nav x4    │                                  │
└────────────┴──────────────────────────────────┘
```

Client 경계(최소):
- `SidebarNav` (`'use client'`) — `usePathname()`로 활성 항목 강조. 활성: `bg-gray-100 text-gray-900 font-medium`, 비활성: `text-gray-500 hover:bg-gray-50`. nav 항목 4개:
  - Dashboard `/dashboard` · Goals `/dashboard/goals` · Sessions `/dashboard/sessions` · Content `/dashboard/content`
  (인증 없음 — Topbar에 UserButton 없음. 앱 이름/빈 영역만.)

모바일: 사이드바 `hidden md:flex`, 모바일은 Topbar에 가로 스크롤 탭 줄(동일 nav 항목)로 폴백.

> 경로 구조 확정: 메인이 `/dashboard`가 되도록 **`app/(dashboard)/dashboard/page.tsx`** + `.../dashboard/goals|sessions|content/page.tsx`. (라우트 그룹 `(dashboard)`는 URL에 안 나오므로 실제 세그먼트 `dashboard/`가 필요. landing의 `/dashboard` 링크와 일치.)

---

## 4. 페이지별 설계

### 4-1. 메인 대시보드 — `dashboard/page.tsx` (Server Component)

데이터(서비스 계약 — 실제 커밋된 시그니처 기준, commit 20301fa):
- `analyticsService.getDashboardSummary(userId)` → `DashboardSummary = { currentStreak, todayFocusedMin, weekFocusedMin, activeGoalsCount, overallProgressPct }`
- `goalsService.getTodayTasks(userId)` → `Task[]`(plan→goal include)
- `goalsService.getGoals(userId)` → 활성 목표(상단 컨텍스트/빈 상태 판단 — `activeGoalsCount`로도 대체 가능하나 목록이 필요하면 호출)

> 주의: `getDashboardSummary`엔 "오늘 완료 태스크 수" 필드가 없다(`todayFocusedMin`은 있음). 그래서 통계 카드 3번째는 "Today's Focus"(분→시간 표기)로 잡고, 오늘 완료/예정 태스크는 아래 "Today's Tasks" 리스트(`getTodayTasks`)에서 status로 표현한다.

레이아웃:
```
<PageHeader title="Dashboard" description="오늘의 집중 현황" />

[활성 목표 0개]
  → <EmptyState title="첫 목표를 만들어 보세요"
       description="목표를 등록하면 AI가 주간 계획을 세워줍니다"
       action={Goals로 이동 버튼} />
  (목표 없으면 통계/할일 섹션은 생략)

[활성 목표 있음]
  통계 행: grid grid-cols-1 sm:grid-cols-3 gap-6
    <StatCard label="Current Streak" value={currentStreak} sub="days"
              emphasis={currentStreak>0} />            // 🔥 streak 0이면 강조 끔
    <StatCard label="Overall Progress" value={`${overallProgressPct}%`}>
       하단 <ProgressBar value={overallProgressPct} />
    </StatCard>
    <StatCard label="Today's Focus" value={formatMinutes(todayFocusedMin)} />
       // todayFocusedMin(분) → "1h 20m" 표기. formatMinutes 헬퍼(아래 §2)

  오늘 할 일: <Card> 전체폭
    섹션 라벨 "Today's Tasks"
    Task 리스트(스택, divide-y):
      각 행: [상태 Badge] {title}  ·  {estimatedMin}m  ·  {goal.title}(text-gray-400)
        status→tone: TODO neutral / IN_PROGRESS progress / DONE positive / SKIPPED warn
    비었으면 <EmptyState title="오늘 예정된 할 일이 없습니다" /> (카드 안)
```

Server/Client: 전부 Server. 인터랙션 없음(태스크 체크 토글은 후속 태스크).

### 4-2. Goals — `dashboard/goals/page.tsx` (Server Component)

데이터: `getGoals(userId)` → `Goal[]` (`{ id, title, deadline, dailyHours, status, createdAt }`).

레이아웃:
```
<PageHeader title="Goals" description="진행 중인 목표"
   action={<새 목표 버튼 — placeholder, 폼은 범위 밖>} />

[0개] → <EmptyState title="아직 목표가 없습니다"
          description="첫 목표를 등록해 보세요" action={새 목표 버튼} />

[있음] grid grid-cols-1 lg:grid-cols-2 gap-6
  <Card> (goal 1개)
    상단 행: {title}(text-lg font-semibold)  +  <Badge tone=status매핑>{status}</Badge>
       status→tone: ACTIVE positive / PAUSED neutral / COMPLETED neutral
    메타 행(text-sm text-gray-500): "Deadline {formatDate(deadline)}" · "{dailyHours}h/day"
    하단: D-day — 남은 일수 계산
       미래: <Badge neutral>D-{n}</Badge>, 지남: <Badge warn>Overdue</Badge>, 오늘: "D-day"
```

Server/Client: 전부 Server. (새 목표 버튼은 자리만, `disabled` 또는 추후 라우트.)

### 4-3. Sessions — `dashboard/sessions/page.tsx` (Server Component)

데이터: `sessionsService.getRecentSessions(userId)` → `{ sessions: SessionListItem[], summary: { totalSessions, totalFocusSec } }`. `SessionListItem` 각 항목:
```
{
  id, startedAt: Date, endedAt: Date|null, durationSec: number|null,
  goal: { title },
  hasReflection: boolean, focusScore: number|null,
  hasPost: boolean, hasReel: boolean,
}
```
(존재 여부만 boolean으로 — 상세는 [id] 페이지에서. service가 select로 가볍게 조회.)
+ 요약: `{ totalSessions, totalFocusSec }`(결정2의 인라인 요약용).

레이아웃:
```
<PageHeader title="Sessions" description="집중 세션 기록" />

리스트 헤더 인라인 요약(text-sm text-gray-500):
   "{totalSessions} sessions · {formatDuration(totalFocusSec)} focused"   // 통계 카드 아님

[0개] → <EmptyState
   title="아직 기록된 세션이 없습니다"
   description="트래킹 에이전트로 첫 집중 세션을 시작하세요" />

[있음] <Card className="divide-y p-0">  // 행 패딩은 SessionRow 내부
  <SessionRow> × N  (Link로 /dashboard/sessions/{id} — 라우트는 후속)
    좌: {formatDateTime(startedAt)} / {goal.title}(text-gray-400 text-sm)
    중: endedAt? formatDuration(durationSec) : <Badge progress>In progress</Badge>
        · Focus {focusScore ?? '—'}{focusScore!=null && '/100'}
    우: AI 산출물 칩 3개 —
        Reflection: hasReflection ? <Badge positive>Reflection</Badge> : <Badge neutral>—</Badge>
        Post:       hasPost ? positive "Post" : neutral "—"
        Reel:       hasReel ? positive "Reel" : neutral "—"
```

Server/Client: 전부 Server.

### 4-4. Content — `dashboard/content/page.tsx`

데이터: `contentService.getContentItems(userId)` → `{ posts: PostItem[], reels: ReelItem[] }`
- `PostItem`: `{ id, hook, body, hashtags: string[], status, sessionGoalTitle, createdAt }`
- `ReelItem`: `{ id, hookText, narrationScript, musicMood, estimatedDurationSec, overlayCount, status, sessionGoalTitle, createdAt }`

레이아웃(결정3 = 탭):
```
페이지 컴포넌트(Server)에서 posts/reels 패칭 →
  <ContentTabs posts={posts} reels={reels} />   // 'use client' — 탭 상태만

<PageHeader title="Content" description="AI가 생성한 발행 콘텐츠" />

<ContentTabs> ('use client'):
  탭 바: [ LinkedIn Posts (n) ] [ Reels (n) ]
    활성 탭: border-b-2 border-black text-gray-900, 비활성: text-gray-500
  탭 = posts:
    [0개] EmptyState "아직 생성된 포스트가 없습니다"
    [있음] grid grid-cols-1 lg:grid-cols-2 gap-6
      <PostCard>:
        <Badge status>{DRAFT neutral|PUBLISHED positive}</Badge>
        {hook}(font-semibold)
        {body}(text-gray-600 text-sm line-clamp-3)        // line-clamp-3 코어 유틸 OK(tailwind ^3.4)
        {hashtags.join(' ')}(text-gray-400 text-xs)
        footer: {sessionGoalTitle} · {formatDate(createdAt)}(text-gray-400 text-xs)
  탭 = reels:
    [0개] EmptyState "아직 생성된 릴스가 없습니다"
    [있음] grid grid-cols-1 lg:grid-cols-2 gap-6
      <ReelCard>:
        <Badge status>{PENDING neutral|PROCESSING progress|READY/EXPORTED positive}</Badge>
        {hookText}(font-semibold)
        meta 행: "{estimatedDurationSec}s" · <Badge neutral>{musicMood}</Badge> · "{overlayCount} overlays"
        {narrationScript}(text-gray-600 text-sm line-clamp-3)
        footer: {sessionGoalTitle} · {formatDate(createdAt)}
```

Server/Client 경계:
- `content/page.tsx` = Server(데이터 패칭).
- `ContentTabs` = `'use client'`(탭 활성 state만). `PostCard`/`ReelCard`는 표시 전용이라 Server로 둘 수 있으나, ContentTabs 자식으로 렌더되면 클라이언트 트리에 포함됨 → **데이터는 이미 직렬화된 string 필드만 내려가므로 문제 없음**(Date는 페이지에서 formatDate로 string화해 전달).

---

## 5. 빈 상태(empty state) 요약

| 페이지 | 조건 | 메시지 |
|--------|------|--------|
| 메인 | 활성 목표 0 | "첫 목표를 만들어 보세요" + Goals 버튼 (통계/할일 숨김) |
| 메인 | 오늘 할 일 0 | 카드 안 "오늘 예정된 할 일이 없습니다" |
| Goals | 목표 0 | "아직 목표가 없습니다" + 새 목표 버튼 |
| Sessions | 세션 0 | "아직 기록된 세션이 없습니다…" |
| Content/Posts | 포스트 0 | "아직 생성된 포스트가 없습니다" |
| Content/Reels | 릴스 0 | "아직 생성된 릴스가 없습니다" |

---

## 6. Server/Client 경계 — 한눈에

| 파일 | 종류 |
|------|------|
| `(dashboard)/layout.tsx` | Server |
| `SidebarNav` | **Client** (usePathname) |
| 4개 page.tsx | 모두 Server (데이터 패칭) |
| `Card/StatCard/Badge/PageHeader/EmptyState/ProgressBar/SessionRow/PostCard/ReelCard` | Server(순수 표현) |
| `ContentTabs` | **Client** (탭 state) |

→ Client는 `SidebarNav`, `ContentTabs` 둘뿐. 나머지 전부 Server. (인증 없음 → UserButton 없음.)

---

## 7. developer 메모 (데이터 진입점 · 직렬화 · 유저 매핑)

### 7-1. service 계약 (FINAL — 함수명·모듈 확정)

모든 page는 **service만** 호출(repository 직접 접근 금지, 모듈 경계 원칙). 모듈별 진입점:

| 페이지 | 호출 | 상태 |
|--------|------|------|
| 메인 | `analyticsService.getDashboardSummary(userId)` → `DashboardSummary` | **구현 완료**(commit 20301fa). 필드: `currentStreak, todayFocusedMin, weekFocusedMin, activeGoalsCount, overallProgressPct` |
| 메인 | `goalsService.getTodayTasks(userId)` | 기존 존재 |
| 메인 | `goalsService.getGoals(userId)` | 기존 존재 — ACTIVE 목표만 |
| Goals | `goalsService.getAllGoals(userId)` | 전체 목표(ACTIVE/PAUSED/COMPLETED) + 상태 배지 |
| Sessions | `sessionsService.getRecentSessions(userId)` → `{ sessions: SessionListItem[], summary: { totalSessions, totalFocusSec } }` | **신규** — sessions 모듈 service/repository에 추가. reflection/linkedInPost/reel은 존재여부 boolean + focusScore만 `select`로 가볍게 |
| Content | `contentService.getContentItems(userId)` → `{ posts: PostItem[], reels: ReelItem[] }` | **신규** — content 모듈 service 신설(현재 repository/types만 존재), session join |

> 함수명 통일: sessions = `getRecentSessions`(단수 목록 조회 1개), content = `getContentItems`(posts+reels 한 번에). 이전 SPEC의 `getSessionsByUser`/`getLinkedInPosts`+`getReels`는 폐기. 신규 타입(`SessionListItem`, `PostItem`, `ReelItem`)은 각 모듈 `types.ts`에 명시.

### 7-2. 직렬화 / Server Component 주의

- **Date 객체를 Client 컴포넌트로 내리지 말 것.** page(Server)에서 `formatDate/formatDateTime/formatDuration/formatMinutes`로 string 변환 후 props 전달. 특히 `ContentTabs`(Client)에 넘기는 `PostItem`/`ReelItem`의 `createdAt`은 반드시 string화.
- 4개 page는 모두 Server Component이므로 service를 직접 `await` 호출. (`'use client'` page 금지.)

### 7-3. 유저 컨텍스트 (인증 없음 — 단일 사용자)

- 인증 제거됨. service들은 **내부 cuid `userId`** 를 받고, page는 `lib/currentUser.ts`의 `getCurrentUserId()`로 고정 사용자(`DEFAULT_USER_EMAIL`, 기본 `seed@growthos.dev`) id를 얻어 service 호출.
- middleware/라우트 보호 없음. page 상단에서 user 미존재 시 방어 처리(빈 상태 렌더).

### 7-4. 기타

- `line-clamp-3`은 Tailwind ^3.4 코어 유틸 → config 변경 불필요.
- "새 목표" 버튼·태스크 체크 토글·세션 상세(`[id]`) 페이지는 모두 이 태스크(1-2) **범위 밖** — placeholder/링크만.
