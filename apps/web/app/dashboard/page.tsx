import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";

const metrics = [
  { label: "Всего лидов", value: "128" },
  { label: "Qualified", value: "54" },
  { label: "Auto-qualified", value: "21" },
  { label: "Средний SLA ответа", value: "2м 31с" },
];

export default function DashboardPage() {
  return (
    <PageShell title="Dashboard" subtitle="Сводка конверсий и SLA">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <Card key={item.label}>
            <div className="text-sm text-zinc-500">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold">{item.value}</div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
