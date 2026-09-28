import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Button({ className, variant = "default", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" }) {
  return <button className={cn("inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50", variant === "ghost" ? "border-transparent bg-transparent text-slate-400 hover:bg-slate-800" : variant === "outline" ? "border-slate-700 bg-[#191b20] text-slate-200 hover:border-slate-600 hover:bg-slate-800" : "border-[#b9f6cf] bg-[#b9f6cf] text-[#101114] hover:bg-[#a5e8bd]", className)} {...props} />;
}
