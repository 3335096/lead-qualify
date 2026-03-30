import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";

export default function OutboundIntegrationsPage() {
  return (
    <PageShell title="Outbound integrations" subtitle="Endpoint mapping and retry policy">
      <Card>
        <CardHeader>
          <CardTitle>Webhook target</CardTitle>
          <CardDescription>
            Configure endpoint, headers and body mapping for qualified leads export.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-200">
          Method: POST | Retries: 3 | Active: true
        </CardContent>
      </Card>
    </PageShell>
  );
}
