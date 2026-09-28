import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({ className, ...props }: TooltipPrimitive.TooltipContentProps) {
  return <TooltipPrimitive.Portal><TooltipPrimitive.Content className={cn("z-50 rounded-md border border-slate-700 bg-[#24272e] px-2 py-1.5 text-xs text-slate-100 shadow-xl", className)} sideOffset={6} {...props} /></TooltipPrimitive.Portal>;
}
