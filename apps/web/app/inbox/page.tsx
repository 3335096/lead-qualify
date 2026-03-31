import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const chats = [
  { id: "conv-1", title: "ООО Ромашка", status: "in_qualification" },
  { id: "conv-2", title: "ИП Петров", status: "awaiting_client" },
];

export default function InboxPage() {
  return (
    <PageShell title="Inbox" subtitle="Диалоги и карточки лидов">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold">Список диалогов</h2>
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-700"
              >
                <p className="font-medium">{chat.title}</p>
                <p className="text-xs text-slate-500">Статус: {chat.status}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Карточка диалога</h2>
          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <p>Здесь отображается история сообщений и форма ответа в Telegram.</p>
            <div className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
              <p className="mb-2 text-slate-500">Изменение статуса</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">qualified</Button>
                <Button variant="outline">awaiting_operator</Button>
                <Button variant="outline">lost + reason_code</Button>
              </div>
            </div>
            <Button>Отправить ответ в Telegram</Button>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
