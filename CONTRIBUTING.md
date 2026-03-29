# Contributing to DEINDEX.ME

Thank you for your interest in contributing.

## Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in values
3. Run `npm install`
4. Run `npm run dev`

## Code Standards

- TypeScript strict mode
- Conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`)
- All tests must pass before submitting a PR

## Pull Requests

- One feature per branch
- PRs must pass CI (typecheck + lint + test) before merge
- Never commit secrets or `.env.local`
