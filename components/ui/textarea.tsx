import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[90px] w-full rounded-md border border-forest-900/20 bg-white px-3 py-2 text-sm text-forest-950 placeholder:text-forest-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
