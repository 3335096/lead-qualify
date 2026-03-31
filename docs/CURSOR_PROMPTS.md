# Промпты для Cursor

## Bootstrapping Prompt
<вставь из корневого документа Bootstrapping Prompt>

## Docs Seed Prompt
<текущий документ>

## Tech Spec Prompt
См. `docs/TECH_SPEC.md` генерацию ниже.

## Iteration Orchestrator Prompt
См. файл `docs/ITERATION_ORCHESTRATOR_PROMPT.txt`.

## Iteration-specific Prompts
- И1: Bootstrap — каркас, Prisma, миграции, webhook
- И2: LLM Orchestrator — `/v1/llm/extract`, tool-calling, unit-тесты
- И3: Schemas & Dictionaries — CRUD, Monaco Editor, Sheets sync
- И4: CRM Inbox — UI/реалтайм, статусы+причины, ответы в TG
- И5: SLA Daemon — таймеры, напоминания, автозакрытия
- И6: Outbound & Dashboard — маппинг, ретраи, DLQ, метрики
- И7: Polish & Security — маскирование, аудит, OpenAPI, seed

## Переменные окружения
Смотри `.env.example`.
