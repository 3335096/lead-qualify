# Техническое задание (MVP)

1. Цель и метрики
- Главная метрика: $Qualified\ Rate$.
- Поддерживающие: $T_{first}$, $T_{qual}$, $AutoQ\ Rate$, $SLA\_breach$.

2. Область и допущения
- Гео: РБ; ПДн на Railway (MVP) с шифрованием; миграция в РБ после MVP.
- Канал: Telegram; LLM: OpenRouter; язык: RU.

3. Пользовательские сценарии
- Клиент пишет в Telegram → LLM собирает обязательные поля → скоринг → лидер попадает в CRM → менеджер отвечает или автоматическая отправка по API.
- Админ настраивает схему, словари (в т.ч. Google Sheets), SLA, outbound.

4. Нефункциональные требования
- Производительность: шаг бота < 2 c, inbox обновление < 500 мс.
- Доступность: $99.5\%$.
- Безопасность: AES-GCM PII, маскирование логов, RBAC.

5. Архитектура
- Модульный монолит NestJS; Next.js фронт; PostgreSQL; Redis; BullMQ; grammY; OpenRouter.

6. Модель данных (ссылка: docs/db/001_init.sql)
- Ключевые сущности: workspace, app_user, contact, lead, conversation, message, qualification_schema, dictionary, dictionary_item, outbound_integration, job_queue.

7. API (OpenAPI см. `apps/api/openapi.yaml`)
- Важные эндпоинты:
  - `POST /v1/bot/telegram/webhook`
  - `POST /v1/llm/extract`
  - `POST /v1/qualification/score`
  - CRUD: schemas, dictionaries (+/sync), outbound (+/test), leads (+status/notes/messages), metrics/summary

8. LLM оркестрация
- Функция: `extractQualification(schema, history, message, dictionaries)`.
- Возврат: `{ filled, missing, confidence, suggest_questions, coverage }`.
- Покрытие: $coverage=\frac{\#filled\ required}{\#required}$; порог $0.8$.
- Скоринг: $score=\sum w_i x_i$, порог $40$.

9. SLA логика
- $T_{first}=3$ мин — напоминание, эскалация.
- $T_{inactivity}=24$ ч — мягкое напоминание, автозакрытие `no_answer/abandoned_timeout`.

10. Статусы/причины
- Статусы (enum): new, in_qualification, awaiting_client, awaiting_operator, qualified, in_contact, won, not_target, no_answer, duplicate, spam_test, lost.
- Причины — фиксированный словарь (см. `docs/REASON_DICTIONARY.json`).

11. Дашборд
- Виджеты: $Qualified\ Rate$, $T_{first}$, $T_{qual}$, $AutoQ\ Rate$, $SLA\_breach$.
- Срезы: по нишам, источникам, очередям (в будущем).

12. Тест-план
- E2E: быстрый кейс, нецелевая услуга, молчание клиента, дубль, outbound 5xx.
- Unit: coverage/score, словари, статусы/причины.
- Security: шифрование PII, отсутствие PII в логах.

13. Критерии приёмки по итерациям
- См. `docs/ITERATION_PLAN.md`.
