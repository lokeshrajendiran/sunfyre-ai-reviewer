import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
    
    const variantStyles = {
      default: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm hover:shadow-md dark:bg-blue-500 dark:hover:bg-blue-600",
      destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm hover:shadow-md dark:bg-red-500 dark:hover:bg-red-600",
      outline: "border border-gray-300 bg-transparent hover:bg-gray-100 hover:border-gray-400 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:border-gray-600",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
      link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
      gradient: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md dark:bg-blue-500 dark:hover:bg-blue-600"
    }
    
    const sizeStyles = {
      default: "h-11 px-5 py-2.5 text-sm",
      sm: "h-9 px-3.5 py-2 text-xs",
      lg: "h-12 px-7 py-3 text-base",
      icon: "h-11 w-11 p-0"
    }
    
    return (
      <Comp
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
