# lead-qualify monorepo

Monorepo built with pnpm + Turborepo.

## Apps

- `apps/api` - NestJS API + Prisma + BullMQ + grammY webhook endpoint
- `apps/web` - Next.js App Router admin panel (Tailwind + shadcn/ui-style components)

## Packages

- `packages/shared` - shared DTO/types and security helpers (`encryptPII`, `decryptPII`, PII masking)
- `packages/bot-core` - LLM extraction orchestrator, Telegram bot runtime, scoring/status logic

## Infra

- `infra/docker-compose.yml` - local PostgreSQL + Redis
- `infra/Dockerfile.api` - API container
- `infra/Dockerfile.web` - Web container
- `.env.example` - full env configuration template

## Commands

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm db:migrate`
- `pnpm db:deploy`
- `pnpm db:seed`
