import React from "react";
import { cn } from "@/lib/utils";

export const Alert = ({ className, ...props }) => (
  <div
    role="alert"
    className={cn(
      "rounded-md border px-4 py-3 text-sm shadow-sm",
      className
    )}
    {...props}
  />
);

export const AlertDescription = ({ className, ...props }) => (
  <div className={cn("text-sm", className)} {...props} />
);
