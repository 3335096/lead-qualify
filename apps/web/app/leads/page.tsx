import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";

const leads = [
  { id: "lead-101", status: "in_qualification", score: 28, coverage: 0.56 },
  { id: "lead-102", status: "qualified", score: 54, coverage: 0.92 },
  { id: "lead-103", status: "duplicate", score: 0, coverage: 0.41 },
];

export default function LeadsPage() {
  return (
    <PageShell title="Leads" subtitle="Список лидов с ключевыми метриками">
      <div className="space-y-3">
        {leads.map((lead) => (
          <Card key={lead.id}>
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="font-medium">{lead.id}</div>
                <div className="text-slate-500">{lead.status}</div>
              </div>
              <div className="text-right">
                <div>score: {lead.score}</div>
                <div>coverage: {(lead.coverage * 100).toFixed(0)}%</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
