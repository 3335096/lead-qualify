import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsSlaPage() {
  return (
    <PageShell
      title="SLA settings"
      subtitle="T_first=3 min, T_inactivity=24h. Настройка напоминаний, эскалаций и автозакрытий."
    >
      <Card>
        <CardHeader>
          <CardTitle>Rules</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-700">
          <ul className="list-disc pl-5 space-y-1">
            <li>First response timeout: 3 minutes</li>
            <li>Inactivity timeout: 24 hours</li>
            <li>Escalation path: manager -&gt; admin</li>
          </ul>
        </CardContent>
      </Card>
    </PageShell>
  );
}
