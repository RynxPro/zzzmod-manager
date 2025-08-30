import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-gaming-accent-cyan text-gaming-bg hover:bg-gaming-accent-cyan/90",
        destructive:
          "bg-gaming-status-error text-white hover:bg-gaming-status-error/90",
        outline:
          "border border-gaming-border bg-transparent hover:bg-gaming-bg-overlay/50",
        secondary:
          "bg-gaming-bg-overlay/50 text-gaming-text-primary hover:bg-gaming-bg-overlay/70",
        ghost: "hover:bg-gaming-bg-overlay/50",
        link: "text-gaming-accent-cyan underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-xl",
        icon: "h-10 w-10",
      },
      loading: {
        true: "pointer-events-none opacity-70",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, loading }), className)}
        ref={ref}
        disabled={loading || props.disabled}
        aria-busy={loading}
        aria-live="polite"
        {...props}
      >
        {loading ? (
          <span className="mr-2 inline-block animate-spin h-4 w-4 border-2 border-t-transparent border-gaming-accent-cyan rounded-full" />
        ) : icon ? (
          <span className={size === "icon" ? "" : "mr-2"}>{icon}</span>
        ) : null}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
