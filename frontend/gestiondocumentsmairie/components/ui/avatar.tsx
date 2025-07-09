// components/ui/avatar.tsx
"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full"
);

export const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(avatarVariants(), className)} {...props} />
  )
);
Avatar.displayName = "Avatar";

export const AvatarImage = ({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <img
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  );
};

export const AvatarFallback = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  )
);
AvatarFallback.displayName = "AvatarFallback";
