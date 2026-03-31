import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lead Qualify CRM",
  description: "Inbox and qualification dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
