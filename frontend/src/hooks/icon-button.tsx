import * as React from "react";
import { cn } from "./utils";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

export function IconButton({
  className,
  children,
  isActive = false,
  ...props
}: IconButtonProps) {
  return (
    <button
      style={{ 
        backgroundColor: 'transparent',
        borderTop: 'none',
        borderLeft: 'none', 
        borderRight: 'none',
        borderRadius: 0,
        borderBottom: isActive ? '1px solid #22d3ee' : '1px solid transparent',
        outline: 'none'
      }}
      className={cn(
        "inline-flex items-center justify-center transition-all",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
