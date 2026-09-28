import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-9 w-full rounded-md border border-slate-700 bg-[#191b20] px-3 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-slate-500", className)} {...props} />;
}
