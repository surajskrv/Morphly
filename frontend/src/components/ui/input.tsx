import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-2xl border border-input bg-background/88 px-4 py-2 text-sm text-foreground shadow-[inset_0_1px_0_oklch(1_0_0_/_25%)] transition-[border-color,box-shadow,background-color] outline-none placeholder:text-muted-foreground focus-visible:border-primary/45 focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-ring/12 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/60 disabled:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/12 file:mr-3 file:rounded-xl file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary",
        className
      )}
      {...props}
    />
  );
}

export { Input };
