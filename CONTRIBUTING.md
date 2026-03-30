# Contributing to DEINDEX.ME

Thank you for helping people disappear from the internet.

## Ways to Contribute

### 1. Add Services to the Deletion Database (Easiest)

The service database is how we know where to send deletion requests. Every entry you add directly helps someone erase their digital footprint.

**How:**

1. Fork the repo and create a branch: `feat/add-service-servicename`
2. Find the right JSON file in `src/data/services/` (or create a new category file)
3. Add an entry matching the `ServiceEntry` schema (see [Service Database Entry Format](#service-database-entry-format) below)
4. Verify your entry:
   - `deletionMethod` is accurate — test the deletion endpoint/email yourself if possible
   - `dpoEmail` or `deletionUrl` is current and working
   - `lastVerified` is today's date
5. Run `npm run typecheck && npm run lint && npm run test`
6. Submit a PR with the service name in the title

### 2. Improve Deletion Templates

GDPR and CCPA deletion request templates live in `src/lib/email/deletion-requests/`. You can:

- Improve the legal language in existing templates
- Add service-specific template overrides for companies that require particular wording
- Add templates for additional legal frameworks (e.g., LGPD for Brazil, PIPEDA for Canada)

Legal text changes should cite the relevant regulation articles.

### 3. Translate the UI

Translation files live in `src/i18n/messages/`. We support English, French, German, Spanish, Italian, Dutch, and Portuguese.

- `en.json` is the source of truth — all other files must have the same keys
- UI labels can be translated directly
- Manifesto text should be **creatively translated** — the feeling matters more than word-for-word accuracy
- Legal text (consent copy, privacy policy) is flagged `_LEGAL_REVIEW_REQUIRED` — do not translate these without legal review

To add a new language, create a new JSON file and update `src/i18n/config.ts`.

### 4. Report Bugs

Open an issue with:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser and OS version (for UI bugs)
- Screenshots if applicable

Do not include real email addresses or personal data in bug reports.

### 5. Contribute Code

See the [Development Setup](#development-setup) and [Code Standards](#code-standards) sections below. Good first issues are labeled in the issue tracker.

## Development Setup

```bash
git clone https://github.com/<your-fork>/deindex.me.git
cd deindex.me
npm install
cp .env.example .env.local
# At minimum, set JWT_SECRET to any random string. See README for full env guide.
npm run dev
```

See the [README](README.md) for prerequisites and detailed setup instructions.

## Code Standards

- **TypeScript strict mode** — no `any` types except in rare, documented cases
- **Server Components by default** — client components only when needed for interactivity
- **Tailwind CSS** — no inline styles in production code
- **Conventional commits** — `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`
- **Dark theme only** — no light mode
- **Stateless architecture** — no database, no sessions, no cookies. If you find yourself reaching for persistent storage, reconsider — the only allowed persistent state is a single counter integer

## Service Database Entry Format

Every service in the deletion database conforms to the `ServiceEntry` interface defined in `src/data/services/schema.ts`.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier, lowercase, hyphenated (e.g., `"example-broker"`) |
| `name` | string | Display name of the service |
| `domain` | string | Primary domain (e.g., `"facebook.com"`) |
| `category` | enum | One of: `social-media`, `data-broker`, `big-tech`, `shopping`, `ad-network`, `other` |
| `icon` | string | 2-3 character abbreviation for UI display |
| `hibpBreachNames` | string[] | Matching breach names from Have I Been Pwned (empty array if none) |
| `deletionMethod` | enum | `auto-api`, `auto-email`, `user-email`, or `manual-guide` |
| `deletionDifficulty` | enum | `auto`, `easy`, `medium`, or `hard` |
| `gdprApplicable` | boolean | Whether GDPR deletion requests apply |
| `ccpaApplicable` | boolean | Whether CCPA deletion requests apply |
| `expectedResponseDays` | number | Expected days for the service to respond (typically 30 for GDPR) |
| `resistsRequests` | boolean | Whether the service is known to resist or delay deletion requests |
| `relistsAfterRemoval` | boolean | Whether the service re-lists data after removal (common with data brokers) |
| `requiresIdentityVerification` | boolean | Whether the service requires ID verification before deletion |
| `lastVerified` | string | ISO date when the entry was last verified (e.g., `"2026-03-30"`) |

### Optional Fields

| Field | Type | When Required |
|-------|------|---------------|
| `autoDeleteEndpoint` | string | When `deletionMethod` is `auto-api` |
| `autoDeleteMethod` | `POST` \| `GET` \| `DELETE` | When `deletionMethod` is `auto-api` |
| `autoDeletePayload` | object | When `deletionMethod` is `auto-api` |
| `dpoEmail` | string | When `deletionMethod` is `auto-email` or `user-email` |
| `deletionEmail` | string | Alternative contact email for deletion requests |
| `manualSteps` | string[] | When `deletionMethod` is `manual-guide` |
| `deletionUrl` | string | Direct link to the service's account deletion page |
| `templateOverride` | string | Custom template ID if the standard GDPR/CCPA template doesn't apply |
| `notes` | string | Human-readable notes about quirks or gotchas |

### Example Entry

```json
{
  "id": "spokeo",
  "name": "Spokeo",
  "domain": "spokeo.com",
  "category": "data-broker",
  "icon": "SP",
  "hibpBreachNames": ["Spokeo"],
  "deletionMethod": "auto-email",
  "deletionDifficulty": "easy",
  "dpoEmail": "privacy@spokeo.com",
  "deletionUrl": "https://www.spokeo.com/optout",
  "gdprApplicable": false,
  "ccpaApplicable": true,
  "expectedResponseDays": 15,
  "resistsRequests": false,
  "relistsAfterRemoval": true,
  "requiresIdentityVerification": false,
  "notes": "Re-lists profiles from public records within 30-60 days. Users may need to repeat the opt-out process.",
  "lastVerified": "2026-03-30"
}
```

### Deletion Method Guide

- **`auto-api`** — The service has a public API endpoint for deletion. We call it automatically. Requires `autoDeleteEndpoint`.
- **`auto-email`** — We send a GDPR/CCPA deletion email on the user's behalf. Requires `dpoEmail`.
- **`user-email`** — We generate a pre-filled email draft for the user to send themselves (for services that verify sender identity). Requires `dpoEmail`.
- **`manual-guide`** — The service requires the user to log in and follow steps. Requires `manualSteps`.

## Pull Request Process

1. Fork the repo
2. Create a feature branch (`feat/add-service-xyz`, `fix/scan-timeout`, etc.)
3. Make your changes
4. Run all checks:
   ```bash
   npm run typecheck && npm run lint && npm run test
   ```
5. All checks must pass
6. Submit a PR with a clear description of what changed and why
7. Wait for review — we'll respond as fast as we can

## Code of Conduct

This project exists to help people reclaim their privacy. Treat every contributor, user, and community member with respect. Harassment, discrimination, and bad-faith behavior have no place here. Be kind, be constructive, be professional.
