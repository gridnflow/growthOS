import * as Sentry from '@sentry/nextjs'
import { validSentryDsn } from './src/lib/sentryDsn'

const dsn = validSentryDsn(process.env.NEXT_PUBLIC_SENTRY_DSN)

Sentry.init({
  dsn,
  tracesSampleRate: 1,
  enabled: Boolean(dsn),
})
