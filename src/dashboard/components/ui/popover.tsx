import * as PopoverPrimitive from "@radix-ui/react-popover";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export function PopoverContent({ className = "", ...props }: PopoverPrimitive.PopoverContentProps) {
  return <PopoverPrimitive.Portal><PopoverPrimitive.Content className={`z-10 w-[250px] rounded-lg border border-slate-700 bg-[#191b20] p-2 text-slate-200 shadow-2xl ${className}`} sideOffset={8} {...props} /></PopoverPrimitive.Portal>;
}
