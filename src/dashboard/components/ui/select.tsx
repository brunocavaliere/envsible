import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: SelectPrimitive.SelectTriggerProps) {
  return <SelectPrimitive.Trigger className={cn("inline-flex h-9 min-w-[154px] items-center justify-between gap-4 rounded-md border border-slate-700 bg-[#191b20] px-3 text-[13px] text-slate-200 outline-none focus:border-slate-500", className)} {...props}>{children}<SelectPrimitive.Icon><ChevronDown size={14} /></SelectPrimitive.Icon></SelectPrimitive.Trigger>;
}

export function SelectContent({ className, children, ...props }: SelectPrimitive.SelectContentProps) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content className={cn("z-20 min-w-[154px] rounded-lg border border-slate-700 bg-[#191b20] p-1.5 text-slate-200 shadow-2xl", className)} position="popper" {...props}><SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal>;
}

export function SelectItem({ className, children, ...props }: SelectPrimitive.SelectItemProps) {
  return <SelectPrimitive.Item className={cn("flex cursor-pointer items-center justify-between rounded px-2 py-2 text-[13px] outline-none data-[highlighted]:bg-slate-800 data-[state=checked]:text-[#b9f6cf]", className)} {...props}><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText><SelectPrimitive.ItemIndicator><Check size={14} /></SelectPrimitive.ItemIndicator></SelectPrimitive.Item>;
}
