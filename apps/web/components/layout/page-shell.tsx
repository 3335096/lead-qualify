import type { ReactNode } from "react";
import Link from "next/link";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inbox", label: "Inbox" },
  { href: "/leads", label: "Leads" },
  { href: "/settings/schemas", label: "Schemas" },
  { href: "/settings/dictionaries", label: "Dictionaries" },
  { href: "/settings/integrations/outbound", label: "Outbound" },
  { href: "/settings/sla", label: "SLA" },
];

export function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8">
      <header className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{subtitle}</p> : null}
          </div>
          <Link href="/login" className="text-sm text-slate-600 hover:underline dark:text-slate-300">
            Login
          </Link>
        </div>
        <nav className="flex flex-wrap gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md border border-slate-200 px-3 py-1 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
