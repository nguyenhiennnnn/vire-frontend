import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm shadow-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        destructive:
          "bg-destructive/10 text-destructive dark:bg-destructive/20",
        outline: "border-border text-foreground bg-background",
        ghost: "bg-muted/60 text-muted-foreground",
        online: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        live: "bg-destructive text-primary-foreground animate-pulse shadow-sm shadow-destructive/30",
        new: "bg-primary/10 text-primary border-primary/20 border",
        count:
          "bg-primary text-primary-foreground min-w-[1.25rem] px-1 tabular-nums shadow-sm shadow-primary/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge };
