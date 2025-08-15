import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

export const buttonVariants = cva(
  "bg-primary text-white px-4 py-2 rounded-md hover:scale-105 ease-in-out duration-500 transition-all cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        danger: "bg-danger text-danger-foreground",
        success: "bg-success text-success-foreground",
        warning: "bg-warning text-warning-foreground",
        info: "bg-info text-info-foreground",
        dark: "bg-dark text-dark-foreground",
        light: "bg-light text-black border border-gray-300",
        link: "bg-transparent text-primary",
        ghost: "bg-transparent dark:bg-gray-600 text-dark dark:text-dark",
        outlinePrimary: "bg-transparent border border-primary text-primary",
        outlineSecondary:
          "bg-transparent border border-secondary text-secondary",
        outlineDanger: "bg-transparent border border-danger text-danger",
        outlineSuccess: "bg-transparent border border-success text-success",
        outlineWarning: "bg-transparent border border-warning text-warning",
        outlineInfo: "bg-transparent border border-info text-info",
        outlineDark: "bg-transparent border border-dark text-dark",
        outlineLight: "bg-transparent border border-light text-light",
        capsulePrimary: "bg-primary text-white px-4 py-2 rounded-full",
        capsuleSecondary: "bg-secondary text-white px-4 py-2 rounded-full",
        capsuleDanger: "bg-danger text-white px-4 py-2 rounded-full",
        capsuleSuccess: "bg-success text-white px-4 py-2 rounded-full",
        capsuleWarning: "bg-warning text-white px-4 py-2 rounded-full",
        capsuleInfo: "bg-info text-white px-4 py-2 rounded-full",
        capsuleDark: "bg-dark text-white px-4 py-2 rounded-full",
        capsuleLight: "bg-light text-white px-4 py-2 rounded-full",
      },
      size: {
        full: "w-full",
        sm: "px-2 py-1 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
        xl: "px-8 py-4 text-xl",
      },
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
