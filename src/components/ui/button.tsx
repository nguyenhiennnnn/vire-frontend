import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/30 active:shadow-sm",
        outline:
          "border-border bg-background text-foreground hover:bg-secondary hover:border-primary/30 hover:text-primary dark:border-input dark:bg-input/20 dark:hover:bg-secondary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70 active:bg-secondary",
        ghost:
          "text-muted-foreground hover:bg-secondary hover:text-foreground dark:hover:bg-muted/40",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/30",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
        social:
          "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground shadow-none hover:shadow-sm hover:shadow-primary/20 border border-transparent hover:border-primary/10",
        like: "text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5",
        "action-fill":
          "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-semibold",
      },
      size: {
        default: "h-9 gap-1.5 px-4",
        xs: "h-6 gap-1 rounded-full px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-full px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-6 text-base",
        xl: "h-13 gap-2 px-8 text-base font-bold tracking-wide",
        icon: "size-9 rounded-full",
        "icon-xs": "size-6 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-full [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 rounded-full",
        "icon-xl": "size-12 rounded-full [&_svg:not([class*='size-'])]:size-5",
        pill: "h-9 gap-1.5 px-5 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
