"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "default" | "outline" | "ghost";

const variantClasses: Record<Variant, string> = {
  default: "bg-zinc-900 text-white hover:bg-zinc-700",
  outline: "border border-zinc-300 text-zinc-800 hover:bg-zinc-100",
  ghost: "text-zinc-700 hover:bg-zinc-100",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "default", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
