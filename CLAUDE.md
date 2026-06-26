# GrowthOS — 글로벌 Claude 지시서

## 프로젝트 개요
GrowthOS는 Electron 기반 화면 추적 에이전트 + Next.js 웹 대시보드로 구성된 AI 성장 기록 시스템이다.
세부 계획은 `PROJECT_PLAN.md`를 참조할 것.

---

## 레포 구조
```
growthOS/
├── growthOS-electron/   ← Tracking Agent (화면 녹화, 활동 추적, FFmpeg)
└── growthOS-web/        ← 웹앱 (Next.js, AI 에이전트, 대시보드)
```
각 레포에 별도 `CLAUDE.md`가 있다. 레포 작업 시 해당 파일 우선 참조.

---

## 확정된 의사결정 (재논의 금지)

아래 결정들은 이미 확정됐다. 다시 제안하거나 대안을 묻지 말 것.

| 항목 | 결정 |
|------|------|
| 레포 | 2개 분리 (electron / web) |
| DB | PostgreSQL (로컬 Docker → 이후 Neon) |
| Auth | Clerk |
| AI 모델 | OpenAI GPT-4.1 (전부) |
| 영상 저장 | 로컬 파일시스템 (POC), S3/R2는 이후 |
| FFmpeg | Electron에 번들, 로컬 실행 |
| Electron 역할 | Tracking Agent만 (UI 최소화) |
| Next.js 역할 | 웹 대시보드 + API 백엔드 |
| 스케일 전략 | 모듈러 모놀리스 (나중에 서비스 분리) |

---

## 기술 스택 제약

아래 목록 외 라이브러리/서비스는 강한 이유 없이 추가하지 말 것.

- **Frontend:** Next.js 15 (App Router), React, Electron (electron-vite)
- **Backend:** Node.js TypeScript (Next.js API Routes)
- **DB:** PostgreSQL + Prisma ORM
- **Auth:** Clerk
- **AI:** OpenAI GPT-4.1
- **영상:** FFmpeg, Remotion, Whisper
- **Queue:** BullMQ + Redis (필요 시에만)
- **모니터링:** Sentry, PostHog
- **CI/CD:** GitHub Actions

---

## 코딩 원칙

- TypeScript 엄격 모드 (`strict: true`)
- 주석은 WHY가 명확할 때만, WHAT 설명 주석 금지
- 에러 핸들링은 시스템 경계(API, 외부 서비스)에만
- 추상화는 3번 반복될 때만 도입
- 모든 AI 에이전트 입출력 타입은 명시적으로 정의

---

## 모듈 경계 원칙

`growthOS-web`의 각 모듈은:
```
modules/{name}/
  service.ts      ← 비즈니스 로직
  repository.ts   ← DB 접근 (Prisma)
  types.ts        ← 입출력 타입
```
모듈 간 직접 DB 접근 금지. 반드시 service를 통해 호출.

---

## 작업 전 확인사항

코드 작성 전 반드시:
1. 해당 레포의 `CLAUDE.md` 확인
2. `PROJECT_PLAN.md`의 DB 스키마/API 계약 확인
3. 의사결정이 필요한 사항은 먼저 질문
