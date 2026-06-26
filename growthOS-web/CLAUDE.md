# growthOS-web — Claude 지시서

> 글로벌 규칙은 `../CLAUDE.md` 참조. 이 파일은 Next.js 웹앱 레포 전용 규칙.

---

## 이 레포의 역할

**웹 대시보드 + API 백엔드 통합.** Electron이 보내는 세션 데이터를 받아 AI 파이프라인을 실행하고, 결과를 저장 및 표시한다.

이 레포가 하는 일:
1. 고정 사용자 컨텍스트 제공 (인증 없음 — 단일 사용자 앱)
2. 목표 관리 (Goal Planner + Task Breakdown Agent)
3. 세션 데이터 수신 및 저장
4. AI 파이프라인 실행 (5개 에이전트)
5. 대시보드 / 리플렉션 / 콘텐츠 허브 UI
6. Electron에 API 제공

---

## 기술 스택

- Next.js 15 (App Router, Server Components 기본)
- TypeScript (strict)
- Prisma ORM + PostgreSQL
- 인증 없음 (단일 사용자, lib/currentUser.ts의 고정 사용자)
- OpenAI SDK (GPT-4.1)
- Tailwind CSS
- Sentry (에러 모니터링)
- PostHog (분석)

---

## 프로젝트 구조

```
growthOS-web/
├── src/
│   ├── app/                          ← Next.js App Router
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx              ← 메인 대시보드
│   │   │   ├── goals/page.tsx        ← 목표 관리
│   │   │   ├── sessions/page.tsx     ← 세션 히스토리
│   │   │   └── content/page.tsx      ← 콘텐츠 허브
│   │   └── api/
│   │       ├── sessions/
│   │       │   ├── start/route.ts
│   │       │   ├── end/route.ts
│   │       │   └── [id]/route.ts
│   │       ├── goals/
│   │       │   └── route.ts
│   │       ├── tasks/
│   │       │   └── today/route.ts
│   │       └── ai/
│   │           └── trigger/route.ts
│   ├── modules/                      ← 핵심 비즈니스 로직
│   │   ├── goals/
│   │   │   ├── service.ts
│   │   │   ├── repository.ts
│   │   │   └── types.ts
│   │   ├── sessions/
│   │   │   ├── service.ts
│   │   │   ├── repository.ts
│   │   │   └── types.ts
│   │   ├── ai-agents/
│   │   │   ├── goalPlanner.ts
│   │   │   ├── taskBreakdown.ts
│   │   │   ├── reflection.ts
│   │   │   ├── contentCreator.ts
│   │   │   ├── reelsGenerator.ts
│   │   │   └── types.ts            ← 모든 에이전트 입출력 타입
│   │   ├── content/
│   │   │   ├── service.ts
│   │   │   ├── repository.ts
│   │   │   └── types.ts
│   │   └── analytics/
│   │       ├── service.ts
│   │       └── types.ts
│   └── lib/
│       ├── prisma.ts               ← Prisma 클라이언트 싱글턴
│       ├── openai.ts               ← OpenAI 클라이언트 싱글턴
│       └── currentUser.ts          ← 고정 사용자 조회 (인증 없음)
├── prisma/
│   └── schema.prisma
└── .env.local
```

---

## 모듈 작성 규칙

각 모듈은 반드시 3개 파일로 구성:

```typescript
// repository.ts — DB 접근만 담당
export async function findGoalById(id: string): Promise<Goal | null> {
  return prisma.goal.findUnique({ where: { id } })
}

// service.ts — 비즈니스 로직, repository 호출
export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  // 검증 + 비즈니스 규칙
  const goal = await goalRepository.createGoal(input)
  // 사이드 이펙트 (에이전트 트리거 등)
  return goal
}

// types.ts — 입출력 타입 명시
export type CreateGoalInput = {
  userId: string
  title: string
  deadline: Date
  dailyHours: number
}
```

모듈 간 규칙:
- 다른 모듈의 `repository`를 직접 import 금지
- 반드시 `service`를 통해 호출
- 순환 참조 금지

---

## AI 에이전트 작성 규칙

모든 에이전트는 `modules/ai-agents/` 안에 위치.

```typescript
// 예시: reflection.ts
import { openai } from '@/lib/openai'
import type { ReflectionInput, ReflectionOutput } from './types'

export async function runReflectionAgent(
  input: ReflectionInput
): Promise<ReflectionOutput> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: REFLECTION_SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify(input) }
    ],
    response_format: { type: 'json_object' }  // 반드시 JSON 출력 강제
  })

  return JSON.parse(completion.choices[0].message.content!) as ReflectionOutput
}
```

에이전트 규칙:
- 입출력 타입은 `types.ts`에 반드시 명시
- `response_format: { type: 'json_object' }` 항상 사용
- 에이전트 함수는 `run{AgentName}Agent` 네이밍
- 에이전트 내부에서 DB 접근 금지 (service에서 호출 후 저장)

---

## AI 파이프라인 실행 순서

세션 종료 API (`POST /api/sessions/end`) 호출 시:

```
1. Session 저장 (DB)
2. Reflection Agent 실행 → Reflection 저장
3. Content Creation Agent 실행 → LinkedInPost 저장
4. Reels Generator Agent 실행 → Reel 저장
```

Goal 생성 시:
```
1. Goal 저장 (DB)
2. Goal Planner Agent 실행 → Plan(MONTHLY) 저장
3. Task Breakdown Agent 실행 → Plan(WEEKLY) + Task[] 저장
```

에이전트 실행 중 에러: 해당 에이전트만 실패 처리, 파이프라인 중단 금지.

---

## API Route 작성 규칙

```typescript
// app/api/sessions/end/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  // service 호출만 — 비즈니스 로직 여기 작성 금지
  const result = await sessionService.endSession({ userId, ...body })

  return NextResponse.json(result)
}
```

---

## 환경변수 목록

```
DATABASE_URL=postgresql://localhost:5432/growthos
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
SENTRY_DSN=
```

---

## Electron에서 오는 요청 처리 주의

- 인증 없음 → 토큰/헤더 검증 없이 처리. 모든 요청은 `lib/currentUser.ts`의 고정 사용자로 귀속.
- API Route는 `getCurrentUserId()`로 사용자 컨텍스트를 얻는다.
- CORS: `localhost:*`에서 오는 Electron 요청 허용 (dev 환경)

---

## 작업 시 주의

- Server Component 기본, Client Component는 상호작용 필요 시에만 (`'use client'`)
- Prisma 클라이언트는 `lib/prisma.ts` 싱글턴만 사용
- OpenAI 클라이언트는 `lib/openai.ts` 싱글턴만 사용
- 환경변수는 `.env.local`에만, 커밋 금지
