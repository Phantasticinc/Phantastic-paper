import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-xs font-medium tracking-wide text-muted", className)}
      onMouseDown={(e) => {
        if (
          (e.target as HTMLElement).closest("button, input, select, textarea")
        )
          return;
        props.onMouseDown?.(e);
        if (!e.defaultPrevented && e.detail > 1) e.preventDefault();
      }}
      {...props}
    />
  );
}
