# TECH_SPEC.md — Техническое задание (MVP)

---

## Содержание

- [1) Scope и цели](#1-scope-и-цели)
- [2) Персоны и сценарии](#2-персоны-и-сценарии)
- [3) Архитектура и потоки данных](#3-архитектура-и-потоки-данных)
- [4) БД: ключевые таблицы и связи](#4-бд-ключевые-таблицы-и-связи)
- [5) API контракты](#5-api-контракты)
- [6) LLM: промпты, tool schema, переспрашивание и фоллбеки](#6-llm-промпты-tool-schema-переспрашивание-и-фоллбеки)
- [7) Скоринг: DSL `when`, безопасность, примеры](#7-скоринг-dsl-when-безопасность-примеры)
- [8) SLA: тайминги, сообщения, статусы](#8-sla-тайминги-сообщения-статусы)
- [9) Outbound: `$path`, ретраи, DLQ, конфиги](#9-outbound-path-ретраи-dlq-конфиги)
- [10) UI: макеты и состояния страниц](#10-ui-макеты-и-состояния-страниц)
- [11) Безопасность и ПДн](#11-безопасность-и-пдн)
- [12) Тест-план и критерии приемки](#12-тест-план-и-критерии-приемки)
- [13) План развертывания Railway + Telegram webhook](#13-план-развертывания-railway--telegram-webhook)
- [14) Риски и Post-MVP](#14-риски-и-post-mvp)
- [Приложение A: JSON-схемы ниш](#приложение-a-json-схемы-ниш)
- [Приложение B: SQL примеры метрик](#приложение-b-sql-примеры-метрик)

---

## 1) Scope и цели

### 1.1 Scope MVP

MVP покрывает:
- Входящий канал: Telegram.
- Автоквалификацию лида через LLM по настраиваемой схеме.
- Скоринг на базе правил (`when`).
- Очередь операторов (Inbox), карточку лида, статусы и причины.
- Outbound webhooks/API в сторонние CRM.
- SLA-контроль и автоматические действия при просрочках.
- Базовую аналитику и дашборд.

Вне scope MVP:
- Мультиканальность (WhatsApp, VK, webchat).
- Полноценный BI-конструктор и кастомные ETL.
- Сложная маршрутизация по skill-based queues.

### 1.2 Бизнес-цели

1. Увеличить долю лидов, доведенных до квалификации.
2. Сократить время первой реакции.
3. Снизить ручную нагрузку на операторов за счет автосбора данных.
4. Обеспечить контроль SLA и прозрачную воронку.

### 1.3 KPI и метрики

- $Qualified\ Rate = \frac{\#qualified}{\#all\_new\_leads}$  
  Целевая метрика в MVP: рост относительно baseline.

- $T_{first}$  
  Время от первого входящего сообщения лида до первого осмысленного ответа системы/оператора.

- $T_{qual}$  
  Время от первого сообщения лида до присвоения статуса `qualified` или финального негативного статуса.

- $AutoQ\ Rate = \frac{\#qualified\_without\_human\_message}{\#qualified}$  
  Доля лидов, квалифицированных без участия оператора.

- $SLA\_breach = \frac{\#leads\_with\_sla\_violation}{\#active\_leads}$  
  Доля лидов с нарушением SLA.

### 1.4 Ограничения и допущения

- Гео/регуляторика: хранение ПДн в зашифрованном виде, аудит доступа.
- Канал уведомлений операторов: веб-интерфейс (MVP), опционально Telegram-алерты.
- Язык диалогов: RU (возможность расширения на EN после MVP).

---

## 2) Персоны и сценарии

### 2.1 Клиент (lead/contact)

Цели:
- Быстро получить ответ.
- Понять, подходит ли услуга под запрос.
- Передать только необходимые данные.

Сценарии:
1. Пишет в Telegram с запросом.
2. Отвечает на уточняющие вопросы бота.
3. Получает подтверждение квалификации и дальнейший шаг.
4. При пропаже активности получает напоминание.

### 2.2 Админ

Цели:
- Настроить квалификационные схемы и словари.
- Управлять SLA, правилами скоринга, outbound-интеграциями.
- Контролировать безопасность и доступы.

Сценарии:
1. Создает/редактирует схему ниши.
2. Подключает словари (ручные/из внешних таблиц).
3. Настраивает правила `when` и пороги.
4. Настраивает outbound endpoint и bodyMap.
5. Проверяет статусы очередей, DLQ и аудит.

### 2.3 Менеджер (оператор)

Цели:
- Быстро обрабатывать лиды из Inbox.
- Видеть контекст и рекомендации.
- Соблюдать SLA и фиксировать причины.

Сценарии:
1. Берет лид в работу из Inbox.
2. Видит заполненные поля/пробелы по квалификации.
3. Отправляет сообщение клиенту или подтверждает автосообщение.
4. Переводит лид в целевой статус с причиной.

---

## 3) Архитектура и потоки данных

### 3.1 Компонентная диаграмма (текстом)

```text
[Telegram User]
     |
     v
[Telegram Bot Adapter (grammY)]
     |
     v
[API Gateway / NestJS]
  |        |          |           |
  |        |          |           +--> [Outbound Service] --> [External CRM/API]
  |        |          |
  |        |          +--> [SLA Service + Scheduler/BullMQ]
  |        |
  |        +--> [LLM Orchestrator] --> [OpenRouter LLM]
  |
  +--> [Qualification Engine + Scoring DSL]
             |
             +--> [PostgreSQL (Prisma)]
             +--> [Redis (queues/cache)]

[Next.js Admin UI] <--> [API Gateway / NestJS]
```

### 3.2 Основные потоки данных

1. **Inbound message flow**
   - Telegram webhook -> Bot Adapter -> API.
   - Сообщение нормализуется, сохраняется в `message`.
   - LLM извлекает поля + список `missing`.
   - Если покрытие недостаточно: формируется follow-up вопрос.
   - При достижении порога: запускается скоринг и смена статуса.

2. **Qualification/Scoring flow**
   - Аггрегируются ответы и словарные совпадения.
   - Выполняются правила `when`.
   - Считаются баллы и классификация (`qualified`/`not_target`/...).

3. **SLA flow**
   - Таймеры стартуют на событиях (`lead_created`, `awaiting_operator`, ...).
   - Планировщик проверяет дедлайны.
   - При нарушении -> системное событие, уведомление, изменение статуса.

4. **Outbound flow**
   - На событии (`lead.qualified`, `lead.won`, ...) формируется payload из `bodyMap`.
   - Отправка с retry policy.
   - После лимита попыток -> DLQ + алерт админу.

---

## 4) БД: ключевые таблицы и связи

### 4.1 Источник схемы БД

- Prisma: `apps/api/prisma/schema.prisma`
- DDL: `docs/db/001_init.sql`

### 4.2 Ключевые таблицы (MVP)

- `workspace` — изоляция тенантов.
- `app_user` — админы/менеджеры, роли, настройки.
- `contact` — клиентские контактные данные (PII).
- `lead` — сущность лида, статусы, причины, SLA поля.
- `conversation` — канал/чат/тред.
- `message` — сообщения клиента, оператора, системные.
- `qualification_schema` — JSON-схема полей для ниши.
- `dictionary` / `dictionary_item` — словари нормализации.
- `scoring_rule` — правила `when` и веса/действия.
- `outbound_integration` — endpoint, auth, mapping, retry config.
- `outbound_delivery` — попытки отправки, коды ответов, ошибка.
- `sla_policy` / `sla_event` — политика SLA и фиксация нарушений.
- `audit_log` — журнал доступа/действий.

### 4.3 Связи (укрупненно)

```text
workspace 1--* app_user
workspace 1--* lead
contact 1--* lead
lead 1--1 conversation
conversation 1--* message
workspace 1--* qualification_schema
qualification_schema 1--* scoring_rule
workspace 1--* outbound_integration
lead 1--* outbound_delivery
workspace 1--* sla_policy
lead 1--* sla_event
workspace 1--* audit_log
```

---

## 5) API контракты

> OpenAPI-источник: `apps/api/openapi.yaml` (при наличии), фактическая реализация — NestJS controllers.

### 5.1 Webhook ingress

#### `POST /v1/bot/telegram/webhook`

Request (пример, фрагмент Telegram update):
```json
{
  "update_id": 10000,
  "message": {
    "message_id": 1365,
    "date": 1711785600,
    "text": "Нужен ремонт стиралки, не сливает воду",
    "from": { "id": 123456, "first_name": "Ivan" },
    "chat": { "id": 123456, "type": "private" }
  }
}
```

Response:
```json
{ "ok": true }
```

Ошибки:
- `400 INVALID_TELEGRAM_UPDATE`
- `401 INVALID_WEBHOOK_SIGNATURE` (если включена подпись)
- `500 INTERNAL_ERROR`

### 5.2 LLM extraction

#### `POST /v1/llm/extract`

Request:
```json
{
  "schemaId": "sch_appliance_v1",
  "leadId": "lead_01H...",
  "message": "Сломалась посудомойка Bosch, Минск, после 18:00",
  "history": [],
  "dictionaries": ["brands", "cities"]
}
```

Response:
```json
{
  "filled": {
    "device_type": "dishwasher",
    "brand": "Bosch",
    "city": "Minsk",
    "preferred_time": "after_18"
  },
  "missing": ["issue_type", "contact_phone"],
  "confidence": 0.87,
  "suggest_questions": [
    "Опишите, пожалуйста, проблему подробнее.",
    "Оставьте контактный номер для связи."
  ],
  "coverage": 0.67
}
```

Ошибки:
- `422 SCHEMA_NOT_FOUND`
- `422 INVALID_SCHEMA_VERSION`
- `429 LLM_RATE_LIMIT`
- `503 LLM_PROVIDER_UNAVAILABLE`

### 5.3 Scoring

#### `POST /v1/qualification/score`

Request:
```json
{
  "leadId": "lead_01H...",
  "schemaId": "sch_appliance_v1",
  "facts": {
    "city": "Minsk",
    "device_type": "washer",
    "budget": 150
  }
}
```

Response:
```json
{
  "score": 55,
  "decision": "qualified",
  "matchedRules": ["r_city_supported", "r_device_supported", "r_budget_ok"],
  "unmatchedRules": ["r_blacklist_phone"]
}
```

Ошибки:
- `404 LEAD_NOT_FOUND`
- `422 FACT_VALIDATION_ERROR`
- `500 SCORING_RUNTIME_ERROR`

### 5.4 Lead lifecycle

- `GET /v1/leads?status=in_qualification&limit=50`
- `GET /v1/leads/{leadId}`
- `POST /v1/leads/{leadId}/status`
- `POST /v1/leads/{leadId}/messages`
- `POST /v1/leads/{leadId}/notes`

Коды ошибок (общие):
- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`
- `404 NOT_FOUND`
- `409 CONFLICT`
- `422 UNPROCESSABLE_ENTITY`
- `429 TOO_MANY_REQUESTS`
- `500 INTERNAL_ERROR`

---

## 6) LLM: промпты, tool schema, переспрашивание и фоллбеки

### 6.1 Системный промпт (базовый шаблон)

```text
Ты — ассистент квалификации лидов. Твоя задача:
1) Извлекать только факты из сообщения клиента и контекста диалога.
2) Заполнять поля строго по JSON-схеме ниши.
3) Не выдумывать значения и не подменять отсутствующие данные.
4) Если данных не хватает, формировать короткие, вежливые уточняющие вопросы (1-2 за шаг).
5) Соблюдать язык клиента (по умолчанию RU).

Возвращай JSON формата:
{
  "filled": {...},
  "missing": [...],
  "confidence": 0..1,
  "suggest_questions": [...],
  "coverage": 0..1
}
```

### 6.2 Tool schema (function calling)

```json
{
  "name": "extractQualification",
  "description": "Extract required fields for lead qualification",
  "parameters": {
    "type": "object",
    "properties": {
      "filled": { "type": "object", "additionalProperties": true },
      "missing": { "type": "array", "items": { "type": "string" } },
      "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
      "suggest_questions": { "type": "array", "items": { "type": "string" } },
      "coverage": { "type": "number", "minimum": 0, "maximum": 1 }
    },
    "required": ["filled", "missing", "confidence", "suggest_questions", "coverage"]
  }
}
```

### 6.3 Стратегия переспрашивания

Правила:
1. При `coverage < requiredCoverage` задаем только приоритетные missing-поля.
2. Не более 2 вопросов в одном сообщении.
3. Сначала обязательные поля, потом полезные.
4. Если вопрос уже задавался 2 раза без ответа — предложить быстрые кнопки.
5. Если клиент не отвечает по SLA, запускать мягкое напоминание.

### 6.4 Фоллбек-кнопки

Примеры:
- `Продолжить позже`
- `Связаться с оператором`
- `Не подходит услуга`
- `Уточнить стоимость`

Fallback-логика:
- При `LLM_PROVIDER_UNAVAILABLE` отправить шаблонное сообщение + кнопки.
- При низкой уверенности (`confidence < 0.45`) предложить операторский takeover.

---

## 7) Скоринг: DSL `when`, безопасность, примеры

### 7.1 Синтаксис `when` (ограниченный DSL)

Пример грамматики (концептуально):
```text
expr        := or_expr
or_expr     := and_expr ("OR" and_expr)*
and_expr    := unary_expr ("AND" unary_expr)*
unary_expr  := "NOT" unary_expr | primary
primary     := comparison | "(" expr ")"
comparison  := field op value
op          := "==" | "!=" | ">" | "<" | ">=" | "<=" | "IN" | "MATCHES"
```

### 7.2 Модель правила

```json
{
  "id": "r_city_supported",
  "when": "city IN ['Minsk','Gomel'] AND service_type == 'repair'",
  "scoreDelta": 20,
  "decisionTag": "geo_supported",
  "stopProcessing": false
}
```

### 7.3 Безопасность DSL

- Только белый список операторов и типов.
- Парсинг в AST без `eval`.
- Ограничение длины выражения и глубины AST.
- Таймаут исполнения одного правила.
- Логи ошибок без утечки PII.
- Версионирование правил и audit trail изменений.

### 7.4 Примеры правил

```json
[
  {
    "id": "r_budget_min",
    "when": "budget >= 80",
    "scoreDelta": 10
  },
  {
    "id": "r_not_target_city",
    "when": "city NOT IN ['Minsk','Grodno']",
    "scoreDelta": -50,
    "decisionTag": "not_target",
    "stopProcessing": true
  },
  {
    "id": "r_blacklist",
    "when": "phone MATCHES '^\\+375(29|33|44)000'",
    "scoreDelta": -100,
    "decisionTag": "spam_test",
    "stopProcessing": true
  }
]
```

---

## 8) SLA: тайминги, сообщения, статусы

### 8.1 Тайминги MVP

- `T_first_warning`: 2 мин
- `T_first_breach`: 3 мин
- `T_inactivity_warning`: 23 ч
- `T_inactivity_breach`: 24 ч
- `T_qualification_soft_limit`: 30 мин
- `T_qualification_hard_limit`: 2 ч

### 8.2 Системные сообщения

- При warning первого ответа:
  - "Мы получили ваше сообщение, скоро ответим."
- При breach первого ответа:
  - "Извините за задержку. Передаю диалог специалисту."
- При inactivity warning:
  - "Если вопрос еще актуален, ответьте одним сообщением."
- При inactivity breach:
  - "Закрываем обращение из-за отсутствия ответа. Можно вернуться в любой момент."

### 8.3 Статусы при нарушениях

- `awaiting_operator` + `sla_warning`
- `awaiting_operator` + `sla_breach_first_response`
- `awaiting_client` + `sla_warning_inactivity`
- `no_answer` + reason `abandoned_timeout`

---

## 9) Outbound: `$path`, ретраи, DLQ, конфиги

### 9.1 Принцип маппинга `$path`

`$path` указывает на источник данных в контексте:
- `$lead.*` — поля лида
- `$contact.*` — поля контакта
- `$qualification.*` — извлеченные поля квалификации
- `$meta.*` — тех.мета (timestamps, source, workspaceId)

### 9.2 Пример `bodyMap`

```json
{
  "externalLeadId": { "$path": "$lead.id" },
  "createdAt": { "$path": "$lead.createdAt" },
  "source": { "$path": "$lead.source", "default": "telegram" },
  "customer": {
    "name": { "$path": "$contact.name", "default": "Не указано" },
    "phone": { "$path": "$contact.phoneMasked" }
  },
  "qualification": {
    "city": { "$path": "$qualification.city" },
    "serviceType": { "$path": "$qualification.service_type" },
    "score": { "$path": "$lead.score", "default": 0 }
  },
  "meta": {
    "workspaceId": { "$path": "$meta.workspaceId" },
    "event": { "$path": "$meta.eventName" }
  }
}
```

### 9.3 Retry policy

- Retryable: `408`, `429`, `5xx`, network timeout.
- Не retryable: `400`, `401`, `403`, `404`, `422`.
- Backoff: exponential + jitter.
- Пример: `10s, 30s, 2m, 10m, 30m` (max 5 попыток).

### 9.4 DLQ

Условия попадания:
- исчерпаны retries;
- невалидный payload после сериализации;
- фатальная ошибка подписи/auth.

Для каждого события в DLQ хранить:
- `leadId`, `integrationId`, `eventName`
- `payload_snapshot`, `http_status`, `error_code`, `attempt_count`
- `next_action` (`manual_retry`/`discard`)

### 9.5 Примеры конфигов outbound

```yaml
integrations:
  - id: crm_primary
    endpoint: https://crm.example.com/api/v1/leads
    method: POST
    headers:
      Authorization: "Bearer ${CRM_TOKEN}"
      Content-Type: application/json
    eventFilter:
      - lead.qualified
      - lead.won
    timeoutMs: 7000
    retry:
      maxAttempts: 5
      schedule: [10s, 30s, 2m, 10m, 30m]
      retryOn: [408, 429, 500, 502, 503, 504]
    dlq:
      enabled: true
      queue: outbound-dlq
```

---

## 10) UI: макеты и состояния страниц

### 10.1 Inbox

Макет:
```text
+----------------------+-------------------------------+----------------------+
| Список лидов         | Диалог                        | Карточка лида        |
| [filters/status/SLA] | [messages timeline]           | [fields + score]     |
| lead #1 (new)        | client: ...                   | missing: city,phone  |
| lead #2 (breach)     | bot: ...                      | buttons: qualify/... |
+----------------------+-------------------------------+----------------------+
```

Состояния:
- loading, empty, error
- new message highlight
- SLA warning/breach badges
- optimistic update при отправке сообщения

### 10.2 Leads

Макет:
```text
[Search][Filters][Export]
| ID | Client | Status | Score | T_first | UpdatedAt | Owner |
```

Состояния:
- таблица с пагинацией
- bulk action (смена статуса/причины)
- пустой результат фильтра

### 10.3 Dashboard

Виджеты:
- $Qualified\ Rate$ (день/неделя)
- средний $T_{first}$
- средний $T_{qual}$
- $AutoQ\ Rate$
- $SLA\_breach$
- Топ причин потерь (`not_target`, `no_answer`, ...)

Состояния:
- skeleton loading
- no data period
- timezone hint

### 10.4 Settings*

Подразделы:
1. `Settings > Qualification` — схемы ниши, required поля, версии.
2. `Settings > Dictionaries` — словари, sync, ревизии.
3. `Settings > Scoring` — правила `when`, dry-run на примере лида.
4. `Settings > SLA` — тайминги и шаблоны сообщений.
5. `Settings > Outbound` — endpoint, bodyMap, тест вызова.
6. `Settings > Security` — роли, ключи шифрования, retention.

---

## 11) Безопасность и ПДн

### 11.1 Шифрование

- At-rest: AES-256-GCM для полей PII (`phone`, `name`, `address`).
- In-transit: TLS 1.2+ между всеми компонентами.
- Ключи: через переменные окружения/секрет-хранилище, с ротацией.

### 11.2 Маскирование

- Логи: маскировать телефон/ФИО/адрес.
- UI: частичная маска телефона для ролей без full-access.
- Error traces: без сырых пользовательских данных.

### 11.3 Retention

- Сообщения и лиды: retention policy по workspace (например, 365 дней).
- Audit logs: дольше бизнес-данных (например, 540 дней).
- Soft delete + плановая очистка.

### 11.4 Аудит

Фиксировать:
- вход в систему, смену роли, просмотр PII;
- изменение схем/правил/интеграций;
- ручные retries DLQ;
- экспорт данных.

---

## 12) Тест-план и критерии приемки

### 12.1 E2E

Минимальный набор:
1. Полный happy-path до `qualified`.
2. Нецелевая услуга -> `not_target`.
3. Нет ответа клиента -> `no_answer` по SLA.
4. Outbound 5xx -> retries -> success.
5. Outbound постоянный fail -> DLQ.
6. Вмешательство оператора в середине автоквалификации.

### 12.2 Unit

- Парсер/валидатор DSL `when`.
- Scoring engine (границы порогов).
- Coverage/missing logic.
- BodyMap resolver (`$path`, `default`, вложенные объекты).
- SLA scheduler transitions.

### 12.3 Security

- Тест шифрования PII в БД.
- Проверка маскирования логов.
- Тест RBAC (админ/менеджер/readonly).
- Проверка webhook signature и защиты от replay.

### 12.4 Нагрузочные

- Inbound: burst X сообщений/сек на webhook.
- Одновременная квалификация Y активных диалогов.
- Outbound: очередь Z событий/минуту.
- SLA scan latency в пределах установленного окна.

### 12.5 Критерии приемки по итерациям

- **Iteration 1 (Core Inbound + LLM)**  
  Входящие сообщения стабильно принимаются и квалифицируются по базовой схеме.

- **Iteration 2 (Scoring + Statuses + Inbox)**  
  Правила `when` применяются корректно, оператор работает через Inbox.

- **Iteration 3 (SLA + Outbound + Dashboard)**  
  SLA-нарушения фиксируются, outbound работает с retry/DLQ, базовый dashboard доступен.

- **Iteration 4 (Security hardening + polish)**  
  Выполнены security checks, аудит и retention, снижены критические риски.

---

## 13) План развертывания Railway + Telegram webhook

### 13.1 Подготовка Railway

1. Создать проект (API + Web + Postgres + Redis).
2. Настроить переменные окружения:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `OPENROUTER_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_WEBHOOK_SECRET`
   - `ENCRYPTION_MASTER_KEY`
3. Запустить миграции Prisma/DDL.
4. Настроить health checks (`/healthz`).

### 13.2 Deploy шаги

1. `railway up`/автодеплой из Git.
2. Проверить доступность API URL.
3. Проверить подключение Web UI к API.
4. Выполнить smoke tests (`/healthz`, тест inbound, тест outbound).

### 13.3 Установка Telegram webhook

Пример:
```bash
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://<api-domain>/v1/bot/telegram/webhook",
    "secret_token": "'${TELEGRAM_WEBHOOK_SECRET}'"
  }'
```

Проверка:
```bash
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
```

Rollback:
- вернуть предыдущий release в Railway;
- при необходимости `deleteWebhook` и повторная регистрация.

---

## 14) Риски и Post-MVP

### 14.1 Ключевые риски

1. Нестабильность LLM-провайдера -> рост latency/ошибок.
2. Некачественные схемы ниши -> низкий `coverage`, лишние переспрашивания.
3. Ошибки в scoring правилах -> ложные квалификации/отказы.
4. Outbound зависимость от внешней CRM -> DLQ рост.
5. Риски ПДн при ошибках логирования и неверной ролевой модели.

### 14.2 Митигации

- Фоллбек-режимы и кнопки takeover.
- Версионирование схем/правил и dry-run.
- Лимиты/алерты на SLA и DLQ.
- Регулярные security regression tests.

### 14.3 Фичи Post-MVP

- Мультиканальность (WhatsApp/Viber/Webchat).
- Умная маршрутизация лидов по командам/компетенциям.
- A/B тест промптов и стратегий переспрашивания.
- ML-оценка вероятности конверсии.
- No-code редактор схем с визуальным валидатором.

---

## Приложение A: JSON-схемы ниш

### A.1 `appliance_repair`

```json
{
  "niche": "appliance_repair",
  "version": "1.0.0",
  "requiredCoverage": 0.8,
  "fields": [
    { "key": "device_type", "type": "enum", "required": true, "values": ["washer", "dishwasher", "fridge", "oven"] },
    { "key": "issue_type", "type": "string", "required": true, "maxLength": 200 },
    { "key": "brand", "type": "string", "required": false },
    { "key": "city", "type": "string", "required": true },
    { "key": "preferred_time", "type": "enum", "required": false, "values": ["morning", "day", "evening", "after_18"] },
    { "key": "contact_phone", "type": "phone", "required": true }
  ]
}
```

### A.2 `tool_rental`

```json
{
  "niche": "tool_rental",
  "version": "1.0.0",
  "requiredCoverage": 0.75,
  "fields": [
    { "key": "tool_type", "type": "enum", "required": true, "values": ["drill", "grinder", "concrete_mixer", "ladder"] },
    { "key": "rental_period_days", "type": "number", "required": true, "minimum": 1, "maximum": 60 },
    { "key": "city", "type": "string", "required": true },
    { "key": "delivery_needed", "type": "boolean", "required": false },
    { "key": "start_date", "type": "date", "required": true },
    { "key": "contact_phone", "type": "phone", "required": true }
  ]
}
```

### A.3 `care_para_medical`

```json
{
  "niche": "care_para_medical",
  "version": "1.0.0",
  "requiredCoverage": 0.85,
  "fields": [
    { "key": "service_kind", "type": "enum", "required": true, "values": ["nurse_visit", "post_surgery_care", "elderly_support", "rehab_assistant"] },
    { "key": "urgency", "type": "enum", "required": true, "values": ["low", "medium", "high", "critical"] },
    { "key": "patient_age", "type": "number", "required": false, "minimum": 0, "maximum": 120 },
    { "key": "city", "type": "string", "required": true },
    { "key": "address_zone", "type": "string", "required": false },
    { "key": "contact_phone", "type": "phone", "required": true },
    { "key": "consent_personal_data", "type": "boolean", "required": true }
  ]
}
```

---

## Приложение B: SQL примеры метрик

### B.1 Qualified Rate по дням

```sql
SELECT
  date_trunc('day', l.created_at) AS day,
  COUNT(*) FILTER (WHERE l.status = 'qualified')::numeric
    / NULLIF(COUNT(*), 0) AS qualified_rate
FROM lead l
WHERE l.created_at >= now() - interval '30 days'
GROUP BY 1
ORDER BY 1;
```

### B.2 Средний $T_{first}$ (в минутах)

```sql
WITH first_client_message AS (
  SELECT
    m.lead_id,
    MIN(m.created_at) AS first_client_at
  FROM message m
  WHERE m.author_type = 'client'
  GROUP BY m.lead_id
),
first_operator_or_bot_message AS (
  SELECT
    m.lead_id,
    MIN(m.created_at) AS first_reply_at
  FROM message m
  WHERE m.author_type IN ('operator', 'bot')
  GROUP BY m.lead_id
)
SELECT
  AVG(EXTRACT(EPOCH FROM (r.first_reply_at - c.first_client_at)) / 60.0) AS t_first_avg_min
FROM first_client_message c
JOIN first_operator_or_bot_message r USING (lead_id)
WHERE r.first_reply_at >= c.first_client_at;
```

### B.3 Топ причин потерь

```sql
SELECT
  l.loss_reason,
  COUNT(*) AS leads_count
FROM lead l
WHERE l.status IN ('not_target', 'no_answer', 'lost', 'spam_test', 'duplicate')
  AND l.updated_at >= now() - interval '30 days'
GROUP BY l.loss_reason
ORDER BY leads_count DESC
LIMIT 10;
```
