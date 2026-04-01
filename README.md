# DEINDEX.ME

> Offline is the New Luxury. Delete your presence. Escape will make you god.

A free, open-source platform that helps you erase your digital footprint. Enter your email and phone number. We scan the internet for every account, data broker, and breach tied to your identity. You review what we found. You press the button. We send deletion requests, generate legal templates, and email you a PDF report. Then we forget you ever existed.

No accounts. No stored data. No business model. This is a cause, not a product.

## What It Does

- **Scan** — Discovers your digital presence using Have I Been Pwned and a curated service database of data brokers, social platforms, and ad networks
- **Review** — Shows every service we found, categorized by deletion difficulty. Add or remove targets before you commit
- **Detonate** — Sends automated deletion requests (GDPR/CCPA) where legally simple, generates pre-filled email drafts for complex targets, and provides step-by-step guides for services that resist
- **Report** — Emails you a comprehensive PDF with everything that happened, every draft, every guide. This is your only record
- **Purge** — The moment your report is sent, all data is destroyed. No 7-day window. No "we keep it for analytics." Gone

## Quick Start (For Users)

Just visit [deindex.me](https://deindex.me). No installation. No account. No data stored.

## For Developers

### Prerequisites

- Node.js 20+
- npm 9+
- API keys (see `.env.example`):
  - [Have I Been Pwned](https://haveibeenpwned.com/API/Key) — account discovery
  - [Resend](https://resend.com) — transactional email
  - [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) — bot prevention
  - [Stripe](https://stripe.com) — donations (optional)

### Setup

```bash
# Clone your fork
git clone https://github.com/<your-fork>/escape-will-make-me-god.git
cd escape-will-make-me-god

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local — at minimum, set JWT_SECRET (any random string works for local dev)

# Start the dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

**Minimum local env vars:** Only `JWT_SECRET` is required to start the dev server. Without other keys, external features degrade gracefully:
- No `HIBP_API_KEY` — HIBP scan returns an error; database scan still works
- No `RESEND_API_KEY` — email sending fails; test the flow up to that point
- No `TURNSTILE_SECRET_KEY` — form submission is blocked. Use [Cloudflare's test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) for local development:
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`
  - `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA`

### Running Tests

```bash
npm run test          # Unit + integration tests (Vitest)
npm run test:e2e      # End-to-end tests (Playwright)
npm run test:all      # All tests
npm run coverage      # Coverage report
npm run typecheck     # TypeScript type checking
npm run lint          # ESLint
```

### Project Structure

```
src/
├── app/                 # Next.js App Router (pages + API routes)
│   ├── [locale]/        # i18n locale routing (en, fr, de, es, it, nl, pt)
│   └── api/             # API routes: initiate, scan, detonate, counter, donate
├── components/          # React components
│   ├── manifesto/       # Landing page — manifesto text, input form
│   ├── detonator/       # Scan → Review → Detonate → Complete flow
│   ├── layout/          # Footer, counter, scanline overlay
│   └── ui/              # Mute toggle, language switcher
├── lib/                 # Core logic
│   ├── email/           # Resend client, templates, deletion request generators
│   ├── pdf/             # PDF report generation
│   ├── jwt.ts           # Encrypted JWT tokens (stateless auth)
│   ├── hibp.ts          # Have I Been Pwned API client
│   ├── rate-limit.ts    # In-memory rate limiting
│   └── scanner.ts       # Account discovery orchestration
├── data/
│   └── services/        # Curated service database (JSON + TypeScript schema)
├── hooks/               # useAudio, useDetonation, useScan
└── i18n/                # next-intl config + 7 language files
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

The easiest way to contribute is **adding services to the deletion database**. Every service you add helps someone disappear.

### Adding a Service

1. Fork the repo and create a branch: `feat/add-service-servicename`
2. Add an entry to the appropriate JSON file in `src/data/services/`
3. Follow the `ServiceEntry` schema in `src/data/services/schema.ts`
4. Example entry:

```json
{
  "id": "example-broker",
  "name": "Example Data Broker",
  "domain": "examplebroker.com",
  "category": "data-broker",
  "icon": "EB",
  "hibpBreachNames": [],
  "deletionMethod": "auto-email",
  "deletionDifficulty": "easy",
  "dpoEmail": "privacy@examplebroker.com",
  "gdprApplicable": true,
  "ccpaApplicable": true,
  "expectedResponseDays": 30,
  "resistsRequests": false,
  "relistsAfterRemoval": true,
  "requiresIdentityVerification": false,
  "notes": "Re-lists profiles within 60 days from public records.",
  "lastVerified": "2026-03-30"
}
```

5. Run `npm run typecheck && npm run lint && npm run test`
6. Submit a PR

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Animations | Framer Motion + GSAP |
| Sound | Tone.js |
| Email | Resend |
| PDF | @react-pdf/renderer |
| Account Discovery | HIBP API + curated JSON database |
| Bot Prevention | Cloudflare Turnstile |
| Donations | Stripe |
| i18n | next-intl (7 languages) |
| Testing | Vitest + React Testing Library + Playwright |
| CI/CD | GitHub Actions + Vercel |
| License | MIT |

## Privacy

DEINDEX.ME stores nothing. No database. No cookies. No session state. No analytics that track individuals.

User data exists in the browser during the session and in an encrypted JWT during email verification (expires in 1 hour). After the PDF report is emailed, all data is purged. The only persistent storage is a single integer: the count of deletion requests sent.

We do not track you. We do not profile you. We do not sell you. We help you disappear, and then we forget you.

## License

MIT — see [LICENSE](LICENSE)

## Support
Feel free to [reach out to me](https://www.linkedin.com/in/trentmaziarz/) directly
This project is free forever. If it helped you, consider [donating](https://deindex.me/donate) to keep it running.

Found a bug? Open an issue on the [GitHub repository](https://github.com/trentmaziarz/escape-will-make-me-god/issues).
