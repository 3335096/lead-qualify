import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";

export default function DictionariesSettingsPage() {
  return (
    <PageShell title="Настройки словарей" subtitle="CRUD словарей и sync с Google Sheets.">
      <Card>
        <h3 className="mb-2 text-base font-semibold">Dictionaries</h3>
        <ul className="list-disc pl-5 text-sm text-slate-600">
          <li>Источник: manual / sheets.</li>
          <li>Хранение sheet_url + sheet_map.</li>
          <li>Используются reason_code и бизнес-справочники.</li>
        </ul>
      </Card>
    </PageShell>
  );
}
