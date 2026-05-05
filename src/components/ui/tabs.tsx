import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "../../lib/utils";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-horizontal/tabs:h-9 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "rounded-full bg-secondary/70 p-1 dark:bg-muted/60",
        line: "gap-1 rounded-none bg-transparent border-b border-border px-0",
        pills: "gap-1 bg-transparent rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-2px)] flex-1 items-center justify-center gap-1.5 border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-all duration-200 group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",

        "group-data-[variant=default]/tabs-list:rounded-full group-data-[variant=default]/tabs-list:text-muted-foreground group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm dark:group-data-[variant=default]/tabs-list:data-active:bg-card",

        "group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:border-0 group-data-[variant=line]/tabs-list:pb-2 group-data-[variant=line]/tabs-list:text-muted-foreground group-data-[variant=line]/tabs-list:data-active:text-primary group-data-[variant=line]/tabs-list:data-active:font-semibold after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity group-data-[variant=line]/tabs-list:data-active:after:opacity-100",

        "group-data-[variant=pills]/tabs-list:rounded-full group-data-[variant=pills]/tabs-list:px-4 group-data-[variant=pills]/tabs-list:text-muted-foreground group-data-[variant=pills]/tabs-list:data-active:bg-primary group-data-[variant=pills]/tabs-list:data-active:text-primary-foreground group-data-[variant=pills]/tabs-list:data-active:shadow-sm group-data-[variant=pills]/tabs-list:data-active:shadow-primary/25 group-data-[variant=pills]/tabs-list:hover:bg-secondary group-data-[variant=pills]/tabs-list:data-active:hover:bg-primary",

        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
