// A DSN is only usable if it's a real Sentry URL. Empty values OR leftover
// placeholders (e.g. "your_sentry_dsn_here" from .env.example) must be treated
// as "not configured" — otherwise Sentry.init throws "Invalid Sentry Dsn".
export function validSentryDsn(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  return /^https:\/\/.+@.+\/.+$/.test(raw) ? raw : undefined
}
