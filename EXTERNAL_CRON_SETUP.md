# External Cron Setup (Hobby Plan Workaround)

Vercel Hobby plan only allows daily cron jobs. For more frequent scraping,
use an external cron service to hit our API routes.

## Recommended: cron-job.org (FREE)

1. Go to https://cron-job.org
2. Create an account
3. Add these jobs:

| URL | Schedule | Description |
|-----|----------|-------------|
| https://atelier.harchcorp.com/api/cron/refresh?XTransformPort=3000 | Every 15 min | Refresh articles + sentiment |
| https://atelier.harchcorp.com/api/cron/whatsapp-alerts?XTransformPort=3000 | Every 5 min | Send WhatsApp alerts |
| https://atelier.harchcorp.com/api/cron/scrape-rss?XTransformPort=3000 | Every 30 min | Scrape RSS feeds |
| https://atelier.harchcorp.com/api/cron/audit-sentinel?XTransformPort=3000 | Hourly | Audit sentinel |

## Alternative: EasyCron (FREE tier)

Same URLs, same schedules.

## Alternative: GitHub Actions (FREE)

Create .github/workflows/cron.yml:
```yaml
on:
  schedule:
    - cron: '*/15 * * * *'
jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST https://atelier.harchcorp.com/api/cron/refresh
```

## Notes
- The ?XTransformPort=3000 is required by the Caddy gateway
- All cron routes check for CRON_SECRET header (if configured)
- Without CRON_SECRET, routes are open (acceptable for now)
