import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Вход в workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Workspace ID" />
          <Input placeholder="User ID" />
          <Button className="w-full">Войти</Button>
        </CardContent>
      </Card>
    </main>
  );
}
