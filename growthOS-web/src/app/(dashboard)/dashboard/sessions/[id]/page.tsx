import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentUserId } from '@/lib/currentUser'
import * as sessionsService from '@/modules/sessions/service'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { formatDuration, formatDateTime } from '@/lib/format'

// Render per request against live DB state.
export const dynamic = 'force-dynamic'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      {children}
    </section>
  )
}

function BulletList({ items, tone }: { items: string[]; tone: 'positive' | 'warn' }) {
  const dot = tone === 'positive' ? 'bg-emerald-500' : 'bg-rose-400'
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm text-slate-700">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
          {item}
        </li>
      ))}
    </ul>
  )
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const userId = await getCurrentUserId()
  const session = userId ? await sessionsService.getSessionDetail(id, userId) : null

  if (!session) notFound()

  const { reflection, linkedInPost, reel, activityLog } = session

  return (
    <>
      <PageHeader
        title={session.goalTitle}
        description={formatDateTime(session.startedAt)}
        action={
          <Link
            href="/dashboard/sessions"
            className="text-sm text-slate-500 transition hover:text-slate-900"
          >
            ← Sessions
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200/70">
          <span className="font-semibold tabular-nums text-slate-900">
            {session.durationSec != null ? formatDuration(session.durationSec) : '—'}
          </span>
          focused
        </span>
        {reflection && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200/70">
            <span className="font-semibold tabular-nums text-slate-900">
              {reflection.focusScore}
            </span>
            /100 focus
          </span>
        )}
        {session.endedAt === null && <Badge tone="progress">In progress</Badge>}
      </div>

      <div className="grid gap-4">
        {reflection ? (
          <Section title="Reflection">
            <p className="mb-4 text-base font-medium text-slate-900">{reflection.keyInsight}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              {reflection.accomplishments.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">Accomplishments</p>
                  <BulletList items={reflection.accomplishments} tone="positive" />
                </div>
              )}
              {reflection.distractions.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">Distractions</p>
                  <BulletList items={reflection.distractions} tone="warn" />
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <p className="text-slate-700">
                <span className="font-medium text-slate-500">Next step · </span>
                {reflection.nextStep}
              </p>
              <p className="italic text-slate-500">{reflection.encouragement}</p>
            </div>
          </Section>
        ) : (
          <Section title="Reflection">
            <p className="text-sm text-slate-400">
              No reflection generated for this session yet.
            </p>
          </Section>
        )}

        {activityLog.length > 0 && (
          <Section title="Activity">
            <ul className="divide-y divide-slate-100">
              {activityLog.map((entry, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-700">{entry.app}</span>
                  <span className="tabular-nums text-slate-400">
                    {formatDuration(entry.durationSec)}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {linkedInPost && (
          <Section title="LinkedIn Post">
            <p className="mb-2 font-medium text-slate-900">{linkedInPost.hook}</p>
            <p className="whitespace-pre-line text-sm text-slate-700">{linkedInPost.body}</p>
            <p className="mt-3 text-sm text-slate-600">{linkedInPost.cta}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {linkedInPost.hashtags.map((tag) => (
                <Badge key={tag} tone="accent">
                  {tag}
                </Badge>
              ))}
            </div>
          </Section>
        )}

        {reel && (
          <Section title="Reel Script">
            <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <Badge tone="neutral">{reel.musicMood}</Badge>
              <Badge tone="neutral">{reel.estimatedDurationSec}s</Badge>
            </div>
            <p className="mb-1 text-xs font-medium text-slate-500">Hook</p>
            <p className="mb-3 text-sm text-slate-900">{reel.hookText}</p>
            <p className="mb-1 text-xs font-medium text-slate-500">Narration</p>
            <p className="whitespace-pre-line text-sm text-slate-700">{reel.narrationScript}</p>
            <p className="mb-1 mt-3 text-xs font-medium text-slate-500">CTA</p>
            <p className="text-sm text-slate-900">{reel.ctaText}</p>
          </Section>
        )}
      </div>
    </>
  )
}
