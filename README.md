# Lead Qualify MVP (Telegram + LLM)

Цель: повысить долю квалифицированных лидов $Qualified\ Rate$ с помощью LLM-квалификации в Telegram, гибких схем и лёгкой CRM.

Быстрый старт:
1) Скопируйте `.env.example` в `.env` (локально) или задайте переменные в Railway.
2) Примените миграции: `pnpm --filter apps/api exec prisma migrate deploy`.
3) `pnpm --filter apps/api exec prisma db seed`.
4) Установите Telegram webhook (см. docs/PROJECT_OVERVIEW.md).

Документация:
- docs/PROJECT_OVERVIEW.md — обзор, статусы, причины, ниши
- docs/TECH_SPEC.md — подробное ТЗ
- docs/ITERATION_PLAN.md — итерации и критерия приёмки
- docs/ITERATION_STATUS.json — статус итераций (оркестрация)
- docs/CURSOR_PROMPTS.md — промпты для Cursor
- docs/SECURITY_PDN.md — безопасность и ПДн (РБ)
- docs/db/001_init.sql — DDL (референс)
- apps/api/openapi.yaml — API контракт (черновик)
