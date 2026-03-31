# Обзор проекта

Компоненты:
- Telegram-бот: LLM-экстракция по схеме, уточняющие вопросы, скоринг.
- Веб-настройки: схемы, словари (Google Sheets), SLA, outbound.
- CRM-inbox и дашборд.

Порог квалификации: $coverage \ge 0.8$ и $score \ge 40$.
SLA: $T_{first}=3$ мин, $T_{inactivity}=24$ ч.

Статусы: new, in_qualification, awaiting_client, awaiting_operator, qualified, in_contact, won, not_target, no_answer, duplicate, spam_test, lost.

Ниши (MVP): appliance_repair, tool_rental, care_para_medical.

Ключевые метрики:
- $Qualified\ Rate$, $T_{first}$, $T_{qual}$, $AutoQ\ Rate$, $SLA\_breach$.
