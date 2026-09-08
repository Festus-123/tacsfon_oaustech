import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-forest-800 text-white shadow hover:bg-forest-900 border border-forest-700/50",
        destructive:
          "bg-red-600 text-white shadow-xs hover:bg-red-700 focus-visible:ring-red-500",
        outline:
          "border border-forest-800/20 bg-transparent text-forest-900 hover:bg-forest-50 hover:border-forest-800/40",
        secondary:
          "bg-forest-100 text-forest-900 hover:bg-forest-200/80",
        ghost:
          "text-forest-900 hover:bg-forest-50 hover:text-forest-950",
        link: "text-forest-800 underline-offset-4 hover:underline",
        gold: "bg-gold-500 text-forest-950 font-semibold shadow-xs hover:bg-gold-400 border border-gold-400/40",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
