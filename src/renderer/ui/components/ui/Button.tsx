import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-moon-bg disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: "bg-gaming-accent-cyan text-gaming-bg hover:bg-gaming-accent-cyan/90",
        accent: "bg-gradient-to-r from-moon-glowViolet to-moon-glowCyan text-moon-bg hover:opacity-90",
        destructive: "bg-gaming-status-error text-white hover:bg-gaming-status-error/90",
        outline: "border border-gaming-border bg-transparent hover:bg-gaming-bg-overlay/50",
        secondary: "bg-gaming-bg-overlay/50 text-gaming-text-primary hover:bg-gaming-bg-overlay/70",
        ghost: "hover:bg-gaming-bg-overlay/50",
        link: "text-gaming-accent-cyan underline-offset-4 hover:underline",
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
