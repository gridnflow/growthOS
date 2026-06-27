import * as Sentry from '@sentry/nextjs'
import { validSentryDsn } from './src/lib/sentryDsn'

// No valid DSN → init is a no-op, so Sentry stays disabled when unconfigured
// or when .env still holds a placeholder.
const dsn = validSentryDsn(process.env.SENTRY_DSN)

Sentry.init({
  dsn,
  tracesSampleRate: 1,
  enabled: Boolean(dsn),
})
