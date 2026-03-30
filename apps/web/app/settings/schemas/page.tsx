import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";

export default function SchemasSettingsPage() {
  return (
    <PageShell title="Settings / Schemas" subtitle="CRUD схем по нишам и версиям.">
      <Card className="p-4 text-sm text-gray-300">
        Эндпоинты: POST/GET/PATCH/DELETE /v1/schemas и фильтр GET ?niche=
      </Card>
    </PageShell>
  );
}
