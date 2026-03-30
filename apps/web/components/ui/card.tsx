import type { HTMLAttributes, PropsWithChildren } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ children, className = "", ...props }: PropsWithChildren<CardProps>) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: PropsWithChildren<CardProps>) {
  return (
    <div className={`mb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }: PropsWithChildren<CardProps>) {
  return (
    <h3 className={`text-base font-semibold text-slate-900 dark:text-slate-100 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", ...props }: PropsWithChildren<CardProps>) {
  return (
    <p className={`mt-1 text-sm text-slate-500 dark:text-slate-400 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }: PropsWithChildren<CardProps>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
