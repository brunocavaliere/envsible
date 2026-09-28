import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

export const Checkbox = ({ className, ...props }: CheckboxPrimitive.CheckboxProps) => (
  <CheckboxPrimitive.Root className={cn("grid h-4 w-4 shrink-0 place-items-center rounded border border-slate-600 bg-[#191b20] text-[#101114] outline-none data-[state=checked]:border-[#b9f6cf] data-[state=checked]:bg-[#b9f6cf]", className)} {...props}>
    <CheckboxPrimitive.Indicator><Check size={13} strokeWidth={3} /></CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
