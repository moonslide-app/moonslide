import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { VariantProps, cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground-secondary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background-primary',
    {
        variants: {
            variant: {
                default: 'bg-foreground-primary text-background-primary hover:bg-foreground-primary/90',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                outline:
                    'border border-foreground-tertiary hover:bg-background-secondary hover:text-foreground-secondary',
                secondary: 'bg-foreground-secondary text-background-secondary hover:bg-foreground-secondary/80',
                ghost: 'hover:bg-background-secondary hover:text-foreground-secondary',
                link: 'underline-offset-4 hover:underline text-foreground-primary',
            },
            size: {
                default: 'h-10 py-2 px-4',
                sm: 'h-9 px-3 rounded-md',
                lg: 'h-11 px-8 rounded-md',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button'
        return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
