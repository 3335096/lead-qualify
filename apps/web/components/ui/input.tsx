import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input(props: InputProps) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-offset-2 transition focus:ring-2 focus:ring-slate-400 ${props.className ?? ""}`}
    />
  );
}
